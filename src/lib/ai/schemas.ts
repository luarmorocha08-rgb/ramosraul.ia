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

/* ─── Saídas estruturadas ─────────────────────────────────────────── */

export const analysisSchema = z.object({
  segment: z.string().describe("Segmento do negócio identificado, em poucas palavras"),
  summary: z.string().describe("Diagnóstico em 1-2 frases"),
  opportunities: z
    .array(
      z.object({
        title: z.string(),
        category: z.enum(["automation", "website", "agent", "support", "digital"]),
        description: z.string(),
        impact: z.enum(["alto", "médio", "baixo"]),
        complexity: z.enum(["alta", "média", "baixa"]),
      }),
    )
    .describe("4 a 6 oportunidades"),
  agents: z.array(z.object({ name: z.string(), role: z.string() })).describe("2 a 3 agentes inteligentes sugeridos"),
  websiteFeatures: z.array(z.string()).describe("3 a 5 funcionalidades para o site"),
  flow: z.array(z.string()).describe("4 a 5 etapas de um fluxo de automação de atendimento"),
  nextStep: z.string().describe("Primeiro passo recomendado"),
});
export type Analysis = z.infer<typeof analysisSchema>;

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

export const promptLabSchema = z.object({
  engineeredPrompt: z.string(),
  improvements: z
    .array(
      z.object({
        kind: z.enum(["role", "context", "task", "constraints", "format", "examples", "quality"]),
        label: z.string(),
        description: z.string(),
      }),
    )
    .describe("4 a 6 melhorias aplicadas"),
});
export type PromptLab = z.infer<typeof promptLabSchema>;

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
