/**
 * MODO DEMONSTRAÇÃO
 *
 * Quando a API de IA não está configurada, as ferramentas usam estes
 * motores determinísticos baseados em regras e palavras‑chave.
 * O resultado é sempre exibido com o selo "Demonstração — gerado por
 * regras, não por IA". Nada aqui finge ser resposta de um modelo.
 */
import type { Analysis, Brief, Concept, PromptLab } from "./schemas";

interface Segment {
  id: string;
  label: string;
  keywords: string[];
}

const SEGMENTS: Segment[] = [
  { id: "retail", label: "Varejo / Loja", keywords: ["loja", "roupa", "moda", "varejo", "boutique", "ecommerce", "e-commerce", "produto", "calçado", "acessório", "store"] },
  { id: "food", label: "Alimentação", keywords: ["cafeteria", "café", "restaurante", "lanchonete", "pizzaria", "hamburgueria", "padaria", "delivery", "comida", "bar", "confeitaria", "coffee"] },
  { id: "health", label: "Saúde & Bem-estar", keywords: ["clínica", "clinica", "consultório", "dentista", "médico", "medico", "psicólog", "fisioterapia", "nutri", "saúde", "estética", "estetica"] },
  { id: "fitness", label: "Fitness", keywords: ["academia", "personal", "crossfit", "pilates", "yoga", "treino", "fitness"] },
  { id: "beauty", label: "Beleza", keywords: ["salão", "salao", "barbearia", "manicure", "cabeleireir", "beleza", "spa"] },
  { id: "realestate", label: "Imobiliário", keywords: ["imobiliária", "imobiliaria", "imóve", "imove", "corretor", "aluguel", "construtora"] },
  { id: "services", label: "Serviços profissionais", keywords: ["advocacia", "advogad", "contabilidade", "contador", "consultoria", "escritório", "escritorio", "agência", "agencia", "marketing"] },
  { id: "education", label: "Educação", keywords: ["escola", "curso", "aula", "professor", "mentoria", "educação", "educacao", "infoproduto", "treinamento"] },
];

