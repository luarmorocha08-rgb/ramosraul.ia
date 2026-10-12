"use client";

import { useEffect, useRef, useState } from "react";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";

type NodeId = "user" | "orchestrator" | "strategist" | "research" | "content" | "design" | "analysis" | "output";

interface AgentNode {
  id: NodeId;
  label: string;
  role: string;
  desk: [number, number];
  mob: [number, number];
}

const NODES: AgentNode[] = [
  { id: "user", label: "Você", role: "Solicitação", desk: [8, 50], mob: [50, 6] },
  { id: "orchestrator", label: "Orquestrador", role: "Coordena os agentes", desk: [32, 50], mob: [50, 24] },
  { id: "strategist", label: "Estrategista", role: "Objetivo e público", desk: [56, 12], mob: [18, 44] },
  { id: "research", label: "Pesquisa", role: "Mercado e referências", desk: [74, 30], mob: [82, 44] },
  { id: "content", label: "Conteúdo", role: "Textos e roteiros", desk: [74, 70], mob: [18, 64] },
  { id: "design", label: "Design", role: "Identidade visual", desk: [56, 88], mob: [82, 64] },
  { id: "analysis", label: "Análise", role: "Métricas e revisão", desk: [56, 50], mob: [50, 80] },
  { id: "output", label: "Entrega", role: "Plano de campanha", desk: [93, 50], mob: [50, 95] },
];

const EDGES: Array<[NodeId, NodeId]> = [
  ["user", "orchestrator"],
  ["orchestrator", "strategist"],
  ["strategist", "research"],
  ["research", "content"],
  ["content", "design"],
  ["design", "analysis"],
  ["orchestrator", "analysis"],
  ["analysis", "output"],
];

const STEPS: Array<{ from: NodeId; to: NodeId; agent: NodeId; text: string }> = [
  { from: "user", to: "orchestrator", agent: "orchestrator", text: "Pedido recebido: “Criar uma campanha digital para o lançamento de uma cafeteria.” Dividindo em tarefas…" },
  { from: "orchestrator", to: "strategist", agent: "strategist", text: "Definindo objetivo (visitas na primeira semana), público local e mensagem central." },
  { from: "strategist", to: "research", agent: "research", text: "Levantando referências do segmento, datas relevantes e canais com maior alcance local." },
  { from: "research", to: "content", agent: "content", text: "Escrevendo roteiro de 3 posts, legenda de lançamento e mensagem para WhatsApp." },
  { from: "content", to: "design", agent: "design", text: "Gerando direção visual: paleta quente, tipografia editorial e templates de post." },
  { from: "design", to: "analysis", agent: "analysis", text: "Revisando consistência, sugerindo métricas de acompanhamento e checklist de publicação." },
  { from: "analysis", to: "output", agent: "output", text: "Plano de campanha consolidado e entregue para aprovação humana. ✓" },
];

/** Animação própria de cada agente. */
function AgentGlyph({ id, active }: { id: NodeId; active: boolean }) {
  const s = active ? "#75E66B" : "rgb(241 238 232 / .45)";
  switch (id) {
    case "strategist":
      return (
        <svg viewBox="0 0 24 24" className={cn("size-5", active && "animate-[spin_3s_linear_infinite]")} aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke={s} strokeDasharray="3 3" />
          <path d="M12 5l2 7-2 7-2-7z" fill={s} />
        </svg>
      );
    case "research":
      return (
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <circle cx="11" cy="11" r="6" fill="none" stroke={s} />
          <path d="M16 16l4 4" stroke={s} />
          {active && <line x1="5" x2="17" y1="11" y2="11" stroke={s} className="animate-[scan_1s_linear_infinite]" />}
        </svg>
      );
    case "content":
      return (
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          {[7, 12, 17].map((y, i) => (
            <line key={y} x1="4" x2={active ? 20 - i * 4 : 8} y1={y} y2={y} stroke={s} strokeWidth="2" strokeLinecap="round" style={{ transition: `x2 .6s ${i * 0.15}s` }} />
          ))}
        </svg>
      );
    case "design":
      return (
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <circle cx="9" cy="10" r="5" fill={active ? "#75E66B" : "none"} stroke={s} fillOpacity=".5" />
          <circle cx="15" cy="10" r="5" fill={active ? "#C18B65" : "none"} stroke={s} fillOpacity=".5" />
          <circle cx="12" cy="15" r="5" fill={active ? "#F1EEE8" : "none"} stroke={s} fillOpacity=".3" />
        </svg>
      );
    case "analysis":
      return (
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          {[6, 11, 16].map((x, i) => (
            <rect key={x} x={x - 1.5} width="3" rx="1" fill={s} y={active ? 20 - (i + 1) * 5 : 16} height={active ? (i + 1) * 5 : 4} style={{ transition: "all .6s" }} />
          ))}
        </svg>
      );
    case "orchestrator":
      return (
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <circle cx="12" cy="12" r="3" fill={s} />
          <circle cx="12" cy="12" r="8" fill="none" stroke={s} className={active ? "animate-pulse-dot" : undefined} style={{ transformOrigin: "center" }} />
        </svg>
      );
    default:
      return <span className={cn("block size-2.5 rounded-full", active ? "bg-signal" : "bg-bone/40")} aria-hidden />;
  }
}

