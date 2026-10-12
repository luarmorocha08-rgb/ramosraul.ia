import { z } from "zod";
import { budgetRanges, projectTypes } from "./contact-options";

export { budgetRanges, projectTypes };

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
