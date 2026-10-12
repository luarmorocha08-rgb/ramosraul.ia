import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai/config";
import { describeAiError, FALLBACK_BETA, getAnthropic } from "@/lib/ai/client";
import { guardAi } from "@/lib/ai/guard";
import { chatInputSchema } from "@/lib/ai/schemas";
import { CHAT_SYSTEM } from "@/lib/ai/prompts";
import { demoChatReply } from "@/lib/ai/demo";
import { cleanText } from "@/lib/sanitize";

export const runtime = "nodejs";

/** Marcador enviado no fim do stream quando algo dá errado no meio da resposta. */
const ERROR_MARKER = "\u0000ERR:";

export async function POST(req: Request) {
  const limited = await guardAi(req, "chat");
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = chatInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });

  // Conversa precisa começar pelo usuário e terminar com uma pergunta do usuário.
  const messages = parsed.data.messages
    .map((m) => ({ role: m.role, content: cleanText(m.content, 2000) }))
    .filter((m) => m.content.length > 0);
  while (messages.length && messages[0]!.role !== "user") messages.shift();
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });

  const client = getAnthropic();
  if (!client) {
    return NextResponse.json({ mode: "demo", reply: demoChatReply(last.content) });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = client.beta.messages.stream(
          {
            model: aiConfig.model,
            max_tokens: 2000,
            betas: [FALLBACK_BETA],
            fallbacks: "default",
            output_config: { effort: aiConfig.effort },
            system: CHAT_SYSTEM,
            messages,
          },
          { signal: req.signal },
        );
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await response.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nNão posso ajudar com isso por aqui — mas Raul pode conversar com você diretamente pela seção de contato."));
        }
      } catch (error) {
        if (!req.signal.aborted) {
          console.error("[ai:chat]", error);
          controller.enqueue(encoder.encode(ERROR_MARKER + describeAiError(error).message));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-AI-Mode": "live",
    },
  });
}
