/**
 * Configuração central do site. Valores públicos vêm de NEXT_PUBLIC_*,
 * então podem ser lidos tanto no servidor quanto no cliente.
 */
const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
const email = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "luarmorocha08@gmail.com").trim();

/**
 * URL pública: NEXT_PUBLIC_SITE_URL (domínio próprio) → domínio de produção
 * que a Vercel injeta automaticamente → localhost em desenvolvimento.
 */
function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const site = {
  name: "RAUL RAMOS",
  shortName: "Raul Ramos",
  signature: "AI Developer & Creative Technologist",
  slogan: "Pequenas ideias. Grandes resultados.",
  tagline: "Transformando ideias em experiências digitais inteligentes.",
  description:
    "Raul Ramos — AI Developer & Creative Technologist. Sites premium, sistemas, automações e experiências digitais impulsionadas por inteligência artificial.",
  url: siteUrl(),
  locale: "pt_BR",
  instagram: {
    handle: "@ramosraul.ia",
    url: "https://www.instagram.com/ramosraul.ia/",
  },
  whatsapp: whatsapp
    ? {
        number: whatsapp,
        url: `https://wa.me/${whatsapp}?text=${encodeURIComponent(
          "Olá, Raul! Vim pelo seu site e quero conversar sobre um projeto.",
        )}`,
      }
    : null,
  email: email ? { address: email, url: `mailto:${email}` } : null,
} as const;

export const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "lab", label: "AI Lab" },
  { id: "capabilities", label: "Capabilities" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId =
  | "home"
  | "about"
  | "lab"
  | "capabilities"
  | "ecosystem"
  | "projects"
  | "code"
  | "workflow"
  | "terminal"
  | "orchestration"
  | "transformation"
  | "why"
  | "contact";
