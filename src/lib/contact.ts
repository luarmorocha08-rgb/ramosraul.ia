import { z } from "zod";

export const projectTypes = [
  "Website / Landing page",
  "E-commerce",
  "Agente de IA / Chatbot",
  "Automação de processos",
  "SaaS / Plataforma",
  "Integração de IA",
  "Software sob medida",
  "Outro",
] as const;

export const budgetRanges = ["Ainda não sei", "Até R$ 5 mil", "R$ 5 mil – 15 mil", "R$ 15 mil – 40 mil", "Acima de R$ 40 mil"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(200),
  projectType: z.enum(projectTypes, { message: "Selecione o tipo de projeto." }),
  description: z.string().trim().min(20, "Conte um pouco mais (mínimo de 20 caracteres).").max(4000),
  budget: z.enum(budgetRanges).optional(),
  consent: z.literal(true, { message: "É preciso concordar com o uso dos dados para contato." }),
  // anti-spam
  website: z.string().max(0).optional(),
  startedAt: z.number().int().positive(),
});

export type ContactInput = z.infer<typeof contactSchema>;
