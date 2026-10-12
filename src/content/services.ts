/** CONTEÚDO EDITÁVEL — Serviços / Capabilities */
export type ServiceVisual = "website" | "agents" | "automation" | "saas" | "integrations" | "software";

export interface Service {
  id: string;
  index: string;
  title: string;
  kicker: string;
  description: string;
  items: string[];
  visual: ServiceVisual;
  cta: string;
}

export const services: Service[] = [
  {
    id: "websites",
    index: "01",
    title: "Websites & Digital Experiences",
    kicker: "Interfaces que viram assunto",
    description:
      "Sites rápidos, responsivos e memoráveis — do institucional à experiência WebGL completa.",
    items: ["Sites institucionais", "Landing pages", "E-commerce", "Portfólios", "Websites 3D", "Experiências WebGL", "Plataformas interativas"],
    visual: "website",
    cta: "Desenvolver meu site",
  },
  {
    id: "agents",
    index: "02",
    title: "AI Agents",
    kicker: "Assistentes que trabalham por você",
    description:
      "Agentes inteligentes conectados às ferramentas do seu negócio, com regras claras e supervisão humana.",
    items: ["Agentes de atendimento", "Agentes comerciais", "Agentes de suporte", "Assistentes internos", "Agentes com ferramentas", "Sistemas multiagentes"],
    visual: "agents",
    cta: "Quero um agente de IA",
  },
  {
    id: "automation",
    index: "03",
    title: "Business Automation",
    kicker: "Menos tarefa repetitiva",
    description:
      "Fluxos automatizados que conectam sistemas, capturam leads e eliminam trabalho manual.",
    items: ["Integração de sistemas", "Automação de processos", "Fluxos de atendimento", "Captura de leads", "Tarefas repetitivas", "Integrações com APIs"],
    visual: "automation",
    cta: "Automatizar meu negócio",
  },
  {
    id: "saas",
    index: "04",
    title: "SaaS Development",
    kicker: "Do MVP à plataforma",
    description:
      "Produtos por assinatura com autenticação, pagamentos, dashboards e IA embarcada.",
    items: ["Plataformas por assinatura", "Dashboards", "Sistemas de gestão", "Portais de clientes", "Ferramentas de produtividade", "Aplicações com IA"],
    visual: "saas",
    cta: "Construir meu SaaS",
  },
  {
    id: "integrations",
    index: "05",
    title: "AI Integrations",
    kicker: "Dados entram, respostas saem",
    description:
      "Modelos de linguagem integrados aos seus dados e documentos, com busca inteligente e RAG.",
    items: ["Modelos de linguagem", "Processamento de documentos", "Análise de dados", "Busca inteligente", "Sistemas RAG", "Geração de conteúdo"],
    visual: "integrations",
    cta: "Integrar IA ao meu sistema",
  },
  {
    id: "software",
    index: "06",
    title: "Custom Software",
    kicker: "Feito sob medida",
    description:
      "Aplicações, APIs e painéis desenhados exatamente para o jeito que sua empresa opera.",
    items: ["Aplicações web", "APIs", "Sistemas internos", "Ferramentas personalizadas", "Painéis administrativos", "Soluções empresariais"],
    visual: "software",
    cta: "Conversar sobre minha ideia",
  },
];
