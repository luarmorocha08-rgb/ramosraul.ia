"use client";

import { useEffect, useRef, useState } from "react";
import { services } from "@/content/services";
import { getGsap } from "@/lib/gsap";
import { emit } from "@/lib/events";
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import ServiceVisualRenderer from "./ServiceVisuals";

const PROJECT_TYPE: Record<string, string> = {
  websites: "Website / Landing page",
  agents: "Agente de IA / Chatbot",
  automation: "Automação de processos",
  saas: "SaaS / Plataforma",
  integrations: "Integração de IA",
  software: "Software sob medida",
};

/**
 * AI CAPABILITIES — no desktop, a seção é fixada e os serviços rolam
 * horizontalmente; no mobile e com movimento reduzido, viram uma pilha vertical.
 */
export default function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [horizontal, setHorizontal] = useState(false);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const { gsap } = getGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      setHorizontal(true);
      const distance = () => tr.scrollWidth - window.innerWidth;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el.querySelector("[data-pin]"),
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => setActive(Math.min(services.length - 1, Math.round(self.progress * (services.length - 1)))),
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        setHorizontal(false);
      };
    });
    return () => mm.revert();
  }, []);

  // no modo vertical, o serviço ativo é o que está no centro da tela
  useEffect(() => {
    if (horizontal) return;
    const cards = track.current?.querySelectorAll("[data-service]");
    if (!cards) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.service))),
      { rootMargin: "-40% 0px -40% 0px" },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [horizontal]);

  const cta = (id: string) => {
    emit("contact:prefill", { projectType: PROJECT_TYPE[id] });
    scrollToSection("contact");
  };

  return (
    <section ref={root} id="capabilities" aria-label="Capabilities — o que posso criar" className="relative pt-28 md:pt-40">
      <div className="container-x">
        <SectionHeader
          index="05"
          kicker="AI Capabilities"
          title="If you can imagine it,"
          accent="we can build it."
          description="Seis frentes de atuação, cada uma com uma demonstração própria. Role para explorar."
        />
      </div>

      <div data-pin className="relative lg:h-screen lg:overflow-hidden">
        {horizontal && (
          <div className="container-x pointer-events-none absolute inset-x-0 top-8 z-10 flex items-center justify-between font-mono text-xs text-steel" aria-hidden>
            <span>
              <span className="text-signal">{services[active]!.index}</span> / 0{services.length}
            </span>
            <span className="flex gap-1.5">
              {services.map((s, i) => (
                <span key={s.id} className={cn("h-0.5 rounded-full transition-all duration-500", i === active ? "w-10 bg-signal" : "w-4 bg-bone/20")} />
              ))}
            </span>
          </div>
        )}

        <div
          ref={track}
          className={cn("flex gap-6 will-change-transform", horizontal ? "h-full items-center pl-[max(1rem,calc((100vw-1400px)/2+3.5rem))] pr-[10vw]" : "container-x flex-col pb-10")}
        >
          {services.map((s, i) => (
            <article
              key={s.id}
              data-service={i}
              aria-label={s.title}
              className={cn(
                "glass edge-glow relative grid shrink-0 overflow-hidden rounded-[1.75rem] transition-[opacity,filter] duration-700",
                horizontal ? "h-[74vh] w-[min(1080px,78vw)] grid-cols-[1fr_1.1fr]" : "w-full md:grid-cols-2",
                horizontal && i !== active && "opacity-50 [filter:saturate(0.4)]",
              )}
            >
              <div className="relative flex flex-col p-7 md:p-10">
                <span className="text-outline pointer-events-none absolute -left-1 -top-3 font-display text-[9rem] font-bold leading-none opacity-40" aria-hidden>
                  {s.index}
                </span>
                <p className="kicker relative mt-10">{s.kicker}</p>
                <h3 className="relative mt-3 font-display text-3xl font-semibold leading-[1.02] tracking-tight md:text-5xl">{s.title}</h3>
                <p className="relative mt-4 max-w-md text-bone/65">{s.description}</p>
                <ul className="relative mt-6 flex flex-wrap gap-2">
                  {s.items.map((it) => (
                    <li key={it} className="chip">
                      {it}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-auto pt-8">
                  <button type="button" onClick={() => cta(s.id)} className="btn-ghost">
                    {s.cta} →
                  </button>
                </div>
              </div>
              <div className="relative min-h-[320px] border-t border-line bg-ink/50 md:border-l md:border-t-0">
                <div className="grid-lines absolute inset-0 opacity-40" aria-hidden />
                <div className="relative size-full">
                  <ServiceVisualRenderer visual={s.visual} active={i === active} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
