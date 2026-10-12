"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { projectCategories, projects, type Project, type ProjectCategory } from "@/content/projects";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { getLenis, scrollToSection } from "@/lib/scroll";
import { emit } from "@/lib/events";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import TiltCard from "@/components/ui/TiltCard";
import Magnetic from "@/components/ui/Magnetic";
import Reveal from "@/components/ui/Reveal";
import ProjectCover from "./ProjectCover";

function Cover({ project, className }: { project: Project; className?: string }) {
  return project.image ? (
    <Image src={project.image} alt="" fill sizes="(min-width:1024px) 60vw, 100vw" className={cn("object-cover object-top", className)} />
  ) : (
    <ProjectCover project={project} className={cn("absolute inset-0 size-full", className)} />
  );
}

function DemoTag() {
  return <span className="demo-badge">Conceito demonstrativo</span>;
}

/** Modal com detalhes do projeto (foco gerenciado, Esc fecha). */
function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    getLenis()?.stop();
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center p-0 md:items-center md:p-6" role="presentation">
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        data-lenis-prevent
        className="glass-strong relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-[1.75rem] md:rounded-[1.75rem]"
        style={{ animation: "palette-in .5s var(--ease-expo)" }}
      >
        <div className="relative aspect-[16/8] overflow-hidden">
          <Cover project={project} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
          <button type="button" onClick={onClose} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-line bg-ink/70 text-bone/80 hover:text-bone" aria-label="Fechar detalhes">
            ✕
          </button>
        </div>
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="kicker">{project.category}</span>
            <span className="text-xs text-bone/50">{project.context}</span>
            {project.isDemo && <DemoTag />}
          </div>
          <h3 className="mt-3 font-display text-4xl font-semibold tracking-tight">{project.name}</h3>
          <p className="mt-4 max-w-2xl text-bone/70">{project.description}</p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-3">
            {project.highlights.map((h) => (
              <li key={h} className="rounded-xl border border-line bg-ink/40 p-4 text-sm text-bone/75">
                {h}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Ver projeto ao vivo ↗
              </a>
            )}
            {project.caseStudyUrl && (
              <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                Estudo de caso ↗
              </a>
            )}
            <button
              type="button"
              className={project.demoUrl ? "btn-ghost" : "btn-primary"}
              onClick={() => {
                onClose();
                emit("contact:prefill", { description: `Quero uma solução parecida com o projeto "${project.name}".` });
                scrollToSection("contact");
              }}
            >
              Quero uma solução assim
            </button>
          </div>
          {project.isDemo && (
            <p className="mt-6 text-xs text-steel">
              Este é um conceito criado para demonstrar possibilidades — não um projeto entregue a cliente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** SELECTED WORK — portfólio premium. */
export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<ProjectCategory | "Todos">("Todos");
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const featured = projects.find((p) => p.featured) ?? projects[0]!;
  const rest = projects.filter((p) => p !== featured && (filter === "Todos" || p.category === filter));
  const showFeatured = filter === "Todos" || featured.category === filter;

  // zoom cinematográfico do destaque conforme o scroll
  useEffect(() => {
    const el = root.current?.querySelector<HTMLElement>("[data-featured-media]");
    if (!el || prefersReducedMotion()) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { scale: 1.25, yPercent: -6 }, { scale: 1, yPercent: 6, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    return () => ctx.revert();
  }, [showFeatured]);

  return (
    <section ref={root} id="projects" aria-label="Projetos selecionados" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader
          index="09"
          kicker="Selected Work"
          title="Selected"
          accent="work."
          description="Sites, catálogos e ferramentas que desenvolvi para negócios reais — cada um com uma experiência própria."
        />

        <Reveal className="mb-10 flex flex-wrap gap-2">
          {(["Todos", ...projectCategories] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={cn("chip transition-colors", filter === c ? "!border-signal/70 !bg-signal/10 !text-signal" : "hover:text-bone")}
            >
              {c}
            </button>
          ))}
        </Reveal>

        {showFeatured && (
          <Reveal className="mb-6">
            <button
              type="button"
              onClick={() => setOpen(featured)}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-line text-left sm:aspect-[16/10] lg:aspect-[16/8]"
              data-cursor-label="open"
              aria-label={`Abrir projeto em destaque: ${featured.name}`}
            >
              <div data-featured-media className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.04]">
                <Cover project={featured} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-12">
                <div>
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs text-signal">FEATURED</span>
                    <span className="kicker">{featured.category}</span>
                    <span className="text-xs text-bone/55">{featured.context}</span>
                    {featured.isDemo && <DemoTag />}
                  </div>
                  <h3 className="font-display text-[clamp(2.5rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.045em]">{featured.name}</h3>
                  <p className="mt-4 max-w-xl text-bone/70">{featured.description}</p>
                </div>
                <Magnetic>
                  <span className="grid size-24 shrink-0 place-items-center rounded-full bg-signal font-display text-sm font-semibold text-ink transition-transform duration-500 group-hover:scale-110 md:size-28">
                    Explorar
                  </span>
                </Magnetic>
              </div>
            </button>
          </Reveal>
        )}

        <ul className="grid gap-6 md:grid-cols-2">
          {rest.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 2) * 0.1}>
              <TiltCard className="h-full rounded-[1.75rem]">
                <button type="button" onClick={() => setOpen(p)} className="group block h-full w-full overflow-hidden rounded-[1.75rem] border border-line bg-ink/60 text-left" aria-label={`Abrir projeto ${p.name}`} data-cursor-label="open">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-110">
                      <Cover project={p} />
                    </div>
                    <div className="absolute left-4 top-4">{p.isDemo && <DemoTag />}</div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="kicker">{p.category}</span>
                      <span className="font-mono text-xs text-steel transition-colors group-hover:text-signal">→</span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{p.name}</h3>
                    <p className="mt-1 text-xs text-bone/45">{p.context}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-bone/60">{p.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-md bg-bone/5 px-2 py-1 font-mono text-[0.62rem] text-bone/60">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
        {rest.length === 0 && !showFeatured && <p className="text-bone/50">Nenhum projeto nesta categoria ainda.</p>}
      </div>

      {open && <ProjectDialog project={open} onClose={close} />}
    </section>
  );
}
