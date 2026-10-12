/**
 * CONTEÚDO EDITÁVEL — Projetos
 *
 * Projetos reais de Raul Ramos. As descrições seguem o que cada projeto
 * de fato entrega (ver o README de cada repositório) — sem clientes,
 * números ou resultados inventados.
 *
 * `demoUrl`: preencha com o endereço publicado (ex.: Vercel) para exibir
 * o botão "Ver projeto ao vivo".
 * `image`: captura de tela em /public/images/projects/.
 */
export type ProjectCategory = "Websites" | "E-commerce & Catálogo" | "Ferramentas & Sistemas" | "Creative Development";

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  /** segmento/local do negócio, exibido como contexto */
  context: string;
  tech: string[];
  description: string;
  highlights: string[];
  /** Capa gerada por código quando não há imagem real. */
  cover: { hue: "green" | "copper" | "mono"; motif: "orbit" | "grid" | "wave" | "nodes" | "bars" };
  image?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
  featured?: boolean;
  /** true = conceito demonstrativo (exibe selo). Projetos reais: false. */
  isDemo: boolean;
}

export const projects: Project[] = [
  {
    id: "franca-joias",
    name: "França Jóias",
    category: "E-commerce & Catálogo",
    context: "Joalheria · Marília/SP",
    tech: ["Next.js 16", "Supabase", "Three.js", "GSAP", "TypeScript"],
    description:
      "Showroom digital de luxo para joalheria especializada em alianças: catálogo conectado ao Supabase, visualizador de modelos 3D e painel administrativo completo.",
    highlights: [
      "Catálogo com Postgres + RLS e imagens/modelos 3D no Storage",
      "Painel /admin: produtos, categorias, coleções e conteúdo",
      "Visualizador de modelos GLB/GLTF reais e emblema 3D no hero",
    ],
    cover: { hue: "copper", motif: "orbit" },
    image: "/images/projects/franca-joias.jpg",
    featured: true,
    isDemo: false,
  },
  {
    id: "guaru-print",
    name: "Guaru Print",
    category: "Ferramentas & Sistemas",
    context: "Gráfica e comunicação visual · Guarujá/SP",
    tech: ["Next.js 16", "React Three Fiber", "GSAP", "Supabase", "Zod"],
    description:
      "Site com ferramentas reais para uma gráfica: orçamento inteligente em 5 etapas, upload validado de arte, calculadora de medidas e simulador visual em canvas.",
    highlights: [
      "Orçamento em etapas que gera a mensagem completa no WhatsApp",
      "Upload direto a bucket privado com links assinados e temporários",
      "Simulador de adesivo, banner, placa e fachada com prévia em PNG",
    ],
    cover: { hue: "green", motif: "nodes" },
    image: "/images/projects/guaru-print.jpg",
    isDemo: false,
  },
  {
    id: "ja-odontologia",
    name: "J.A Odontologia Estética",
    category: "Websites",
    context: "Clínica odontológica · Santos/SP",
    tech: ["Next.js 16", "GSAP", "Lenis", "Three.js", "TypeScript"],
    description:
      "Site institucional e de captação de pacientes com luxury minimalism, scroll cinematográfico e agendamento direto pelo WhatsApp.",
    highlights: [
      "Página própria para cada tratamento, com FAQ e SEO",
      "Vitrine horizontal fixada e transições de tom entre seções",
      "Formulário com consentimento LGPD que abre o WhatsApp preenchido",
    ],
    cover: { hue: "mono", motif: "wave" },
    image: "/images/projects/ja-odontologia.jpg",
    isDemo: false,
  },
  {
    id: "barbara-presentes",
    name: "Bárbara Presentes",
    category: "E-commerce & Catálogo",
    context: "Perfumaria e presentes",
    tech: ["Next.js 16", "GSAP", "Lenis", "Tailwind CSS"],
    description:
      "Boutique digital com direção de arte cinematográfica: catálogo por coleções, quiz de fragrâncias e pedidos com mensagem pronta no WhatsApp.",
    highlights: [
      "Cena cinematográfica em 5 atos atrelada ao scroll",
      "Quiz que recomenda fragrâncias pelo perfil olfativo",
      "Lighthouse desktop 95 e acessibilidade 100",
    ],
    cover: { hue: "copper", motif: "wave" },
    image: "/images/projects/barbara-presentes.jpg",
    isDemo: false,
  },
  {
    id: "taty-imperio",
    name: "Taty Império dos Vestidos",
    category: "Websites",
    context: "Locação de vestidos de festa · Santos/SP",
    tech: ["Next.js 16", "GSAP", "Lenis", "Motion"],
    description:
      "Site premium para boutique de locação de vestidos: desfile em scroll horizontal, catálogo com filtros e agendamento pelo WhatsApp.",
    highlights: [
      "Coleção em formato de desfile com seção fixada",
      "Vestido em destaque com camadas em profundidade e luz que segue o mouse",
      "Duas unidades com mapa e WhatsApp por unidade",
    ],
    cover: { hue: "copper", motif: "grid" },
    image: "/images/projects/taty-imperio.jpg",
    isDemo: false,
  },
  {
    id: "don-roberto",
    name: "Don Roberto",
    category: "Creative Development",
    context: "Joalheria · Los Angeles",
    tech: ["Three.js", "WebGL", "HTML/CSS/JS"],
    description: "Galeria digital imersiva para joalheria, com cenas em Three.js e narrativa visual — “Crafted Beyond Time”.",
    highlights: ["Cenas 3D em Three.js", "Site estático, sem etapa de build", "Narrativa em capítulos: luz, peças, ouro, atemporalidade"],
    cover: { hue: "mono", motif: "orbit" },
    image: "/images/projects/don-roberto.jpg",
    isDemo: false,
  },
];

/** Categorias exibidas nos filtros — só as que têm projetos. */
export const projectCategories: ProjectCategory[] = Array.from(new Set(projects.map((p) => p.category)));
