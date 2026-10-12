"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import HalftoneMark from "@/components/ui/HalftoneMark";

/** WHO IS RAUL? — apresentação pessoal cinematográfica. */
export default function About() {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(profile.timeline.findIndex((t) => t.current));

  // parallax multicamadas + linhas técnicas desenhadas no scroll
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((layer) => {
        const depth = Number(layer.dataset.depth);
        gsap.fromTo(
          layer,
          { yPercent: depth * 12 },
          { yPercent: -depth * 12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
      gsap.fromTo(
        "[data-draw]",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 70%", end: "center 40%", scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="about" aria-label="Quem é Raul" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader index="01" kicker="Who is Raul?" title="Who is" accent="Raul?" />

        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* Retrato + elementos ao redor */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px]">
            <div data-depth="1.2" className="absolute -inset-10 rounded-full bg-[radial-gradient(circle_at_60%_35%,rgb(193_139_101/0.32),transparent_60%)] blur-2xl" aria-hidden />
            <div data-depth="0.4" className="glass edge-glow relative h-full overflow-hidden rounded-[2rem]">
              {profile.photo ? (
                <Image
                  src={profile.photo}
                  alt={profile.photoAlt}
                  fill
                  sizes="(min-width: 1024px) 520px, 90vw"
                  className="object-cover [filter:saturate(0.9)_contrast(1.05)]"
                />
              ) : (
                <HalftoneMark text="RR" className="absolute inset-0 size-full" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-copper/15 to-transparent mix-blend-screen" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
                <div>
                  <p className="font-display text-xl font-semibold tracking-tight">Raul Ramos</p>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-bone/55">AI Developer · Creative Technologist</p>
                </div>
                <span className="font-mono text-[0.6rem] text-signal">ID://RR-01</span>
              </div>
            </div>

            {/* órbitas e marcadores flutuantes */}
            <svg data-depth="-0.8" viewBox="0 0 400 500" className="pointer-events-none absolute -inset-6 size-[calc(100%+3rem)] overflow-visible" aria-hidden fill="none">
              <path data-draw pathLength={1} strokeDasharray="1" d="M-10 120 H120 L150 90 H260" stroke="#75E66B" strokeOpacity=".5" />
              <path data-draw pathLength={1} strokeDasharray="1" d="M410 380 H300 L270 410 H170" stroke="#C18B65" strokeOpacity=".6" />
              <ellipse cx="200" cy="250" rx="235" ry="70" stroke="#F1EEE8" strokeOpacity=".08" transform="rotate(-18 200 250)" />
              <circle cx="260" cy="90" r="3" fill="#75E66B" />
              <circle cx="170" cy="410" r="3" fill="#C18B65" />
            </svg>
            <div data-depth="-1.4" className="glass absolute -right-3 top-10 rounded-xl px-3 py-2 font-mono text-[0.62rem] text-bone/70 md:-right-8">
              <span className="text-signal">●</span> building intelligence
            </div>
            <div data-depth="-1" className="glass absolute -left-3 bottom-24 rounded-xl px-3 py-2 font-mono text-[0.62rem] text-bone/70 md:-left-8">
              {"<code />"} + <span className="text-copper">design</span> + <span className="text-signal">AI</span>
            </div>
          </div>

          {/* Texto */}
          <div>
            <Reveal as="p" className="font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-medium leading-[1.12] tracking-tight">
              {profile.headline}
            </Reveal>
            <Reveal as="p" delay={0.1} className="mt-6 text-lg leading-relaxed text-bone/70">
              {profile.intro}
            </Reveal>
            {profile.bio.map((p, i) => (
              <Reveal key={i} as="p" delay={0.15} className="mt-4 leading-relaxed text-bone/55">
                {p}
              </Reveal>
            ))}
            <Reveal stagger={0.05} className="mt-8 flex flex-wrap gap-2">
              {profile.focus.map((f) => (
                <span key={f} className="chip">
                  {f}
                </span>
              ))}
            </Reveal>

            {/* Linha do tempo interativa */}
            <Reveal className="mt-14">
              <p className="kicker mb-5">Timeline</p>
              <ol className="relative space-y-1 border-l border-line pl-6">
                {profile.timeline.map((t, i) => {
                  const on = i === step;
                  return (
                    <li key={t.title} className="relative">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute -left-[1.84rem] top-4 size-2.5 rounded-full border transition-all duration-500",
                          on ? "border-signal bg-signal shadow-[0_0_14px_rgb(117_230_107/0.9)]" : t.current ? "border-signal/60 bg-ink" : "border-steel bg-ink",
                        )}
                      />
                      <button
                        type="button"
                        aria-expanded={on}
                        onClick={() => setStep(i)}
                        onMouseEnter={() => setStep(i)}
                        className={cn("w-full rounded-xl px-4 py-3 text-left transition-colors", on ? "bg-bone/[0.04]" : "hover:bg-bone/[0.02]")}
                      >
                        <span className="flex items-center gap-3">
                          {t.period && <span className="font-mono text-xs text-steel">{t.period}</span>}
                          <span className={cn("font-display text-lg font-medium transition-colors", on ? "text-bone" : "text-bone/60")}>{t.title}</span>
                          {t.current && <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-signal">agora</span>}
                        </span>
                        <span
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-expo)]",
                            on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <span className="overflow-hidden">
                            <span className="block pt-2 text-sm leading-relaxed text-bone/60">{t.description}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <button type="button" onClick={() => scrollToSection("contact")} className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-signal hover:underline">
                → Escrever o próximo capítulo juntos
              </button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