function detectSegment(text: string): Segment {
  const t = text.toLowerCase();
  let best: { seg: Segment; score: number } | null = null;
  for (const seg of SEGMENTS) {
    const score = seg.keywords.reduce((acc, k) => acc + (t.includes(k) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { seg, score };
  }
  return best?.seg ?? { id: "general", label: "Negócio local / digital", keywords: [] };
}

const wants = (text: string, words: string[]) => words.some((w) => text.toLowerCase().includes(w));

/* ─── Business Analyzer ───────────────────────────────────────────── */

const SEGMENT_PLAYBOOK: Record<string, Pick<Analysis, "opportunities" | "agents" | "websiteFeatures">> = {
  retail: {
    opportunities: [
      { title: "Vitrine com catálogo inteligente", category: "website", description: "Catálogo online com filtros, busca por estilo e recomendações de peças complementares.", impact: "alto", complexity: "média" },
      { title: "Atendimento 24h no WhatsApp", category: "support", description: "Assistente responde dúvidas de tamanho, estoque e trocas e encaminha casos complexos à equipe.", impact: "alto", complexity: "média" },
      { title: "Recuperação de carrinho", category: "automation", description: "Mensagens automáticas e personalizadas para quem iniciou uma compra e não concluiu.", impact: "médio", complexity: "baixa" },
      { title: "Provador de looks com IA", category: "agent", description: "Agente sugere combinações a partir do que o cliente já gostou ou comprou.", impact: "médio", complexity: "alta" },
      { title: "Estoque integrado", category: "digital", description: "Loja física e online sincronizadas para evitar vendas sem estoque.", impact: "médio", complexity: "média" },
    ],
    agents: [
      { name: "Agente Stylist", role: "Sugere combinações e tamanhos com base nas preferências do cliente." },
      { name: "Agente de Pós-venda", role: "Acompanha entregas, trocas e pede avaliações." },
    ],
    websiteFeatures: ["Catálogo com filtros por tamanho e estilo", "Checkout rápido com Pix", "Lookbook interativo", "Lista de desejos"],
  },
  food: {
    opportunities: [
      { title: "Cardápio digital interativo", category: "website", description: "Cardápio com fotos, alergênicos e pedidos para retirada ou entrega.", impact: "alto", complexity: "baixa" },
      { title: "Pedidos automáticos no WhatsApp", category: "automation", description: "Pedidos recebidos são interpretados, confirmados e enviados à cozinha.", impact: "alto", complexity: "média" },
      { title: "Reservas sem ligação", category: "support", description: "Agendamento de mesas com confirmação e lembrete automático.", impact: "médio", complexity: "baixa" },
      { title: "Programa de fidelidade", category: "digital", description: "Pontos e recompensas digitais para clientes recorrentes.", impact: "médio", complexity: "média" },
      { title: "Análise de avaliações", category: "agent", description: "IA resume avaliações e aponta pratos elogiados e pontos de melhoria.", impact: "médio", complexity: "baixa" },
    ],
    agents: [
      { name: "Agente de Pedidos", role: "Recebe pedidos, sugere adicionais e confirma o endereço." },
      { name: "Agente de Reservas", role: "Gerencia disponibilidade de mesas e lembretes." },
    ],
    websiteFeatures: ["Cardápio com filtros e fotos", "Pedidos para retirada", "Mapa e horário em destaque", "Galeria do ambiente"],
  },
  health: {
    opportunities: [
      { title: "Agendamento online", category: "website", description: "Pacientes escolhem horário, profissional e recebem confirmação automática.", impact: "alto", complexity: "média" },
      { title: "Lembretes que reduzem faltas", category: "automation", description: "Confirmação e lembretes automáticos antes da consulta, com opção de remarcar.", impact: "alto", complexity: "baixa" },
      { title: "Triagem de dúvidas frequentes", category: "support", description: "Assistente responde sobre convênios, preparo e endereço, sem orientação clínica.", impact: "médio", complexity: "média" },
      { title: "Prontuário organizado", category: "digital", description: "Fichas e documentos centralizados com acesso controlado.", impact: "médio", complexity: "alta" },
    ],
    agents: [
      { name: "Agente de Agenda", role: "Gerencia horários, encaixes e remarcações." },
      { name: "Agente de Recepção", role: "Responde perguntas administrativas e coleta dados de cadastro." },
    ],
    websiteFeatures: ["Agendamento integrado", "Página por especialidade", "Lista de convênios", "Área do paciente"],
  },
};

const GENERIC_PLAYBOOK: Pick<Analysis, "opportunities" | "agents" | "websiteFeatures"> = {
  opportunities: [
    { title: "Site focado em conversão", category: "website", description: "Páginas claras sobre o que você oferece, com chamadas diretas para contato.", impact: "alto", complexity: "média" },
    { title: "Atendimento automatizado", category: "support", description: "Assistente responde perguntas frequentes e qualifica contatos a qualquer hora.", impact: "alto", complexity: "média" },
    { title: "Captura e registro de leads", category: "automation", description: "Contatos de site, Instagram e WhatsApp registrados automaticamente em uma planilha ou CRM.", impact: "médio", complexity: "baixa" },
    { title: "Relatórios automáticos", category: "digital", description: "Resumo semanal com números de atendimento e vendas, sem montar planilhas.", impact: "médio", complexity: "baixa" },
    { title: "Agente de propostas", category: "agent", description: "IA monta rascunhos de propostas a partir das informações do cliente.", impact: "médio", complexity: "média" },
  ],
  agents: [
    { name: "Agente de Atendimento", role: "Responde dúvidas frequentes e encaminha oportunidades." },
    { name: "Agente Comercial", role: "Qualifica leads e agenda conversas com a equipe." },
  ],
  websiteFeatures: ["Página de serviços clara", "Formulário inteligente", "Botão de WhatsApp", "Blog para SEO"],
};

export function demoAnalyze(input: string): Analysis {
  const seg = detectSegment(input);
  const book = SEGMENT_PLAYBOOK[seg.id] ?? GENERIC_PLAYBOOK;
  const salesFocus = wants(input, ["vender", "venda", "cliente", "faturar"]);
  return {
    segment: seg.label,
    summary: salesFocus
      ? `Para ${seg.label.toLowerCase()}, o caminho mais rápido para vender mais é reduzir atrito no atendimento e tornar a jornada de compra digital.`
      : `Há boas oportunidades para digitalizar processos e automatizar tarefas repetitivas em ${seg.label.toLowerCase()}.`,
    opportunities: book.opportunities,
    agents: book.agents,
    websiteFeatures: book.websiteFeatures,
    flow: ["Cliente envia mensagem", "IA identifica a intenção", "Sistema consulta dados do negócio", "Resposta personalizada é enviada", "Lead é registrado para a equipe"],
    nextStep: "Mapear as perguntas e tarefas mais frequentes da operação para priorizar a primeira automação.",
  };
}

/* ─── Website Concept Generator ───────────────────────────────────── */

const CONCEPT_STYLES: Record<string, Omit<Concept, "sections" | "features" | "hero"> & { nouns: string[] }> = {
  food: {
    projectName: "Grão & Brasa",
    tagline: "Sabor que se sente antes da primeira mordida.",
    visualDirection: "Editorial quente, fotografia em close com luz lateral e muito respiro entre blocos.",
    mood: ["Aconchegante", "Artesanal", "Editorial"],
    palette: [
      { name: "Torra", hex: "#1C1410", role: "Fundo" },
      { name: "Crema", hex: "#2A1F18", role: "Superfície" },
      { name: "Leite", hex: "#F5EDE3", role: "Texto" },
      { name: "Caramelo", hex: "#D9924B", role: "Destaque" },
      { name: "Folha", hex: "#7FA37A", role: "Secundária" },
    ],
    typography: { display: "Fraunces", body: "Inter" },
    nouns: ["cardápio", "ambiente", "reservas"],
  },
  retail: {
    projectName: "Atelier Norte",
    tagline: "Peças que contam a sua história.",
    visualDirection: "Minimalismo de revista de moda: grid assimétrico, tipografia grande e produtos em destaque.",
    mood: ["Minimalista", "Sofisticado", "Contemporâneo"],
    palette: [
      { name: "Grafite", hex: "#121212", role: "Fundo" },
      { name: "Concreto", hex: "#1E1E1E", role: "Superfície" },
      { name: "Linho", hex: "#F2EFEA", role: "Texto" },
      { name: "Terracota", hex: "#C8643B", role: "Destaque" },
      { name: "Areia", hex: "#CBB89D", role: "Secundária" },
    ],
    typography: { display: "Syne", body: "DM Sans" },
    nouns: ["coleções", "lookbook", "checkout"],
  },
  general: {
    projectName: "Nova Órbita",
    tagline: "Seu negócio, em outra órbita.",
    visualDirection: "Tecnológico e limpo, com cards em vidro, microanimações e contraste alto.",
    mood: ["Moderno", "Confiável", "Tecnológico"],
    palette: [
      { name: "Noite", hex: "#0E1116", role: "Fundo" },
      { name: "Ardósia", hex: "#1A1F27", role: "Superfície" },
      { name: "Névoa", hex: "#EEF1F5", role: "Texto" },
      { name: "Aurora", hex: "#5B8CFF", role: "Destaque" },
      { name: "Menta", hex: "#5FD3B5", role: "Secundária" },
    ],
    typography: { display: "Space Grotesk", body: "Inter" },
    nouns: ["serviços", "projetos", "contato"],
  },
};

export function demoConcept(input: string): Concept {
  const seg = detectSegment(input);
  const style = CONCEPT_STYLES[seg.id] ?? CONCEPT_STYLES.general!;
  const { nouns, ...base } = style;
  const ecommerce = wants(input, ["vender", "loja", "e-commerce", "ecommerce", "compra"]);
  const booking = wants(input, ["agend", "reserva", "consulta", "horário"]);
  return {
    ...base,
    sections: [
      { name: "Hero", purpose: "Impacto visual e proposta de valor em uma frase." },
      { name: "Sobre", purpose: "História, diferenciais e o que torna a marca única." },
      { name: nouns[0]![0]!.toUpperCase() + nouns[0]!.slice(1), purpose: "Apresentação do que é oferecido, com filtros e destaques." },
      { name: "Experiência", purpose: "Galeria e bastidores para gerar desejo e confiança." },
      { name: ecommerce ? "Loja" : booking ? "Agendamento" : "Contato", purpose: ecommerce ? "Compra direta com checkout simples." : booking ? "Reserva de horário em poucos cliques." : "Canais de contato e formulário inteligente." },
      { name: "Rodapé", purpose: "Endereço, horários, redes sociais e links úteis." },
    ],
    features: [
      "Layout responsivo e rápido",
      ecommerce ? "Checkout com Pix e cartão" : "Botão de WhatsApp contextual",
      booking ? "Agendamento integrado ao calendário" : "Formulário com qualificação de contato",
      "SEO técnico e Open Graph",
      "Animações de scroll sutis",
    ],
    hero: {
      headline: base.tagline,
      subheadline: `Uma experiência digital pensada para apresentar ${nouns[0]} e transformar visitantes em clientes.`,
      cta: ecommerce ? "Ver coleção" : booking ? "Agendar agora" : "Fale com a gente",
    },
  };
}

/* ─── Prompt Engineering Lab ──────────────────────────────────────── */

export function demoPrompt(input: string): PromptLab {
  const task = input.trim().replace(/\s+/g, " ");
  const engineeredPrompt = `# Papel
Você é um especialista experiente no tema da solicitação abaixo, com foco em clareza e aplicação prática.

# Contexto
O resultado será usado por um profissional que precisa de algo pronto para aplicar. Considere público, objetivo e restrições antes de responder.

# Tarefa
${task}

# Restrições
- Seja específico e evite generalidades.
- Se faltar informação essencial, liste as suposições feitas.
- Não invente dados, números ou fontes.

# Formato de saída
1. Resumo em uma frase.
2. Entrega principal organizada em tópicos.
3. Próximos passos recomendados.

# Critérios de qualidade
Antes de finalizar, revise se a resposta atende à tarefa, respeita as restrições e está no formato pedido.`;
  return {
    engineeredPrompt,
    improvements: [
      { kind: "role", label: "Papel definido", description: "Dá ao modelo uma perspectiva de especialista." },
      { kind: "context", label: "Contexto explícito", description: "Explica para quem e para quê é o resultado." },
      { kind: "constraints", label: "Restrições claras", description: "Evita respostas genéricas ou dados inventados." },
      { kind: "format", label: "Formato de saída", description: "Estrutura previsível e fácil de usar." },
      { kind: "quality", label: "Autoverificação", description: "Pede uma revisão final contra os critérios." },
    ],
  };
}

/* ─── Brief (formulário de contato) ───────────────────────────────── */

export function demoBrief(input: string): Brief {
  const seg = detectSegment(input);
  const site = wants(input, ["site", "landing", "página", "pagina", "loja virtual", "e-commerce"]);
  const ai = wants(input, ["ia", "inteligência", "chatbot", "agente", "automaç", "automac", "whatsapp"]);
  const projectType = site && ai ? "Website + IA" : ai ? "IA & Automação" : site ? "Website" : "Projeto digital";
  return {
    title: `${projectType} — ${seg.label}`,
    projectType,
    summary: input.trim().slice(0, 280),
    objectives: ["Esclarecer o principal resultado esperado", "Definir o público que será atendido"],
    features: [
      ...(site ? ["Site responsivo com foco em conversão"] : []),
      ...(ai ? ["Assistente de IA para atendimento", "Automação de tarefas repetitivas"] : []),
      "Integração com canais de contato",
    ],
    questions: ["Qual é o prazo ideal para o lançamento?", "Quais ferramentas o negócio já utiliza hoje?", "Existe identidade visual definida?"],
  };
}

/* ─── Chat (respostas pré-definidas) ──────────────────────────────── */

const FAQ: Array<{ keys: string[]; answer: string }> = [
  {
    keys: ["o que", "faz", "serviço", "servico", "trabalha"],
    answer:
      "Raul desenvolve sites premium, agentes de IA, automações de negócio, plataformas SaaS, integrações com modelos de linguagem e software sob medida. Explore a seção Capabilities para ver cada área em detalhe.",
  },
  {
    keys: ["preço", "preco", "valor", "custa", "orçamento", "orcamento"],
    answer:
      "Cada projeto é orçado conforme escopo e objetivos. A forma mais rápida é descrever sua ideia no formulário de contato — ele tem até um assistente para estruturar o pedido.",
  },
  {
    keys: ["automa", "whatsapp", "atendimento"],
    answer:
      "Automações comuns: atendimento no WhatsApp com IA, registro automático de leads, lembretes de agendamento e relatórios. Teste o Automation Simulator aqui no AI Lab para ver um fluxo funcionando.",
  },
  {
    keys: ["agente", "chatbot", "ia", "inteligência", "inteligencia"],
    answer:
      "Agentes de IA podem atender clientes, qualificar leads, responder com base em documentos da empresa (RAG) e acionar ferramentas como CRM e agenda — sempre com regras claras e supervisão humana.",
  },
  {
    keys: ["site", "landing", "loja", "e-commerce", "portfólio", "portfolio"],
    answer:
      "Sites podem ir de uma landing page de alta conversão até experiências 3D com WebGL, como este portfólio. Experimente o Website Concept Generator para ver uma proposta inicial.",
  },
  {
    keys: ["prazo", "tempo", "demora", "quando"],
    answer:
      "O prazo depende do escopo. Conte sobre o projeto no formulário de contato e Raul responde com uma estimativa realista.",
  },
];

export const DEMO_CHAT_FALLBACK =
  "No modo demonstração eu só tenho respostas pré-definidas sobre serviços, automação, agentes de IA, sites, prazos e orçamento. Para uma conversa completa, fale direto com Raul pela seção de contato.";

export function demoChatReply(message: string) {
  const t = message.toLowerCase();
  const hit = FAQ.map((f) => ({ f, score: f.keys.filter((k) => t.includes(k)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)[0];
  return hit?.f.answer ?? DEMO_CHAT_FALLBACK;
}
