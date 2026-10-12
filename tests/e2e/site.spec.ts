import { expect, test, type Page } from "@playwright/test";

const SECTIONS = ["home", "about", "lab", "orchestration", "transformation", "capabilities", "ecosystem", "code", "workflow", "projects", "why", "terminal", "contact"];

/** Visitante recorrente: intro curta, não bloqueia os testes. */
async function open(page: Page, errors: string[] = []) {
  await page.addInitScript(() => localStorage.setItem("rr:boot", "seen"));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  // intro curta (~1,8 s); folga para máquinas de CI sem GPU
  await expect(page.locator("#boot-sequence")).toHaveCount(0, { timeout: 20_000 });
  return errors;
}

test("página carrega todas as seções sem erros nem rolagem horizontal", async ({ page }) => {
  const errors = await open(page);
  for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/I build intelligence/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("primeira visita mostra a intro, que pode ser pulada", async ({ page }) => {
  await page.goto("/");
  const skip = page.getByRole("button", { name: "Pular intro" });
  await expect(skip).toBeVisible();
  // dispatchEvent: em máquinas lentas a intro pode já estar saindo sozinha
  await skip.dispatchEvent("click");
  await expect(page.locator("#boot-sequence")).toHaveCount(0, { timeout: 10_000 });
  expect(await page.evaluate(() => localStorage.getItem("rr:boot"))).toBe("seen");
});

test("movimento reduzido remove a intro", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-boot", "skip");
  await expect(page.locator("#boot-sequence")).toBeHidden();
  await ctx.close();
});

test("AI Lab: analyzer em modo demo exibe resultado sinalizado e CTA preenche o contato", async ({ page }) => {
  await open(page);
  await page.locator("#lab").scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: /AI Business Analyzer/ }).click();
  await page.getByRole("button", { name: "Tenho uma loja de roupas e quero vender mais." }).click();
  await page.getByRole("button", { name: /Analisar negócio/ }).click();
  await expect(page.getByText("Demonstração · gerado por regras, não por IA")).toBeVisible();
  await expect(page.getByText(/Diagnóstico · Varejo/)).toBeVisible();
  await page.getByRole("button", { name: /Quero implementar essa solução/ }).click();
  await expect(page.locator("#cf-description")).toHaveValue(/loja de roupas/);
  await expect(page.locator("#cf-projectType")).toHaveValue("Automação de processos");
});

test("AI Lab: chat em modo demo marca respostas pré-definidas", async ({ page }) => {
  await open(page);
  await page.locator("#lab").scrollIntoViewIfNeeded();
  await expect(page.getByText(/Modo demonstração:/)).toBeVisible();
  await page.getByRole("button", { name: "O que você desenvolve?" }).click();
  await expect(page.getByText("resposta pré-definida · não gerada por IA")).toBeVisible();
});

test("AI Lab: navegação por teclado entre as abas", async ({ page, isMobile }) => {
  test.skip(isMobile, "teclado");
  await open(page);
  const first = page.getByRole("tab", { name: /AI Chat Assistant/ });
  await first.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab", { name: /AI Business Analyzer/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: /AI Business Analyzer/ })).toBeFocused();
});

test("simulador de automação executa todas as etapas", async ({ page }) => {
  await open(page);
  await page.locator("#lab").scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: /Automation Simulator/ }).click();
  await page.getByRole("button", { name: /Executar automação/ }).click();
  await expect(page.getByText(/✔ Cliente respondido/)).toBeVisible({ timeout: 10_000 });
});

test("terminal executa comandos, completa com Tab e navega", async ({ page, isMobile }) => {
  test.skip(isMobile, "teclado físico");
  await open(page);
  const input = page.locator("#terminal-input");
  await input.scrollIntoViewIfNeeded();
  await input.click();
  await page.keyboard.type("hel");
  await page.keyboard.press("Tab");
  await expect(input).toHaveValue("help");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("log")).toContainText("lista os comandos disponíveis");
  await page.keyboard.press("ArrowUp");
  await expect(input).toHaveValue("help");
  await input.fill("projects");
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("projects")!.getBoundingClientRect().top))).toBeLessThan(150);
});

test("command palette abre com Ctrl+K e navega", async ({ page, isMobile }) => {
  test.skip(isMobile, "atalho de teclado");
  await open(page);
  await page.keyboard.press("Control+k");
  const box = page.getByRole("combobox", { name: "Buscar comando ou perguntar à IA" });
  await expect(box).toBeFocused();
  await page.keyboard.type("contato");
  await page.keyboard.press("Enter");
  await expect(box).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("contact")!.getBoundingClientRect().top))).toBeLessThan(150);
});

test("formulário valida campos e não finge envio sem backend", async ({ page }) => {
  await open(page);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Enviar projeto/ }).click();
  await expect(page.getByText("Informe seu nome.")).toBeVisible();
  await expect(page.locator("#cf-name")).toHaveAttribute("aria-invalid", "true");
  await page.fill("#cf-name", "Maria Teste");
  await page.fill("#cf-email", "maria@exemplo.com");
  await page.selectOption("#cf-projectType", "E-commerce");
  await page.fill("#cf-description", "Quero um site para minha loja com chatbot no WhatsApp");
  await page.getByRole("button", { name: /Estruturar com IA/ }).click();
  await page.getByRole("button", { name: "Usar no formulário" }).click();
  await expect(page.locator("#cf-description")).toHaveValue(/Objetivos:/);
  await page.check("#cf-consent");
  await page.waitForTimeout(3100); // tempo mínimo anti-spam
  await page.getByRole("button", { name: /Enviar projeto/ }).click();
  await expect(page.getByText("O envio online ainda não está ativo neste site.")).toBeVisible();
});

test("menu mobile abre, navega e fecha", async ({ page, isMobile }) => {
  test.skip(!isMobile, "menu mobile");
  await open(page);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: /Projects/ }).click();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("projects")!.getBoundingClientRect().top))).toBeLessThan(150);
});

test("projeto abre detalhes acessíveis e fecha com Esc", async ({ page }) => {
  await open(page);
  await page.locator("#projects").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Abrir projeto em destaque/ }).click();
  const dialog = page.getByRole("dialog", { name: "Atlas Concierge" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Conceito demonstrativo")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("política de privacidade acessível a partir do formulário", async ({ page }) => {
  await open(page);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: "política de privacidade" }).click();
  await expect(page).toHaveURL(/\/privacidade$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Política de Privacidade");
});
