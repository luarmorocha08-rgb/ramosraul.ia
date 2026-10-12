import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

/**
 * Um único runner para:
 *  - unit: lógica pura (motores de demo, normalização, rate limit, sanitização)
 *  - e2e-desktop / e2e-mobile: fluxos reais no navegador contra o build de produção
 *
 * O servidor de teste roda SEM credenciais, validando o modo demonstração.
 */
export default defineConfig({
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // WebGL por software (sem GPU) é pesado: limita paralelismo
  workers: process.env.CI ? 2 : 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "unit", testDir: "tests/unit" },
    {
      name: "e2e-desktop",
      testDir: "tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
      },
    },
    {
      name: "e2e-mobile",
      testDir: "tests/e2e",
      use: { ...devices["Pixel 7"], launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      ANTHROPIC_API_KEY: "",
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      // vários workers compartilham o mesmo IP local
      AI_RATE_LIMIT_PER_MINUTE: "1000",
      AI_DAILY_REQUESTS_PER_SESSION: "10000",
    },
  },
});
