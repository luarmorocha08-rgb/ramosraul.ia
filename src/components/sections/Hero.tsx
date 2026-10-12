"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { bootDelay, getGsap, prefersReducedMotion } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scroll";
import { on } from "@/lib/events";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/ui/Magnetic";
import SplitHeading from "@/components/ui/SplitHeading";
import { SHAPES, SHAPE_LABELS } from "@/components/three/shapes";
import { sceneState, setShape } from "@/components/three/sceneStore";

/**
 * HERO — Intelligence in Motion
 * A cena de partículas fica no fundo (SceneBackground). Aqui controlamos
 * a interação: arrastar gira a estrutura, clicar reconfigura a forma.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const coords = useRef<HTMLSpanElement>(null);
  const [shape, setShapeState] = useState(0);

  const choose = (i: number) => {
    sceneState.heroShape = i;
    sceneState.pulse = 1;
    setShape(i);
    setShapeState(i);
  };

  useEffect(() => on("hero:shape", ({ shape: s }) => choose(s)), []);

  // arrastar para girar · clique para reconfigurar
  useEffect(() => {
    const el = root.current?.querySelector<HTMLElement>("[data-hero-surface]");
    if (!el) return;
    let down: { x: number; y: number; dx: number; dy: number } | null = null;
    const pd = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // no toque, o gesto é scroll
      down = { x: e.clientX, y: e.clientY, dx: sceneState.drag.x, dy: sceneState.drag.y };
      el.setPointerCapture(e.pointerId);
    };
    const pm = (e: PointerEvent) => {
      if (coords.current) {
        const x = ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3);
        const y = (-(e.clientY / window.innerHeight) * 2 + 1).toFixed(3);
        coords.current.textContent = `X ${x.padStart(6, " ")}  Y ${y.padStart(6, " ")}`;
      }
      if (!down) return;
      sceneState.drag.y = down.dy + (e.clientX - down.x) * 0.008;
      sceneState.drag.x = Math.max(-1, Math.min(1, down.dx + (e.clientY - down.y) * 0.006));
    };
    const pu = (e: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved < 6) choose((sceneState.heroShape + 1) % SHAPES.length);
    };
    el.addEventListener("pointerdown", pd);
    window.addEventListener("pointermove", pm, { passive: true });
    el.addEventListener("pointerup", pu);
    return () => {
      el.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointermove", pm);
      el.removeEventListener("pointerup", pu);
    };
  }, []);

  // entrada dos elementos + parallax de saída com o scroll
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      if (document.documentElement.dataset.boot === "full") {
        // revelado pela intro: só um leve "assentar" de profundidade, sem ocultar conteúdo
        gsap.from("[data-hero-content]", { scale: 1.06, duration: 1.6, ease: "expo.out", delay: bootDelay() - 0.2, clearProps: "scale" });
      } else {
        gsap.from("[data-hero-fade]", { opacity: 0, y: 24, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: bootDelay() + 0.25 });
      }
      gsap.to("[data-hero-content]", {
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="home" aria-label="Apresentação" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      {/* superfície de interação com a cena 3D */}
      <div data-hero-surface data-cursor-label="drag · click" className="absolute inset-0 z-[1] cursor-grab active:cursor-grabbing" aria-hidden />

      <div data-hero-content className="container-x pointer-events-none relative z-10 flex flex-1 flex-col justify-center pb-28 pt-32 md:pt-36">
        <div data-hero-fade className="mb-8 flex flex-wrap items-center gap-3">
          <span className="chip pointer-events-auto">
            <span className="size-1.5 rounded-full bg-signal animate-pulse-dot" aria-hidden />
            {site.signature}
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-steel">{site.instagram.handle}</span>
        </div>

        <SplitHeading
          as="h1"
          trigger="load"
          className="max-w-[16ch] font-display text-[clamp(2.7rem,8.4vw,8.4rem)] font-bold uppercase leading-[0.88] tracking-[-0.055em]"
          lines={[
            { text: "I don't just" },
            { text: "write code." },
            { text: "I build", className: "text-gradient-signal" },
            { text: "intelligence.", className: "text-gradient-signal" },
          ]}
        />

        <p data-hero-fade className="mt-8 max-w-xl text-base leading-relaxed text-bone/70 md:text-lg">
          Desenvolvo sites, sistemas, automações e experiências digitais impulsionadas por inteligência artificial.
        </p>

        <div data-hero-fade className="pointer-events-auto mt-10 flex flex-wrap items-center gap-3">
          <Magnetic>
            <button type="button" className="btn-primary" onClick={() => scrollToSection("lab")} data-cursor-label="AI Lab">
              Explorar meu universo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Magnetic>
          <Magnetic>
            <button type="button" className="btn-ghost" onClick={() => scrollToSection("projects")}>
              Conhecer meus projetos
            </button>
          </Magnetic>
        </div>
      </div>

      {/* HUD: controles do objeto 3D, coordenadas, status, scroll */}
      <div className="container-x pointer-events-none relative z-10 pb-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div data-hero-fade className="pointer-events-auto">
            <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-steel" id="shape-label">
              Configuração da estrutura <span className="hidden md:inline">· arraste para girar · clique para reconfigurar</span>
            </p>
            <div role="radiogroup" aria-labelledby="shape-label" className="flex flex-wrap gap-1.5">
              {SHAPES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={shape === i}
                  onClick={() => choose(i)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-all duration-300",
                    shape === i ? "border-signal/70 bg-signal/15 text-signal" : "border-line bg-ink/40 text-bone/55 hover:border-bone/30 hover:text-bone",
                  )}
                >
                  {SHAPE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div data-hero-fade className="hidden items-end gap-8 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-steel md:flex" aria-hidden>
            <div className="space-y-1 text-right">
              <div>
                SYS <span className="text-signal">● ONLINE</span>
              </div>
              <span ref={coords} className="whitespace-pre text-bone/50">
                X  0.000  Y  0.000
              </span>
            </div>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => scrollToSection("about")}
              className="pointer-events-auto flex flex-col items-center gap-2 text-bone/60 hover:text-signal"
            >
              Scroll
              <span className="relative block h-12 w-px overflow-hidden bg-line">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-scan bg-signal" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-b from-transparent to-ink" aria-hidden />
    </section>
  );
}
