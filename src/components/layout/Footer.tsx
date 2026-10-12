import Link from "next/link";
import { site } from "@/config/site";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="container-x py-10">
        <p aria-hidden className="text-outline select-none overflow-hidden whitespace-nowrap font-display text-[clamp(3rem,13vw,12rem)] font-bold uppercase leading-none tracking-[-0.05em] opacity-60">
          Raul Ramos
        </p>
        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo className="size-8 text-bone" />
            <div>
              <p className="font-display text-sm font-semibold">{site.slogan}</p>
              <p className="text-xs text-steel">{site.signature}</p>
            </div>
          </div>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-bone/60">
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-signal">
              Instagram {site.instagram.handle}
            </a>
            {site.whatsapp && (
              <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="hover:text-signal">
                WhatsApp
              </a>
            )}
            {site.email && (
              <a href={site.email.url} className="hover:text-signal">
                E-mail
              </a>
            )}
            <Link href="/privacidade" className="hover:text-signal">
              Privacidade
            </Link>
          </nav>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-steel">
          <span>© {new Date().getFullYear()} Raul Ramos</span>
          <span>Pressione ⌘K / Ctrl+K para navegar</span>
        </div>
      </div>
    </footer>
  );
}
