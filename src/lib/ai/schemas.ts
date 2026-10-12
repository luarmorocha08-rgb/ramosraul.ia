import { z } from "zod";

/* ─── Entradas (validadas no servidor) ─────────────────────────────── */

export const chatInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export const textInputSchema = z.object({
  input: z.string().trim().min(8, "Descreva um pouco mais (mínimo de 8 caracteres).").max(1200),
});

/* ─── Saídas estruturadas ───────────────────────────────────────────
 * Campos categóricos são strings livres no "fio" (o SDK converte enums em
 * dicas de descrição); o servidor normaliza para os valores permitidos.
 */

const oneOf = <T extends string>(values: readonly T[]) => z.string().describe(`Exatamente um de: ${values.map((v) => `"${v}"`).join(", ")}`);

export const OPPORTUNITY_CATEGORIES = ["automation", "website", "agent", "support", "digital"] as const;
export const IMPACT_LEVELS = ["alto", "médio", "baixo"] as const;
export const COMPLEXITY_LEVELS = ["alta", "média", "baixa"] as const;
export const IMPROVEMENT_KINDS = ["role", "context", "task", "constraints", "format", "examples", "quality"] as const;

/** Normaliza uma string do modelo para um valor permitido (com fallback). */
export function normalizeOneOf<T extends string>(value: string, values: readonly T[], fallback: T): T {
  const clean = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  return values.find((v) => clean(v) === clean(value)) ?? fallback;
}

export const analysisWireSchema = z.object({
  segment: z.string().describe("Segmento do negócio identificado, em poucas palavras"),
  summary: z.string().describe("Diagnóstico em 1-2 frases"),
  opportunities: z
    .array(
      z.object({
        title: z.string(),
        category: oneOf(OPPORTUNITY_CATEGORIES),
        description: z.string(),
        impact: oneOf(IMPACT_LEVELS),
        complexity: oneOf(COMPLEXITY_LEVELS),
      }),
    )
    .describe("4 a 6 oportunidades"),
  agents: z.array(z.object({ name: z.string(), role: z.string() })).describe("2 a 3 agentes inteligentes sugeridos"),
  websiteFeatures: z.array(z.string()).describe("3 a 5 funcionalidades para o site"),
  flow: z.array(z.string()).describe("4 a 5 etapas de um fluxo de automação de atendimento"),
  nextStep: z.string().describe("Primeiro passo recomendado"),
});
type AnalysisWire = z.infer<typeof analysisWireSchema>;
export interface Analysis extends Omit<AnalysisWire, "opportunities"> {
  opportunities: Array<{
    title: string;
    category: (typeof OPPORTUNITY_CATEGORIES)[number];
    description: string;
    impact: (typeof IMPACT_LEVELS)[number];
    complexity: (typeof COMPLEXITY_LEVELS)[number];
  }>;
}

export const conceptSchema = z.object({
  projectName: z.string(),
  tagline: z.string(),
  visualDirection: z.string().describe("Direção visual em 1-2 frases"),
  mood: z.array(z.string()).describe("3 a 4 palavras-chave de estilo"),
  palette: z
    .array(z.object({ name: z.string(), hex: z.string().describe("Cor em formato #RRGGBB"), role: z.string() }))
    .describe("Exatamente 5 cores: fundo, superfície, texto, destaque, secundária"),
  typography: z.object({ display: z.string(), body: z.string() }),
  sections: z.array(z.object({ name: z.string(), purpose: z.string() })).describe("5 a 7 seções"),
  features: z.array(z.string()).describe("4 a 6 funcionalidades"),
  hero: z.object({ headline: z.string(), subheadline: z.string(), cta: z.string() }),
});
export type Concept = z.infer<typeof conceptSchema>;

export const promptLabWireSchema = z.object({
  engineeredPrompt: z.string(),
  improvements: z
    .array(
      z.object({
        kind: oneOf(IMPROVEMENT_KINDS),
        label: z.string(),
        description: z.string(),
      }),
    )
    .describe("4 a 6 melhorias aplicadas"),
});
export type PromptLabWire = z.infer<typeof promptLabWireSchema>;
export interface PromptLab {
  engineeredPrompt: string;
  improvements: Array<{ kind: (typeof IMPROVEMENT_KINDS)[number]; label: string; description: string }>;
}

export const briefSchema = z.object({
  title: z.string(),
  projectType: z.string(),
  summary: z.string(),
  objectives: z.array(z.string()).describe("2 a 4 objetivos"),
  features: z.array(z.string()).describe("3 a 6 funcionalidades"),
  questions: z.array(z.string()).describe("2 a 4 perguntas para alinhar o projeto"),
});
export type Brief = z.infer<typeof briefSchema>;

/** Envelope padrão de respostas das ferramentas de IA. */
export interface AiResult<T> {
  mode: "live" | "demo";
  data: T;
  notice?: string;
}
