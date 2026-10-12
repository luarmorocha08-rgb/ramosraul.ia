import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/** Cliente Anthropic (somente servidor). A chave nunca chega ao navegador. */
export function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 60_000, maxRetries: 1 });
  return client;
}

/**
 * Beta de fallback no servidor: se um classificador de segurança recusar a
 * requisição, a API refaz automaticamente com o modelo recomendado.
 */
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";

export function describeAiError(error: unknown): { status: number; message: string } {
  if (error instanceof Anthropic.RateLimitError) {
    return { status: 429, message: "O serviço de IA está com alta demanda. Tente novamente em instantes." };
  }
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return { status: 503, message: "A integração de IA não está autorizada no momento." };
  }
  if (error instanceof Anthropic.BadRequestError) {
    return { status: 400, message: "Não foi possível processar essa solicitação." };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return { status: 503, message: "Não foi possível conectar ao serviço de IA." };
  }
  if (error instanceof Anthropic.APIError) {
    return { status: 502, message: "O serviço de IA retornou um erro. Tente novamente." };
  }
  return { status: 500, message: "Erro inesperado ao gerar a resposta." };
}
