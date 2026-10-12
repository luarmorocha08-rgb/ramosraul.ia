import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanText } from "@/lib/sanitize";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const MIN_FILL_MS = 3_000;

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  }

  const ip = clientIp(req);
  const burst = rateLimit(`contact:min:${ip}`, 3, 60_000);
  const daily = rateLimit(`contact:day:${ip}`, 10, 86_400_000);
  if (!burst.ok || !daily.ok) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    // honeypot preenchido: responde como sucesso para não dar pistas ao bot
    if (fieldErrors.website) return NextResponse.json({ ok: true, stored: false });
    return NextResponse.json({ error: "Verifique os campos destacados.", fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  if (Date.now() - data.startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Backend não configurado: não fingimos que a mensagem foi entregue.
    return NextResponse.json({ ok: false, stored: false, reason: "unconfigured" }, { status: 503 });
  }

  const { error } = await supabase.from("leads").insert({
    name: cleanText(data.name, 120),
    email: data.email,
    project_type: data.projectType,
    description: cleanText(data.description, 4000),
    budget: data.budget ?? null,
    consent: true,
    source: "website",
    user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
  });

  if (error) {
    console.error("[contact] supabase insert failed", error.message);
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente novamente ou use outro canal." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, stored: true });
}