/** AI ORCHESTRATION — simulação guiada de agentes colaborando. */
export default function Orchestration() {
  const desktop = useIsDesktop();
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);
  const pos = (id: NodeId) => {
    const n = NODES.find((x) => x.id === id)!;
    return desktop ? n.desk : n.mob;
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const advance = (s: number) => {
    setStep(s);
    if (s < STEPS.length - 1) timer.current = window.setTimeout(() => advance(s + 1), 1900);
    else setRunning(false);
  };

  const start = () => {
    if (timer.current) clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(STEPS.length - 1);
      return;
    }
    setRunning(true);
    advance(0);
  };

  const current = STEPS[step];
  const visited = new Set<NodeId>(["user", ...STEPS.slice(0, step + 1).flatMap((s) => [s.from, s.to])]);
  const edgeActive = (a: NodeId, b: NodeId) => STEPS.slice(0, step + 1).some((s) => (s.from === a && s.to === b) || (s.from === b && s.to === a));

  return (
    <section id="orchestration" aria-label="Orquestração de agentes de IA" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader
          index="03"
          kicker="AI Orchestration"
          title="Many agents."
          accent="One mission."
          description="Sistemas multiagentes dividem um objetivo complexo entre especialistas que trabalham em conjunto. Execute a simulação guiada e veja o fluxo de informações."
        />

        <Reveal className="glass relative overflow-hidden rounded-[1.75rem] p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="demo-badge">Simulação guiada · ilustra o conceito, sem execução real</span>
            <div className="flex gap-2">
              <button type="button" onClick={start} disabled={running} className="btn-primary !min-h-10 disabled:opacity-50">
                {running ? "Executando…" : step >= STEPS.length - 1 ? "Executar novamente" : "Executar simulação"} ▶
              </button>
              {!running && step >= 0 && step < STEPS.length - 1 && (
                <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-ghost !min-h-10">
                  Próximo passo
                </button>
              )}
            </div>
          </div>

          <div className={cn("relative w-full", desktop ? "aspect-[16/8]" : "aspect-[3/4]")}>
            <div className="grid-lines absolute inset-0 opacity-40" aria-hidden />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
              {EDGES.map(([a, b]) => {
                const [x1, y1] = pos(a);
                const [x2, y2] = pos(b);
                const on = edgeActive(a, b);
                const live = current && ((current.from === a && current.to === b) || (current.from === b && current.to === a));
                return (
                  <g key={`${a}-${b}`}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? "#75E66B" : "rgb(241 238 232 / .12)"} strokeWidth={live ? 0.5 : 0.25} vectorEffect="non-scaling-stroke" strokeDasharray={on ? undefined : "1 1.5"} />
                    {live && (
                      <circle r="0.9" fill="#75E66B">
                        <animateMotion dur="1.2s" repeatCount="indefinite" path={`M${pos(current.from)[0]},${pos(current.from)[1]} L${pos(current.to)[0]},${pos(current.to)[1]}`} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {NODES.map((n) => {
              const [x, y] = desktop ? n.desk : n.mob;
              const active = current?.agent === n.id || (n.id === "user" && step === 0);
              const done = visited.has(n.id) && step >= 0;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-2xl border px-3 py-2 backdrop-blur-md transition-all duration-500",
                    active ? "scale-110 border-signal bg-signal/15 shadow-[0_0_40px_-6px_rgb(117_230_107/0.7)]" : done ? "border-signal/40 bg-ink/80" : "border-line bg-ink/80",
                    n.id === "orchestrator" && "rounded-full",
                  )}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <AgentGlyph id={n.id} active={active} />
                  <span>
                    <span className="block whitespace-nowrap text-xs font-medium md:text-sm">{n.label}</span>
                    <span className="hidden whitespace-nowrap font-mono text-[0.55rem] uppercase tracking-[0.12em] text-steel md:block">{n.role}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 min-h-[4.5rem] rounded-2xl border border-line bg-ink/60 p-4 font-mono text-xs leading-relaxed" aria-live="polite">
            {current ? (
              <p key={step} style={{ animation: "msg-in .4s var(--ease-expo)" }}>
                <span className="text-signal">[{NODES.find((x) => x.id === current.agent)!.label.toUpperCase()}]</span> <span className="text-bone/80">{current.text}</span>
              </p>
            ) : (
              <p className="text-steel">Pedido de exemplo: “Criar uma campanha digital para o lançamento de uma cafeteria.” Clique em Executar simulação.</p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
