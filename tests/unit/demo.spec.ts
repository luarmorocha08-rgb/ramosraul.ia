import { expect, test } from "@playwright/test";
import { demoAnalyze, demoBrief, demoChatReply, demoConcept, demoPrompt, DEMO_CHAT_FALLBACK } from "../../src/lib/ai/demo";
import { COMPLEXITY_LEVELS, IMPACT_LEVELS, OPPORTUNITY_CATEGORIES } from "../../src/lib/ai/schemas";

test.describe("motores do modo demonstração", () => {
  test("analyzer reconhece o segmento e respeita os valores permitidos", () => {
    const a = demoAnalyze("Tenho uma loja de roupas e quero vender mais.");
    expect(a.segment).toBe("Varejo / Loja");
    expect(a.summary).toContain("vender mais");
    expect(a.opportunities.length).toBeGreaterThanOrEqual(4);
    for (const o of a.opportunities) {
      expect(OPPORTUNITY_CATEGORIES).toContain(o.category);
      expect(IMPACT_LEVELS).toContain(o.impact);
      expect(COMPLEXITY_LEVELS).toContain(o.complexity);
    }
    expect(a.flow).toHaveLength(5);
  });

  test("analyzer usa playbook genérico para segmentos desconhecidos", () => {
    expect(demoAnalyze("Faço instalação de placas solares").segment).toBe("Negócio local / digital");
  });

  test("concept gera paleta de 5 cores hexadecimais válidas", () => {
    for (const input of ["Quero um site para uma cafeteria moderna.", "Loja online de moda", "Consultoria em tecnologia"]) {
      const c = demoConcept(input);
      expect(c.palette).toHaveLength(5);
      for (const p of c.palette) expect(p.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(c.sections.length).toBeGreaterThanOrEqual(5);
      expect(c.hero.headline.length).toBeGreaterThan(0);
    }
  });

  test("concept adapta CTA para agendamento", () => {
    expect(demoConcept("site para clínica com agendamento de consultas").hero.cta).toBe("Agendar agora");
  });

  test("prompt lab preserva a tarefa original e estrutura seções", () => {
    const r = demoPrompt("escreva um post sobre meu restaurante");
    expect(r.engineeredPrompt).toContain("escreva um post sobre meu restaurante");
    for (const h of ["# Papel", "# Contexto", "# Tarefa", "# Restrições", "# Formato de saída"]) expect(r.engineeredPrompt).toContain(h);
    expect(r.improvements.length).toBeGreaterThanOrEqual(4);
  });

  test("chat responde FAQ e cai no fallback honesto", () => {
    expect(demoChatReply("Quanto custa um site?")).toMatch(/orçad/);
    expect(demoChatReply("qual a capital da França?")).toBe(DEMO_CHAT_FALLBACK);
  });

  test("brief classifica o tipo de projeto", () => {
    expect(demoBrief("Quero um site com chatbot de IA no WhatsApp").projectType).toBe("Website + IA");
    expect(demoBrief("Preciso de um site institucional").projectType).toBe("Website");
  });
});
