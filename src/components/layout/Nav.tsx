"use client";

import { useEffect, useRef, useState } from "react";
import { navItems } from "@/config/site";
import { site } from "@/config/site";
import { scrollToSection, getLenis } from "@/lib/scroll";
import { emit } from "@/lib/events";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/ui/Magnetic";
import AiStatusBadge from "@/components/ui/AiStatusBadge";
import Logo from "./Logo";

/** Ordem das seções na página → item de navegação correspondente. */
const SECTION_TO_NAV: Record<string, string> = {
  home: "home",
  about: "about",
  lab: "lab",
  orchestration: "lab",
  transformation: "lab",
  capabilities: "capabilities",
  ecosystem: "capabilities",
  code: "capabilities",
  workflow: "capabilities",
  projects: "projects",
  why: "projects",
  terminal: "projects",
  contact: "contact",
};

export default function Nav() {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // seção ativa
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(SECTION_TO_NAV[e.target.id] ?? "home");
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    Object.keys(SECTION_TO_NAV).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // aparência reage ao scroll: vidro após o topo, esconde ao descer
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // indicador deslizante
  useEffect(() => {
    const update = () => {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`);
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active]);

  // menu mobile: trava scroll, Esc fecha, foco gerenciado
  useEffect(() => {
    if (!open) return;
    const trigger = menuButton.current;
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("a,button");
        const firstEl = f[0];
        const lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => scrollToSection(id));
  };

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-full bg-signal px-4 py-2 font-medium text-ink transition-transform focus:translate-y-0"
      >
        Pular para o conteúdo
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-expo)]",
          hidden && !open && "-translate-y-full",
        )}
      >
        <nav
          aria-label="Navegação principal"
          className={cn(
            "container-x mt-3 flex h-16 items-center justify-between gap-4 rounded-2xl transition-all duration-500 md:mt-4",
            scrolled ? "glass-strong mx-auto max-w-[calc(1400px-2rem)] !px-4 md:!px-5" : "border border-transparent",
          )}
        >
          <a href="#home" onClick={go("home")} className="group flex items-center gap-3" aria-label="Raul Ramos — início">
            <Logo className="size-8 transition-transform duration-700 group-hover:rotate-[120deg]" />
            <span className="hidden font-display text-sm font-semibold tracking-[0.2em] sm:inline">RAUL RAMOS</span>
          </a>

          <ul ref={listRef} className="relative hidden items-center gap-1 lg:flex">
            {indicator && (
              <span
                aria-hidden
                className="absolute top-1/2 h-8 -translate-y-1/2 rounded-full border border-signal/25 bg-signal/10 transition-all duration-500 ease-[var(--ease-expo)]"
                style={{ left: indicator.left, width: indicator.width }}
              />
            )}
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  data-nav={item.id}
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  aria-current={active === item.id ? "true" : undefined}
                  className={cn(
                    "relative block rounded-full px-4 py-2 text-sm transition-colors",
                    active === item.id ? "text-bone" : "text-bone/55 hover:text-bone",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <AiStatusBadge compact className="hidden md:inline-flex" />
            <button
              type="button"
              onClick={() => emit("palette:open")}
              className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[0.68rem] text-bone/60 transition-colors hover:border-signal/50 hover:text-bone md:inline-flex"
              aria-label="Abrir central de comandos (Ctrl+K)"
            >
              <kbd className="font-mono">⌘K</kbd>
            </button>
            <Magnetic className="hidden sm:inline-flex">
              <a href="#contact" onClick={go("contact")} className="btn-primary !min-h-10 !px-5 !text-xs tracking-[0.12em]">
                START A PROJECT
              </a>
            </Magnetic>
            <button
              ref={menuButton}
              type="button"
              className="relative grid size-11 place-items-center rounded-full border border-line lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={cn("absolute h-px w-5 bg-bone transition-transform duration-500", open ? "rotate-45" : "-translate-y-1")} />
              <span className={cn("absolute h-px w-5 bg-bone transition-transform duration-500", open ? "-rotate-45" : "translate-y-1")} />
            </button>
          </div>
        </nav>
      </header>

      {/* Menu mobile */}
      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-ink/95 backdrop-blur-xl transition-[clip-path] duration-700 ease-[var(--ease-quart)] lg:hidden",
          open ? "[clip-path:circle(150%_at_calc(100%-2.5rem)_2.5rem)]" : "pointer-events-none [clip-path:circle(0%_at_calc(100%-2.5rem)_2.5rem)]",
        )}
      >
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <nav className="container-x relative mt-28 flex flex-1 flex-col" aria-label="Navegação móvel">
          <ul className="space-y-1">
            {navItems.map((item, i) => (
              <li
                key={item.id}
                className={cn("overflow-hidden transition-all duration-700 ease-[var(--ease-expo)]", open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  className={cn(
                    "flex items-baseline gap-4 py-2 font-display text-[clamp(2.2rem,11vw,3.6rem)] font-semibold uppercase leading-none tracking-tight",
                    active === item.id ? "text-signal" : "text-bone",
                  )}
                >
                  <span className="font-mono text-xs text-steel">0{i + 1}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={cn("mt-auto space-y-4 pb-10 transition-opacity delay-500 duration-700", open ? "opacity-100" : "opacity-0")}>
            <a href="#contact" onClick={go("contact")} className="btn-primary w-full">
              START A PROJECT
            </a>
            <div className="flex items-center justify-between text-sm text-bone/60">
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-signal">
                {site.instagram.handle}
              </a>
              <AiStatusBadge />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
