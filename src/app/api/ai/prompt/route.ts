import { structuredHandler } from "@/lib/ai/structured";
import { IMPROVEMENT_KINDS, normalizeOneOf, promptLabWireSchema, type PromptLab } from "@/lib/ai/schemas";
import { PROMPT_LAB_SYSTEM } from "@/lib/ai/prompts";
import { demoPrompt } from "@/lib/ai/demo";

export const runtime = "nodejs";

export const POST = structuredHandler({
  scope: "prompt",
  schema: promptLabWireSchema,
  system: PROMPT_LAB_SYSTEM,
  userMessage: (input) => `Solicitação original a ser aprimorada:\n<solicitacao>\n${input}\n</solicitacao>`,
  demo: demoPrompt,
  refine: (d): PromptLab => ({
    ...d,
    improvements: d.improvements.slice(0, 6).map((i) => ({ ...i, kind: normalizeOneOf(i.kind, IMPROVEMENT_KINDS, "quality") })),
  }),
});
