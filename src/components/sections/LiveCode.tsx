"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";

type Tok = [string, string?];

/** Código fixo e tokenizado à mão — nada é executado. Cada linha pertence a uma etapa. */
const CODE: Array<{ stage: number; tokens: Tok[] }> = [
  { stage: 0, tokens: [["import", "k"], [" { motion } "], ["from", "k"], [" "], ["'./engine'", "s"]] },
  { stage: 0, tokens: [] },
  { stage: 1, tokens: [["export default function", "k"], [" "], ["Launch", "f"], ["() {"]] },
  { stage: 1, tokens: [["  return", "k"], [" ("]] },
  { stage: 1, tokens: [["    <"], ["Screen", "t"], [" "], ["theme", "a"], ["="], ['"night"', "s"], [">"]] },
  { stage: 1, tokens: [["      <"], ["Title", "t"], [">"], ["Pequenas ideias."], ["</"], ["Title", "t"], [">"]] },
  { stage: 2, tokens: [["      <"], ["Button", "t"], [" "], ["glow", "a"], [" "], ["onClick", "a"], ["={"], ["start", "f"], ["}>"]] },
  { stage: 2, tokens: [["        Começar"]] },
  { stage: 2, tokens: [["      </"], ["Button", "t"], [">"]] },
  { stage: 3, tokens: [["      <"], ["Grid", "t"], [">"]] },
  { stage: 3, tokens: [["        {"], ["metrics", "a"], ["."], ["map", "f"], ["(m => <"], ["Card", "t"], [" {...m} />)}"]] },
  { stage: 3, tokens: [["      </"], ["Grid", "t"], [">"]] },
  { stage: 4, tokens: [["      <"], ["motion.div", "t"], [" "], ["animate", "a"], ["={{ "], ["y", "a"], [": ["], ["0", "s"], [", "], ["-8", "s"], ["] }} />"]] },
  { stage: 5, tokens: [["      <"], ["Live", "t"], [" "], ["data", "a"], ["={"], ["stream", "f"], ["} />"]] },
  { stage: 5, tokens: [["    </"], ["Screen", "t"], [">"]] },
  { stage: 5, tokens: [["  )"]] },
  { stage: 5, tokens: [["}"]] },
];

const STAGES = ["Imports", "Layout", "Button", "Cards", "Motion", "Live"];

