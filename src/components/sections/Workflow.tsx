"use client";

import { useEffect, useRef, useState } from "react";
import { processSteps, type ProcessIcon } from "@/content/process";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";

/** Ícone animado próprio de cada etapa. */
function StepIcon({ icon, active }: { icon: ProcessIcon; active: boolean }) {
  const stroke = active ? "#75E66B" : "rgb(241 238 232 / .35)";
  const common = { fill: "none", stroke, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className="size-full" aria-hidden>
      {icon === "discovery" && (
        <g {...common}>
          <circle cx="21" cy="21" r="11" />
          <path d="M29 29l9 9" />
          <circle cx="21" cy="21" r="4" style={{ transformOrigin: "21px 21px", animation: active ? "pulse-dot 1.4s infinite" : undefined }} />
        </g>
      )}
      {icon === "strategy" && (
        <g {...common}>
          <path d="M8 38 L18 24 L26 30 L40 10" strokeDasharray="60" strokeDashoffset={active ? 0 : 60} style={{ transition: "stroke-dashoffset 1.2s ease" }} />
          <path d="M33 10h7v7" />
        </g>
      )}
      {icon === "intelligence" && (
        <g {...common}>
          {[[24, 10], [10, 24], [38, 24], [24, 38], [24, 24]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 4 ? 5 : 3} style={{ animation: active ? `pulse-dot 1.6s ${i * 0.2}s infinite` : undefined, transformOrigin: `${x}px ${y}px` }} />
          ))}
          <path d="M24 13v6M13 24h6M29 24h6M24 29v6" />
        </g>
      )}
      {icon === "development" && (
        <g {...common}>
          <path d="M16 16l-8 8 8 8M32 16l8 8-8 8" />
          <path d="M27 12l-6 24" strokeDasharray="26" strokeDashoffset={active ? 0 : 26} style={{ transition: "stroke-dashoffset 1s ease" }} />
        </g>
      )}
      {icon === "integration" && (
        <g {...common}>
          <rect x="6" y="18" width="12" height="12" rx="3" />
          <rect x="30" y="18" width="12" height="12" rx="3" />
          <path d="M18 24h12" strokeDasharray="3 3" className={active ? "animate-dash" : undefined} />
        </g>
      )}
      {icon === "launch" && (
        <g {...common} style={{ transform: active ? "translateY(-3px)" : "none", transition: "transform .8s cubic-bezier(.16,1,.3,1)" }}>
          <path d="M24 6c6 5 8 13 6 22h-12c-2-9 0-17 6-22z" />
          <circle cx="24" cy="18" r="3" />
          <path d="M18 28l-5 6h7M30 28l5 6h-7M22 36h4" />
        </g>
      )}
    </svg>
  );
}

/** AI WORKFLOW — linha de progresso que acompanha o scroll. */
export default function Workflow() {
  const root = useRef<HTMLElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      if (fill.current) fill.current.style.transform = "scaleY(1)";
      const id = requestAnimationFrame(() => setActive(processSteps.length - 1));
      return () => cancelAnimationFrame(id);
    }
    const { ScrollTrigger } = getGsap();
    const list = el.querySelector("[data-steps]");
    const st = ScrollTrigger.create({
      trigger: list,
      start: "top 65%",
      end: "bottom 65%",
      scrub: true,
      onUpdate: (self) => {
        if (fill.current) fill.current.style.transform = `scaleY(${self.progress})`;
        setActive(self.progress <= 0.01 ? -1 : Math.min(processSteps.length - 1, Math.floor(self.progress * processSteps.length)));
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={root} id="workflow" aria-label="Como trabalho" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader index="08" kicker="AI Workflow" title="How I" accent="work." description="Um processo claro, do primeiro entendimento até a evolução contínua do produto." />

        <ol data-steps className="relative mx-auto max-w-5xl">
          <div className="absolute bottom-0 left-6 top-0 w-px bg-line md:left-1/2" aria-hidden>
            <div ref={fill} className="h-full w-full origin-top scale-y-0 bg-gradient-to-b from-signal via-signal to-copper" />
          </div>
          {processSteps.map((s, i) => {
            const on = i <= active;
            const left = i % 2 === 0;
            return (
              <li key={s.index} className="relative grid grid-cols-[3rem_1fr] gap-6 py-8 md:grid-cols-2 md:gap-16">
                <div className={cn("absolute left-6 top-10 z-10 -translate-x-1/2 md:left-1/2")} aria-hidden>
                  <span className={cn("block size-3 rounded-full border-2 transition-all duration-500", on ? "border-signal bg-signal shadow-[0_0_18px_rgb(117_230_107/0.8)]" : "border-steel bg-ink")} />
                </div>
                <div className={cn("col-start-2 md:col-start-auto", left ? "md:col-start-1 md:text-right" : "md:col-start-2")}>
                  <div className={cn("glass inline-block w-full max-w-md rounded-2xl p-6 text-left transition-all duration-700 ease-[var(--ease-expo)]", on ? "translate-y-0 opacity-100" : "translate-y-6 opacity-40")}>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="size-12 rounded-xl border border-line bg-ink/60 p-2.5">
                        <StepIcon icon={s.icon} active={i === active} />
                      </span>
                      <span className={cn("font-display text-4xl font-bold transition-colors", on ? "text-signal" : "text-outline")}>{s.index}</span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-2 text-bone/60">{s.description}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
