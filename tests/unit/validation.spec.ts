import { expect, test } from "@playwright/test";
import { chatInputSchema, normalizeOneOf, textInputSchema, IMPACT_LEVELS } from "../../src/lib/ai/schemas";
import { contactSchema } from "../../src/lib/contact";
import { cleanText, isHexColor } from "../../src/lib/sanitize";
import { rateLimit } from "../../src/lib/rate-limit";

const validLead = {
  name: "Maria Silva",
  email: "MARIA@Exemplo.com",
  projectType: "E-commerce",
  description: "Quero uma loja online com integração ao meu estoque.",
  consent: true,
  startedAt: 1,
};

test("normalizeOneOf aceita variações de caixa/acento e usa fallback", () => {
  expect(normalizeOneOf("Alto", IMPACT_LEVELS, "baixo")).toBe("alto");
  expect(normalizeOneOf(" medio ", IMPACT_LEVELS, "baixo")).toBe("médio");
  expect(normalizeOneOf("enorme", IMPACT_LEVELS, "baixo")).toBe("baixo");
});

test("textInputSchema exige tamanho mínimo e máximo", () => {
  expect(textInputSchema.safeParse({ input: "curto" }).success).toBe(false);
  expect(textInputSchema.safeParse({ input: "x".repeat(1201) }).success).toBe(false);
  expect(textInputSchema.safeParse({ input: "Tenho uma cafeteria" }).success).toBe(true);
});

test("chatInputSchema limita papéis e tamanho do histórico", () => {
  expect(chatInputSchema.safeParse({ messages: [{ role: "system", content: "x" }] }).success).toBe(false);
  expect(chatInputSchema.safeParse({ messages: Array.from({ length: 21 }, () => ({ role: "user", content: "oi" })) }).success).toBe(false);
  expect(chatInputSchema.safeParse({ messages: [{ role: "user", content: "oi" }] }).success).toBe(true);
});

test("contactSchema valida lead, normaliza e-mail e exige consentimento", () => {
  const ok = contactSchema.safeParse(validLead);
  expect(ok.success).toBe(true);
  expect(ok.success && ok.data.email).toBe("maria@exemplo.com");
  expect(contactSchema.safeParse({ ...validLead, consent: false }).success).toBe(false);
  expect(contactSchema.safeParse({ ...validLead, projectType: "Qualquer" }).success).toBe(false);
  expect(contactSchema.safeParse({ ...validLead, email: "não-é-email" }).success).toBe(false);
});

test("contactSchema rejeita honeypot preenchido", () => {
  const r = contactSchema.safeParse({ ...validLead, website: "http://spam" });
  expect(r.success).toBe(false);
  expect(!r.success && r.error.issues[0]?.path[0]).toBe("website");
});

test("cleanText remove controle/bidi e limita tamanho", () => {
  expect(cleanText("ok\u0000‮texto​", 100)).toBe("oktexto");
  expect(cleanText("  a\n\n\n\n\nb  ", 100)).toBe("a\n\n\nb");
  expect(cleanText("x".repeat(50), 10)).toHaveLength(10);
});

test("isHexColor", () => {
  expect(isHexColor("#75E66B")).toBe(true);
  expect(isHexColor("75E66B")).toBe(false);
  expect(isHexColor("#fff")).toBe(false);
});

test("rateLimit bloqueia após o limite e informa Retry-After", () => {
  const key = `test:${Math.random()}`;
  for (let i = 0; i < 3; i++) expect(rateLimit(key, 3, 60_000).ok).toBe(true);
  const blocked = rateLimit(key, 3, 60_000);
  expect(blocked.ok).toBe(false);
  expect(blocked.retryAfterSec).toBeGreaterThan(0);
  expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
});
