import { expect, test } from "@playwright/test";

// contrato das rotas — independe de viewport, roda só no projeto desktop
test.skip(({ isMobile }) => isMobile, "API testada uma vez");

test("status informa modo demonstração sem credenciais", async ({ request }) => {
  const r = await request.get("/api/ai/status");
  expect(r.ok()).toBe(true);
  expect(await r.json()).toEqual({ mode: "demo" });
});

test("ferramentas validam entrada e respondem em modo demo identificado", async ({ request }) => {
  const bad = await request.post("/api/ai/analyze", { data: { input: "oi" } });
  expect(bad.status()).toBe(400);
  for (const route of ["analyze", "concept", "prompt", "brief"]) {
    const r = await request.post(`/api/ai/${route}`, { data: { input: "Tenho uma cafeteria e quero vender online" } });
    expect(r.status(), route).toBe(200);
    const body = await r.json();
    expect(body.mode).toBe("demo");
    expect(body.notice).toMatch(/não por um modelo de IA/);
  }
});

test("chat demo devolve resposta pré-definida (sem fingir streaming de IA)", async ({ request }) => {
  const r = await request.post("/api/ai/chat", { data: { messages: [{ role: "user", content: "o que você faz?" }] } });
  expect(r.headers()["content-type"]).toContain("application/json");
  const body = await r.json();
  expect(body.mode).toBe("demo");
  expect(body.reply.length).toBeGreaterThan(20);
});

test("chat rejeita conversa que não termina com o usuário", async ({ request }) => {
  const r = await request.post("/api/ai/chat", { data: { messages: [{ role: "assistant", content: "oi" }] } });
  expect(r.status()).toBe(400);
});

test("requisições de outra origem são bloqueadas", async ({ request }) => {
  const r = await request.post("/api/ai/concept", { data: { input: "site para cafeteria" }, headers: { origin: "https://evil.example" } });
  expect(r.status()).toBe(403);
});

test("contato: honeypot e envio rápido demais são descartados em silêncio", async ({ request }) => {
  const lead = { name: "Bot", email: "bot@x.com", projectType: "Outro", description: "mensagem de spam com mais de vinte caracteres", consent: true };
  const honeypot = await request.post("/api/contact", { data: { ...lead, website: "spam", startedAt: 1 }, headers: { "x-forwarded-for": "10.0.0.1" } });
  expect(await honeypot.json()).toMatchObject({ ok: true, stored: false });
  const fast = await request.post("/api/contact", { data: { ...lead, startedAt: Date.now() }, headers: { "x-forwarded-for": "10.0.0.2" } });
  expect(await fast.json()).toMatchObject({ ok: true, stored: false });
});

test("contato sem Supabase informa que não foi enviado", async ({ request }) => {
  const r = await request.post("/api/contact", {
    data: { name: "Maria", email: "maria@x.com", projectType: "Outro", description: "Quero um sistema para minha empresa", consent: true, startedAt: 1 },
    headers: { "x-forwarded-for": "10.0.0.3" },
  });
  expect(r.status()).toBe(503);
  expect(await r.json()).toMatchObject({ ok: false, stored: false, reason: "unconfigured" });
});

test("SEO: robots, sitemap e imagem Open Graph", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /api/");
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/privacidade");
  const og = await request.get("/opengraph-image");
  expect(og.headers()["content-type"]).toBe("image/png");
});
