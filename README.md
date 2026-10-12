# RAUL RAMOS — AI Experience Lab

Portfólio interativo de **Raul Ramos · AI Developer & Creative Technologist** ([@ramosraul.ia](https://www.instagram.com/ramosraul.ia/)).

> *"Don't tell people what you can build. Let them experience it."*

Uma experiência digital escura, cinematográfica e funcional: cena WebGL de partículas que se transforma com o scroll, laboratório de IA com ferramentas reais, terminal, command palette, orquestração de agentes e formulário inteligente.

---

## Começando

```bash
npm install
cp .env.example .env.local   # opcional — sem variáveis o site roda em modo demonstração
npm run dev                  # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm start` | build e servidor de produção |
| `npm run lint` | ESLint (regras do Next + React Compiler) |
| `npm run typecheck` | TypeScript estrito |

Requer Node.js 20.9+.

---

## Configuração (`.env.local`)

Tudo é opcional. Sem credenciais, cada recurso entra em um modo honesto e claramente sinalizado.

| Variável | Para quê | Sem ela |
|---|---|---|
| `ANTHROPIC_API_KEY` | IA real no AI Lab, no chat e no "Estruturar com IA" do formulário | **Modo demonstração**: respostas por regras, com selo "gerado por regras, não por IA" |
| `ANTHROPIC_MODEL` | modelo (padrão `claude-opus-5-5`) | — |
| `ANTHROPIC_EFFORT` | `low` \| `medium` \| `high` (padrão `low`, mais rápido e barato) | — |
| `AI_RATE_LIMIT_PER_MINUTE` / `AI_DAILY_REQUESTS_PER_SESSION` / `AI_GLOBAL_DAILY_LIMIT` | limites de uso e custo | padrões 8 / 40 / 2000 |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | grava os leads do formulário | o formulário valida, **não finge enviar** e oferece copiar a mensagem para WhatsApp/e-mail/Instagram |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | botão de WhatsApp (só dígitos, ex. `5511999999999`) | botão oculto |
| `NEXT_PUBLIC_CONTACT_EMAIL` | botão de e-mail | botão oculto |
| `NEXT_PUBLIC_SITE_URL` | URL canônica, Open Graph e sitemap | `http://localhost:3000` |

### Ativando a IA (Claude API)

1. Crie uma chave em [console.anthropic.com](https://console.anthropic.com/) e defina `ANTHROPIC_API_KEY`.
2. Reinicie o servidor. O indicador **AI · online** aparece na navegação.

A chave só é usada no servidor (`src/lib/ai/client.ts`, marcado com `server-only`). As requisições usam saídas estruturadas validadas com Zod e o **fallback automático do servidor** (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`): se um classificador de segurança recusar um pedido, a API refaz com o modelo recomendado.

### Ativando o formulário (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Rode `supabase/migrations/0001_create_leads.sql` (SQL Editor ou `supabase db push`). A tabela tem **RLS ligado e nenhuma policy pública** — só o servidor grava.
3. Defina `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (Settings → API). Nunca exponha a service role no navegador.

---

## Editando o conteúdo

Todo o texto editável fica em `src/content/` — sem tocar nos componentes:

| Arquivo | Conteúdo |
|---|---|
| `profile.ts` | foto, biografia, pilares e **linha do tempo** |
| `projects.ts` | projetos (os atuais são **conceitos demonstrativos** — `isDemo: true`) |
| `services.ts` | os 6 serviços da seção Capabilities |
| `stack.ts` | tecnologias do ecossistema 3D e seus exemplos de uso |
| `process.ts` | etapas do workflow e diferenciais |
| `src/config/site.ts` | nome, slogans, Instagram, links |

**Fotografia:** coloque a imagem em `public/images/raul.jpg` e defina `photo: "/images/raul.jpg"` em `profile.ts`. Até lá, a seção About exibe um retrato holográfico gerado por código.

**Projetos reais:** troque `isDemo` para `false`, preencha `demoUrl`/`caseStudyUrl` e, se quiser, `image`. O selo "Conceito demonstrativo" some automaticamente.

O site não contém clientes, depoimentos, métricas ou certificações inventadas — mantenha assim ao editar.

---

## O que tem dentro

**Experiência**
- **Boot sequence** (~2,6 s na 1ª visita, ~0,9 s depois, pulável com botão/Esc; desligada com movimento reduzido).
- **Hero** com cena WebGL própria (shaders GLSL): ~15 mil partículas + sinapses que piscam, reagem ao cursor, giram com arraste, mudam de forma com clique ou pelos controles (Core, Neural, Terrain, Helix, Orbit) e se **transformam conforme a seção** visível.
- **AI Lab**: Chat Assistant (streaming), Business Analyzer, Website Concept Generator (prévia montada com componentes reais), Automation Simulator e Prompt Engineering Lab.
- **Orchestration** (simulação guiada de agentes), **Before/After AI** (slider), **Capabilities** (scroll horizontal fixado, 6 demos animadas), **Ecosystem** (universo 3D de tecnologias com projeção própria), **Live Code** (o scroll escreve o código e a interface ganha vida), **Workflow**, **Selected Work**, **Why me**, **RAUL.OS** (terminal com autocomplete e histórico) e **Contato** com briefing assistido por IA.
- **Command palette** (`Ctrl/⌘ + K`), chat flutuante, cursor magnético, indicador de status da IA e easter eggs (código Konami, `sudo hire raul`, `matrix` no terminal).

**Arquitetura** (`src/`)
```
app/               rotas, layout, SEO (OG image, robots, sitemap), API
  api/ai/*         chat (stream), analyze, concept, prompt, brief, status
  api/contact      formulário (validação, honeypot, tempo mínimo, rate limit)
components/
  three/           cena WebGL (shapes, shaders, coreografia por scroll)
  sections/        seções da página
  lab/             ferramentas do AI Lab e chat
  layout/          nav, boot, cursor, palette, easter eggs
  ui/              primitivas (Reveal, SplitHeading, Magnetic, TiltCard…)
content/           conteúdo editável
lib/ai/            cliente, prompts, schemas, guard (limites), modo demo
```

**Animação** — GSAP + ScrollTrigger para scroll, Lenis no mesmo ticker do GSAP (sem conflito), CSS para microinterações e React Three Fiber para o 3D. Tudo respeita `prefers-reduced-motion`.

**Segurança** — chaves só no servidor; validação Zod nas entradas e saídas; sanitização de texto; checagem de origem; limites por IP/minuto, por sessão/dia (cookie httpOnly), por IP/dia e teto global diário; textos de visitantes tratados como dados nos prompts; cabeçalhos de segurança.

> Os limites de uso ficam em memória por instância. Em hospedagem serverless com várias instâncias, troque o `store` de `src/lib/rate-limit.ts` por um backend compartilhado (ex.: Upstash Redis).

**Performance** — cena 3D carregada sob demanda depois da intro, contagem de partículas e DPR adaptados ao dispositivo, render pausado com a aba oculta, loops de canvas pausados fora da tela, ferramentas do lab com code splitting, fallback estático sem WebGL.

### Resultados medidos (Lighthouse 12, perfil mobile, neste ambiente)

| Categoria | Nota |
|---|---|
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| Performance | 61 com WebGL por software (SwiftShader, sem GPU) · ~75–79 sem WebGL |

A nota de performance aqui é pessimista: sem GPU, o WebGL roda na CPU e conta como bloqueio da thread principal. O LCP da primeira visita também inclui a intro cinematográfica (pedida no briefing); visitantes recorrentes veem a versão curta. Meça em um aparelho real antes de otimizar mais.
