/**
 * CONTEÚDO EDITÁVEL — Perfil
 *
 * Tudo aqui é exibido na seção "Who is Raul?". Preencha com informações
 * reais; nada neste arquivo deve conter experiência, clientes ou resultados
 * que não possam ser comprovados.
 */
export interface TimelineEntry {
  /** Ex.: "2024". Deixe undefined para não exibir data. */
  period?: string;
  title: string;
  description: string;
  /** Marca o item como "agora" (destaque luminoso). */
  current?: boolean;
}

export const profile = {
  /**
   * Caminho da fotografia profissional dentro de /public.
   * Ex.: "/images/raul.jpg". Enquanto for null, o site exibe um retrato
   * holográfico gerado por código.
   */
  photo: null as string | null,
  photoAlt: "Raul Ramos, AI Developer & Creative Technologist",

  headline: "Transformo problemas reais em soluções digitais inteligentes.",
  intro:
    "Sou Raul Ramos, desenvolvedor focado em criar experiências digitais, sistemas inteligentes e soluções com IA que ajudam empresas a evoluir.",

  /** Parágrafos adicionais de biografia (opcional). */
  bio: [
    "Meu trabalho une engenharia de software, design de interfaces e inteligência artificial aplicada. Cada projeto começa por entender o problema — a tecnologia vem depois, a serviço do resultado.",
  ] as string[],

  /** Pilares de atuação exibidos como chips. */
  focus: ["Sites premium", "Inteligência Artificial", "Automações", "Sistemas web", "Creative Development"],

  /**
   * Linha do tempo interativa. Adicione marcos reais (formação, projetos,
   * lançamentos) quando quiser — a ordem aqui é a ordem de exibição.
   */
  timeline: [
    {
      title: "Código como linguagem",
      description: "A curiosidade por tecnologia se transforma em programação e criação de produtos digitais.",
    },
    {
      title: "Sites premium & IA",
      description: "Foco em experiências digitais de alto nível e soluções com Inteligência Artificial para negócios.",
      current: true,
    },
    {
      title: "Seu projeto",
      description: "O próximo capítulo pode ser a solução que o seu negócio precisa. Vamos conversar?",
    },
  ] as TimelineEntry[],
} as const;
