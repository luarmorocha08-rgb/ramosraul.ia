import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { aiConfig } from "./config";
import { clientIp, rateLimit } from "../rate-limit";

const SID_COOKIE = "rr_sid";
const DAY = 86_400_000;

/**
 * Aplica limites de uso e custo para endpoints de IA:
 *  - por IP (requisições/minuto)
 *  - por sessão (requisições/dia), via cookie httpOnly
 *  - por IP (dia) — evita contornar o limite apagando cookies
 *  - teto global diário (proteção de custo)
 * Retorna uma resposta 429 quando algum limite é atingido.
 */
export async function guardAi(req: Request, scope: string): Promise<NextResponse | null> {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  }

  const jar = await cookies();
  let sid = jar.get(SID_COOKIE)?.value;
  if (!sid || !/^[a-f0-9-]{36}$/.test(sid)) {
    sid = crypto.randomUUID();
    jar.set(SID_COOKIE, sid, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: DAY / 1000, path: "/" });
  }
  const ip = clientIp(req);

  const checks = [
    rateLimit(`ai:min:${ip}`, aiConfig.perMinute, 60_000),
    rateLimit(`ai:sid:${sid}`, aiConfig.perSessionDaily, DAY),
    rateLimit(`ai:ipday:${ip}`, aiConfig.perSessionDaily * 3, DAY),
    rateLimit(`ai:global`, aiConfig.globalDaily, DAY),
  ];
  const blocked = checks.find((c) => !c.ok);
  if (blocked) {
    return NextResponse.json(
      { error: "Limite de uso atingido para esta sessão. Tente novamente mais tarde.", scope },
      { status: 429, headers: { "Retry-After": String(blocked.retryAfterSec) } },
    );
  }
  return null;
}
