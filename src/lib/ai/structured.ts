import "server-only";
import { NextResponse } from "next/server";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { aiConfig } from "./config";
import { describeAiError, FALLBACK_BETA, getAnthropic } from "./client";
import { guardAi } from "./guard";
import { textInputSchema, type AiResult } from "./schemas";
import { cleanText } from "../sanitize";

interface StructuredRoute<W, T> {
  scope: string;
  /** schema enviado ao modelo (formato "de fio") */
  schema: z.ZodType<W>;
  system: string;
  /** Monta a mensagem do usuário a partir da entrada já sanitizada. */
  userMessage: (input: string) => string;
  demo: (input: string) => T;
  /** Converte/normaliza a saída do modelo para o formato usado pela UI. */
  refine: (data: W, input: string) => T;
  maxTokens?: number;
}

const DEMO_NOTICE = "Modo demonstração: resultado gerado por regras locais, não por um modelo de IA.";

/**
 * Handler genérico para ferramentas de IA com saída estruturada:
 * valida entrada → aplica limites → chama o modelo (ou o motor de demo)
 * → valida a saída com Zod → responde JSON.
 */
export function structuredHandler<W, T>(route: StructuredRoute<W, T>) {
  return async function POST(req: Request) {
    const limited = await guardAi(req, route.scope);
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    const parsed = textInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Entrada inválida." }, { status: 400 });
    }
    const input = cleanText(parsed.data.input, 1200);

    const client = getAnthropic();
    if (!client) {
      const result: AiResult<T> = { mode: "demo", data: route.demo(input), notice: DEMO_NOTICE };
      return NextResponse.json(result);
    }

    try {
      const response = await client.beta.messages.parse({
        model: aiConfig.model,
        max_tokens: route.maxTokens ?? 4000,
        betas: [FALLBACK_BETA],
        fallbacks: "default",
        output_config: { effort: aiConfig.effort, format: betaZodOutputFormat(route.schema) },
        system: route.system,
        messages: [{ role: "user", content: route.userMessage(input) }],
      });

      if (response.stop_reason === "refusal") {
        return NextResponse.json({ error: "Essa solicitação não pôde ser processada. Tente descrever de outra forma." }, { status: 422 });
      }
      if (response.stop_reason === "max_tokens" || !response.parsed_output) {
        return NextResponse.json({ error: "A resposta veio incompleta. Tente novamente." }, { status: 502 });
      }
      const data = route.refine(response.parsed_output as W, input);
      const result: AiResult<T> = { mode: "live", data };
      return NextResponse.json(result);
    } catch (error) {
      const { status, message } = describeAiError(error);
      console.error(`[ai:${route.scope}]`, error);
      return NextResponse.json({ error: message }, { status });
    }
  };
}