function Preview({ stage }: { stage: number }) {
  const show = (s: number) => stage >= s;
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-[#0d1210] p-5 md:p-7">
      <div className="mb-4 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel">
        <span>preview · localhost:3000</span>
        <span className={cn("flex items-center gap-1.5", show(5) ? "text-signal" : "")}>
          <span className={cn("size-1.5 rounded-full", show(5) ? "bg-signal animate-pulse-dot" : "bg-steel")} />
          {show(5) ? "live" : "building"}
        </span>
      </div>

      {!show(1) && (
        <div className="grid h-[80%] place-items-center font-mono text-xs text-steel">
          <span>
            aguardando render<span className="animate-blink">_</span>
          </span>
        </div>
      )}

      <div className={cn("transition-all duration-700 ease-[var(--ease-expo)]", show(1) ? "opacity-100" : "translate-y-6 opacity-0")}>
        <p className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          Pequenas ideias.
          <span className={cn("block text-gradient-signal transition-opacity duration-700", show(5) ? "opacity-100" : "opacity-0")}>Grandes resultados.</span>
        </p>
        <div className={cn("mt-6 transition-all duration-700 ease-[var(--ease-expo)]", show(2) ? "scale-100 opacity-100" : "scale-75 opacity-0")}>
          <span className={cn("inline-flex rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-ink", show(4) && "shadow-[0_0_40px_rgb(117_230_107/0.6)]")}>Começar</span>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {["Leads", "Automação", "Respostas"].map((label, i) => (
            <div
              key={label}
              className={cn("rounded-xl border border-line bg-ink/60 p-3 transition-all duration-700 ease-[var(--ease-expo)]", show(3) ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")}
              style={{ transitionDelay: show(3) ? `${i * 90}ms` : "0ms", animation: show(4) ? `float 4s ${i * 0.4}s ease-in-out infinite` : undefined }}
            >
              <span className="block font-mono text-[0.58rem] uppercase tracking-[0.14em] text-steel">{label}</span>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-bone/10">
                <span className={cn("block h-full rounded-full bg-signal transition-all duration-1000", show(5) ? "w-full" : "w-1/3")} style={{ transitionDelay: `${i * 150}ms` }} />
              </span>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 300 60" className={cn("mt-6 w-full transition-opacity duration-700", show(5) ? "opacity-100" : "opacity-0")} aria-hidden>
          <path d="M0 50 C40 45, 60 20, 100 30 S170 10, 200 22 S260 5, 300 8" fill="none" stroke="#75E66B" strokeWidth="2" strokeDasharray="400" strokeDashoffset={show(5) ? 0 : 400} style={{ transition: "stroke-dashoffset 1.6s ease" }} />
        </svg>
      </div>
    </div>
  );
}

/** FROM CODE TO EXPERIENCE — o scroll escreve o código e a interface ganha vida. */
export default function LiveCode() {
  const root = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => setStage(STAGES.length - 1));
      return () => cancelAnimationFrame(id);
    }
    const { gsap, ScrollTrigger } = getGsap();
    const mm = gsap.matchMedia();
    const onUpdate = (self: ScrollTrigger) => {
      if (!manual) setStage(Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length)));
    };
    mm.add("(min-width: 1024px)", () => {
      const st = ScrollTrigger.create({ trigger: el.querySelector("[data-pin]"), start: "top top+=40", end: "+=1600", pin: true, scrub: true, onUpdate });
      return () => st.kill();
    });
    mm.add("(max-width: 1023px)", () => {
      const st = ScrollTrigger.create({ trigger: el.querySelector("[data-pin]"), start: "top 75%", end: "bottom 60%", scrub: true, onUpdate });
      return () => st.kill();
    });
    return () => mm.revert();
  }, [manual]);

  return (
    <section ref={root} id="code" aria-label="From code to experience" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader index="07" kicker="Live Code Experience" title="From code" accent="to experience." description="Role a página e acompanhe: cada linha escrita vira parte de uma interface real." />
      </div>
      <div data-pin className="container-x">
        <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="Etapas do build">
          {STAGES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setManual(true);
                setStage(i);
              }}
              aria-pressed={stage === i}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition-colors",
                i <= stage ? "border-signal/50 text-signal" : "border-line text-steel-light",
                i === stage && "bg-signal/10",
              )}
            >
              {String(i + 1).padStart(2, "0")} {s}
            </button>
          ))}
          {manual && (
            <button type="button" onClick={() => setManual(false)} className="ml-2 font-mono text-[0.62rem] text-steel underline hover:text-bone">
              seguir o scroll
            </button>
          )}
        </div>
        <div className="grid gap-4 lg:h-[72vh] lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-[#070a0c]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="size-2 rounded-full bg-danger/60" />
              <span className="size-2 rounded-full bg-copper/60" />
              <span className="size-2 rounded-full bg-signal/60" />
              <span className="ml-3 font-mono text-[0.65rem] text-steel">app/launch.tsx</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[0.72rem] leading-6 md:p-6 md:text-[0.8rem]" aria-label="Código de exemplo">
              {CODE.map((line, i) => {
                const visible = line.stage <= stage;
                const current = line.stage === stage;
                return (
                  <div key={i} className={cn("flex transition-all duration-500", visible ? "opacity-100" : "opacity-0", current && "bg-signal/[0.05]")}>
                    <span className="mr-4 w-6 shrink-0 select-none text-right text-steel/60">{i + 1}</span>
                    <code>
                      {line.tokens.map(([text, kind], k) => (
                        <span key={k} className={kind ? `code-token-${kind}` : "text-bone/80"}>
                          {text}
                        </span>
                      ))}
                      {current && i === CODE.findLastIndex((l) => l.stage === stage) && <span className="animate-blink text-signal">▌</span>}
                    </code>
                  </div>
                );
              })}
            </pre>
          </div>
          <Preview stage={stage} />
        </div>
      </div>
    </section>
  );
}
