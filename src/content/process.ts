/** CONTEÚDO EDITÁVEL — Processo de trabalho e diferenciais */
export const processSteps = [
  { index: "01", title: "Discovery", description: "Entendimento do problema, do público e dos objetivos do negócio.", icon: "discovery" },
  { index: "02", title: "Strategy", description: "Planejamento da solução digital, escopo e arquitetura.", icon: "strategy" },
  { index: "03", title: "Intelligence", description: "Definição das oportunidades reais para IA e automação.", icon: "intelligence" },
  { index: "04", title: "Development", description: "Construção da aplicação com código moderno e testável.", icon: "development" },
  { index: "05", title: "Integration", description: "Conexão de ferramentas, APIs e dados ao produto.", icon: "integration" },
  { index: "06", title: "Launch", description: "Testes, publicação e evolução contínua.", icon: "launch" },
] as const;

export type ProcessIcon = (typeof processSteps)[number]["icon"];

export const differentiators = [
  { title: "Soluções personalizadas", description: "Nada de pacote pronto: cada entrega parte do problema específico do seu negócio." },
  { title: "Desenvolvimento moderno", description: "Stack atual, código tipado e boas práticas de performance e segurança." },
  { title: "IA aplicada", description: "Inteligência artificial onde ela gera valor — não como enfeite." },
  { title: "Experiências diferenciadas", description: "Design e animação com intenção, para sua marca ser lembrada." },
  { title: "Integrações inteligentes", description: "Seus sistemas conversando entre si, sem retrabalho manual." },
  { title: "Foco no negócio", description: "Decisões técnicas guiadas pelas necessidades reais da operação." },
] as const;
