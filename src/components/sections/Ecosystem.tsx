"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { stack, techGroups, type TechNode } from "@/content/stack";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";

interface Projected {
  x: number;
  y: number;
  z: number;
  s: number;
}

/**
 * AI ECOSYSTEM — universo 3D de tecnologias (projeção 3D própria em DOM/SVG):
 * nós orbitando, rotação com arraste/mouse, zoom com scroll, tooltips,
 * destaque de tecnologias relacionadas e partículas entre conexões.
 */
export default function Ecosystem() {
  const stage = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const spokeRefs = useRef<Array<SVGLineElement | null>>([]);
  const linkRefs = useRef<Array<SVGLineElement | null>>([]);
  const packetRefs = useRef<Array<SVGCircleElement | null>>([]);
  const inView = useInView(stage, "100px");
  const [selected, setSelected] = useState<string>("nextjs");
  const [hovered, setHovered] = useState<string | null>(null);
  const focusId = hovered ?? selected;
  const rotation = useRef({ x: -0.25, y: 0, vx: 0, vy: 0.0016, zoom: 0.85 });

  const base = useMemo(() => {
    const golden = Math.PI * (3 - Math.sqrt(5));
    return stack.map((_, i) => {
      const y = 1 - (i / (stack.length - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      return { x: Math.cos(golden * i) * r, y: y * 0.82, z: Math.sin(golden * i) * r };
    });
  }, []);

  const links = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<[number, number]> = [];
    stack.forEach((t, i) =>
      t.related.forEach((rid) => {
        const j = stack.findIndex((s) => s.id === rid);
        const key = [i, j].sort().join("-");
        if (j >= 0 && !seen.has(key)) {
          seen.add(key);
          out.push([i, j]);
        }
      }),
    );
    return out;
  }, []);

  // zoom dirigido pelo scroll
  useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const { ScrollTrigger } = getGsap();
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        rotation.current.zoom = 0.72 + Math.sin(self.progress * Math.PI) * 0.38;
      },
    });
    return () => st.kill();
  }, []);

  // arraste para girar
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let last: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      last = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!last) return;
      rotation.current.vy = (e.clientX - last.x) * 0.0004;
      rotation.current.x = Math.max(-1.1, Math.min(1.1, rotation.current.x + (e.clientY - last.y) * 0.005));
      rotation.current.y += (e.clientX - last.x) * 0.006;
      last = { x: e.clientX, y: e.clientY };
    };
    const up = () => (last = null);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  // loop de projeção (somente quando visível)
  useEffect(() => {
    const el = stage.current;
    if (!el || !inView) return;
    const reduced = prefersReducedMotion();
    let raf = 0;
    const t0 = performance.now();
    const proj: Projected[] = base.map(() => ({ x: 0, y: 0, z: 0, s: 1 }));

    const frame = (now: number) => {
      const r = rotation.current;
      if (!reduced) {
        r.y += r.vy;
        r.vy += (0.0016 - r.vy) * 0.02;
      }
      const w = el.clientWidth;
      const h = el.clientHeight;
      const R = Math.min(w, h) * (w < 640 ? 0.3 : 0.36) * r.zoom;
      const cy = Math.cos(r.y), sy = Math.sin(r.y), cx = Math.cos(r.x), sx = Math.sin(r.x);

      base.forEach((p, i) => {
        const x1 = p.x * cy - p.z * sy;
        const z1 = p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const persp = 2.6 / (2.6 + z2);
        const pr = proj[i]!;
        pr.x = w / 2 + x1 * R * persp;
        pr.y = h / 2 + y2 * R * persp;
        pr.z = z2;
        pr.s = persp;
        const node = nodeRefs.current[i];
        if (node) {
          node.style.transform = `translate3d(${pr.x}px, ${pr.y}px, 0) translate(-50%, -50%) scale(${0.75 + persp * 0.35})`;
          node.style.zIndex = String(Math.round((1 - z2) * 100));
          node.style.opacity = String(0.35 + ((1 - z2) / 2) * 0.65);
        }
        const spoke = spokeRefs.current[i];
        if (spoke) {
          spoke.setAttribute("x1", String(w / 2));
          spoke.setAttribute("y1", String(h / 2));
          spoke.setAttribute("x2", String(pr.x));
          spoke.setAttribute("y2", String(pr.y));
        }
      });
      const t = (now - t0) / 1000;
      links.forEach(([a, b], k) => {
        const A = proj[a]!, B = proj[b]!;
        const line = linkRefs.current[k];
        if (line) {
          line.setAttribute("x1", String(A.x));
          line.setAttribute("y1", String(A.y));
          line.setAttribute("x2", String(B.x));
          line.setAttribute("y2", String(B.y));
        }
        const packet = packetRefs.current[k];
        if (packet) {
          const f = reduced ? 0.5 : (t * 0.35 + k * 0.17) % 1;
          packet.setAttribute("cx", String(A.x + (B.x - A.x) * f));
          packet.setAttribute("cy", String(A.y + (B.y - A.y) * f));
        }
      });
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    // com movimento reduzido, re-renderiza ao arrastar
    const redraw = () => reduced && requestAnimationFrame(frame);
    el.addEventListener("pointermove", redraw);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", redraw);
    };
  }, [base, links, inView]);

  const focus = stack.find((s) => s.id === focusId) as TechNode;
  const sel = stack.find((s) => s.id === selected) as TechNode;
  const isRelated = (id: string) => id === focusId || focus.related.includes(id) || stack.find((s) => s.id === id)?.related.includes(focusId);

  return (
    <section id="ecosystem" aria-label="Ecossistema de tecnologias" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader
          index="06"
          kicker="AI Ecosystem"
          title="A universe of"
          accent="technologies."
          description="Ferramentas que podem compor a solução certa para cada projeto. Arraste para girar, passe o mouse para ver conexões e clique para explorar."
        />

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="glass relative overflow-hidden rounded-[1.75rem]">
            <div ref={stage} className="relative aspect-square w-full cursor-grab touch-pan-y select-none active:cursor-grabbing md:aspect-[4/3]" data-cursor-label="drag">
              <div className="grid-lines absolute inset-0 opacity-50" aria-hidden />
              <svg className="absolute inset-0 size-full" aria-hidden>
                {stack.map((t, i) => (
                  <line
                    key={t.id}
                    ref={(el) => {
                      spokeRefs.current[i] = el;
                    }}
                    stroke={t.id === focusId ? "#75E66B" : "rgb(241 238 232 / .06)"}
                    strokeDasharray="2 6"
                  />
                ))}
                {links.map(([a, b], k) => {
                  const hot = stack[a]!.id === focusId || stack[b]!.id === focusId;
                  return (
                    <g key={k}>
                      <line
                        ref={(el) => {
                          linkRefs.current[k] = el;
                        }}
                        stroke={hot ? "#75E66B" : "rgb(241 238 232 / .1)"}
                        strokeOpacity={hot ? 0.8 : 1}
                      />
                      <circle
                        ref={(el) => {
                          packetRefs.current[k] = el;
                        }}
                        r={hot ? 3 : 1.6}
                        fill={hot ? "#75E66B" : "#C18B65"}
                        opacity={hot ? 1 : 0.6}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* núcleo */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="mx-auto mb-2 size-3 rounded-full bg-signal shadow-[0_0_30px_8px_rgb(117_230_107/0.45)]" />
                <p className="font-display text-sm font-bold tracking-[0.25em]">RAUL RAMOS</p>
              </div>

              {stack.map((t, i) => (
                <button
                  key={t.id}
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(t.id)}
                  onBlur={() => setHovered(null)}
                  aria-pressed={selected === t.id}
                  className={cn(
                    "absolute left-0 top-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-[background-color,border-color,color,box-shadow] duration-300",
                    selected === t.id
                      ? "border-signal bg-signal text-ink shadow-[0_0_24px_rgb(117_230_107/0.5)]"
                      : isRelated(t.id)
                        ? "border-signal/60 bg-ink/80 text-bone"
                        : "border-line bg-ink/70 text-bone/70",
                  )}
                >
                  <span className="mr-1.5 inline-block size-1.5 rounded-full align-middle" style={{ background: techGroups[t.group].color }} aria-hidden />
                  {t.name}
                </button>
              ))}

              {hovered && hovered !== selected && (
                <div className="pointer-events-none absolute bottom-4 left-4 z-[200] max-w-[16rem] rounded-xl border border-line bg-ink/90 px-3 py-2 text-xs text-bone/80 backdrop-blur" role="tooltip">
                  <strong className="text-bone">{focus.name}</strong> — {focus.summary}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="glass flex flex-col rounded-[1.75rem] p-6 md:p-8">
            <p className="kicker" style={{ color: techGroups[sel.group].color }}>
              {techGroups[sel.group].label}
            </p>
            <h3 className="mt-2 font-display text-4xl font-semibold tracking-tight">{sel.name}</h3>
            <p className="mt-3 text-bone/65">{sel.summary}</p>
            <p className="kicker mt-8 mb-3">Como pode ser usado em projetos</p>
            <ul className="space-y-2">
              {sel.uses.map((u) => (
                <li key={u} className="flex items-center gap-3 rounded-xl border border-line bg-ink/40 px-4 py-3 text-sm">
                  <span className="text-signal" aria-hidden>
                    ↳
                  </span>
                  {u}
                </li>
              ))}
            </ul>
            <p className="kicker mt-8 mb-3">Combina com</p>
            <div className="flex flex-wrap gap-2">
              {sel.related.map((rid) => {
                const r = stack.find((s) => s.id === rid);
                return r ? (
                  <button key={rid} type="button" onClick={() => setSelected(rid)} className="chip transition-colors hover:border-signal/60 hover:text-bone">
                    {r.name}
                  </button>
                ) : null;
              })}
            </div>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              {Object.entries(techGroups).map(([k, g]) => (
                <span key={k} className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">
                  <span className="size-1.5 rounded-full" style={{ background: g.color }} aria-hidden />
                  {g.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
