/**
 * CONTEÚDO EDITÁVEL — Ecossistema de tecnologias.
 * São opções de tecnologia com que projetos podem ser construídos.
 * Edite livremente: adicione, remova ou ajuste os exemplos.
 */
export type TechGroup = "frontend" | "backend" | "ai" | "data" | "automation" | "creative";

export interface TechNode {
  id: string;
  name: string;
  group: TechGroup;
  summary: string;
  uses: string[];
  related: string[];
}

export const techGroups: Record<TechGroup, { label: string; color: string }> = {
  frontend: { label: "Frontend", color: "#75E66B" },
  backend: { label: "Backend", color: "#F1EEE8" },
  ai: { label: "IA", color: "#C18B65" },
  data: { label: "Dados", color: "#9FD8A0" },
  automation: { label: "Automação", color: "#E2B48F" },
  creative: { label: "Creative", color: "#B7F0B0" },
};

export const stack: TechNode[] = [
  { id: "react", name: "React", group: "frontend", summary: "Interfaces declarativas e componentizadas.", uses: ["Painéis interativos", "Componentes reutilizáveis", "Aplicações SPA"], related: ["nextjs", "typescript", "threejs"] },
  { id: "nextjs", name: "Next.js", group: "frontend", summary: "Framework full-stack com renderização híbrida.", uses: ["Sites com SEO forte", "SaaS full-stack", "APIs e Server Actions"], related: ["react", "typescript", "supabase"] },
  { id: "typescript", name: "TypeScript", group: "frontend", summary: "Tipagem estática para código confiável.", uses: ["Contratos de API", "Refatorações seguras", "Times maiores"], related: ["react", "nextjs", "rest"] },
  { id: "python", name: "Python", group: "backend", summary: "Linguagem versátil para dados e IA.", uses: ["Scripts de automação", "Pipelines de dados", "Serviços de IA"], related: ["openai", "claude", "postgres"] },
  { id: "supabase", name: "Supabase", group: "data", summary: "Backend com Postgres, autenticação e storage.", uses: ["Autenticação de usuários", "Banco em tempo real", "Armazenamento de arquivos"], related: ["postgres", "nextjs", "stripe"] },
  { id: "postgres", name: "PostgreSQL", group: "data", summary: "Banco relacional robusto e extensível.", uses: ["Dados transacionais", "Busca vetorial (pgvector)", "Relatórios"], related: ["supabase", "python"] },
  { id: "openai", name: "OpenAI API", group: "ai", summary: "Modelos de linguagem, visão e embeddings.", uses: ["Chatbots", "Classificação de texto", "Embeddings para RAG"], related: ["claude", "python", "n8n"] },
  { id: "claude", name: "Claude API", group: "ai", summary: "Modelos da Anthropic para raciocínio e agentes.", uses: ["Agentes com ferramentas", "Análise de documentos longos", "Saídas estruturadas"], related: ["openai", "nextjs", "python"] },
  { id: "stripe", name: "Stripe", group: "backend", summary: "Pagamentos e assinaturas online.", uses: ["Checkout", "Planos recorrentes", "Portal do cliente"], related: ["nextjs", "supabase"] },
  { id: "threejs", name: "Three.js", group: "creative", summary: "Gráficos 3D em tempo real no navegador.", uses: ["Produtos em 3D", "Cenas WebGL", "Visualizações de dados"], related: ["react", "gsap"] },
  { id: "gsap", name: "GSAP", group: "creative", summary: "Motor de animação de alta performance.", uses: ["Scroll storytelling", "Microinterações", "Transições de página"], related: ["threejs", "react"] },
  { id: "n8n", name: "n8n", group: "automation", summary: "Orquestração visual de fluxos e integrações.", uses: ["Automação de atendimento", "Sincronização de sistemas", "Notificações"], related: ["rest", "openai", "claude"] },
  { id: "rest", name: "APIs REST", group: "backend", summary: "Contratos de integração entre sistemas.", uses: ["Integração com ERPs/CRMs", "Webhooks", "Microsserviços"], related: ["n8n", "typescript", "python"] },
];
