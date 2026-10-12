import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.signature}`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  applicationName: "Raul Ramos — AI Experience Lab",
  authors: [{ name: site.shortName, url: site.instagram.url }],
  keywords: ["Raul Ramos", "desenvolvedor", "inteligência artificial", "agentes de IA", "automação", "sites premium", "Next.js", "WebGL", "creative developer"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: "Raul Ramos — AI Experience Lab",
    title: `${site.name} — I don't just write code. I build intelligence.`,
    description: site.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — AI Developer & Creative Technologist`,
    description: site.tagline,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B0F12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/**
 * Executa antes da pintura: marca JS/motion ativos e decide se a intro
 * (boot sequence) deve ser exibida, evitando flashes de conteúdo.
 */
const bootScript = `(function(){try{var d=document.documentElement;var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r)d.classList.add('js-motion');var seen=localStorage.getItem('rr:boot');d.dataset.boot=(r||seen==='full')?'skip':(seen?'short':'full');}catch(e){document.documentElement.dataset.boot='skip';}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Raul Ramos",
  jobTitle: site.signature,
  url: site.url,
  sameAs: [site.instagram.url],
  knowsAbout: ["Inteligência Artificial", "Desenvolvimento Web", "Automação", "WebGL"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
