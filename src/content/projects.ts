/**
 * CONTEÚDO EDITÁVEL — Projetos
 *
 * Os itens abaixo são CONCEITOS DEMONSTRATIVOS (isDemo: true) e aparecem
 * identificados como tal no site. Substitua por projetos reais quando
 * quiser: defina isDemo: false, preencha links e, se tiver imagem real,
 * informe `image` (caminho em /public).
 */
export type ProjectCategory = "Websites" | "AI Applications" | "SaaS" | "Automation" | "Creative Development";

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  tech: string[];
  description: string;
  highlights: string[];
  /** Capa gerada por código quando não há imagem real. */
  cover: { hue: "green" | "copper" | "mono"; motif: "orbit" | "grid" | "wave" | "nodes" | "bars" };
  image?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
  featured?: boolean;
  isDemo: boolean;
}

export const projectCategories: ProjectCategory[] = ["Websites", "AI Applications", "SaaS", "Automation", "Creative Development"];

export const projects: Project[] = [
  {
    id: "atlas-concierge",
    name: "Atlas Concierge",
    category: "AI Applications",
    tech: ["Next.js", "Claude API", "Supabase", "pgvector"],
    description:
      "Conceito de concierge com IA para hospitalidade: responde hóspedes, sugere experiências e encaminha pedidos para a equipe.",
    highlights: ["Respostas com base em documentos do hotel (RAG)", "Escalonamento para atendente humano", "Painel de conversas e intenções"],
    cover: { hue: "green", motif: "orbit" },
    featured: true,
    isDemo: true,
  },
  {
    id: "noir-coffee",
    name: "Noir Coffee House",
    category: "Websites",
    tech: ["Next.js", "GSAP", "Three.js"],
    description: "Conceito de site imersivo para cafeteria autoral, com cardápio animado e pedidos para retirada.",
    highlights: ["Scroll storytelling", "Cardápio com filtros", "Integração de pedidos"],
    cover: { hue: "copper", motif: "wave" },
    isDemo: true,
  },
  {
    id: "pulse-crm",
    name: "Pulse CRM",
    category: "SaaS",
    tech: ["React", "TypeScript", "PostgreSQL", "Stripe"],
    description: "Conceito de CRM leve por assinatura para pequenos negócios, com funil visual e lembretes inteligentes.",
    highlights: ["Planos recorrentes", "Funil drag-and-drop", "Resumo semanal gerado por IA"],
    cover: { hue: "mono", motif: "bars" },
    isDemo: true,
  },
  {
    id: "flowdesk",
    name: "FlowDesk Automations",
    category: "Automation",
    tech: ["n8n", "APIs REST", "WhatsApp API", "Claude API"],
    description: "Conceito de central de automações: mensagens recebidas são classificadas, respondidas e registradas no CRM.",
    highlights: ["Classificação de intenção", "Registro automático de leads", "Alertas para a equipe"],
    cover: { hue: "green", motif: "nodes" },
    isDemo: true,
  },
  {
    id: "lumen-lab",
    name: "Lumen Lab",
    category: "Creative Development",
    tech: ["Three.js", "GLSL", "WebGL"],
    description: "Conceito de experiência WebGL generativa: partículas que reagem ao som e ao movimento do visitante.",
    highlights: ["Shaders customizados", "Interação em tempo real", "Fallback sem WebGL"],
    cover: { hue: "copper", motif: "grid" },
    isDemo: true,
  },
];
