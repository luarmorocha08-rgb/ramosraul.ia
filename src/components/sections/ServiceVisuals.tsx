"use client";

import { useEffect, useState } from "react";
import type { ServiceVisual } from "@/content/services";
import { cn } from "@/lib/utils";

/* 01 — Website que se monta: componentes flutuam e se encaixam */
function WebsiteVisual({ active }: { active: boolean }) {
  const [built, setBuilt] = useState(false);
  useEffect(() => {
    if (!active) return;
    const t0 = window.setTimeout(() => setBuilt(false), 0);
    const t1 = window.setTimeout(() => setBuilt(true), 300);
    const loop = window.setInterval(() => {
      setBuilt(false);
      window.setTimeout(() => setBuilt(true), 900);
    }, 6500);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearInterval(loop);
    };
  }, [active]);
  const piece = (i: number, from: string) => ({
    transform: built ? "none" : from,
    opacity: built ? 1 : 0.35,
    transition: `transform 1s cubic-bezier(.16,1,.3,1) ${i * 0.09}s, opacity .6s ${i * 0.09}s`,
  });
  return (
    <div className="perspective-1200 grid size-full place-items-center">
      <div className="preserve-3d w-[88%] rounded-xl border border-line bg-ink/80 p-3 shadow-2xl [transform:rotateX(14deg)_rotateY(-16deg)]">
        <div className="mb-3 flex gap-1" style={piece(0, "translate3d(-60px,-40px,80px)")}>
          {[0, 1, 2].map((k) => (
            <span key={k} className="size-1.5 rounded-full bg-bone/20" />
          ))}
        </div>
        <div className="mb-3 h-3 w-1/3 rounded bg-signal/70" style={piece(1, "translate3d(80px,-60px,120px) rotate(-8deg)")} />
        <div className="mb-2 h-6 w-4/5 rounded bg-bone/80" style={piece(2, "translate3d(-90px,20px,160px) rotate(6deg)")} />
        <div className="mb-4 h-6 w-3/5 rounded bg-bone/50" style={piece(3, "translate3d(100px,30px,100px)")} />
        <div className="mb-4 h-7 w-28 rounded-full bg-signal" style={piece(4, "translate3d(-40px,90px,200px) rotate(-12deg)")} />
        <div className="grid grid-cols-3 gap-2">
          {[5, 6, 7].map((k) => (
            <div key={k} className="aspect-[4/3] rounded-md border border-line bg-night" style={piece(k, `translate3d(${(k - 6) * 90}px,110px,${140 + k * 10}px) rotate(${(k - 6) * 10}deg)`)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* 02 — Núcleo de IA conectado a nós inteligentes (hover revela função) */
const AGENT_NODES = ["Atendimento", "Comercial", "Suporte", "Interno", "Ferramentas", "Multiagente"];
function AgentsVisual() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative size-full">
      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
        {AGENT_NODES.map((_, i) => {
          const a = (i / AGENT_NODES.length) * Math.PI * 2 - Math.PI / 2;
          const x = 200 + Math.cos(a) * 140;
          const y = 200 + Math.sin(a) * 140;
          return (
            <g key={i}>
              <line x1="200" y1="200" x2={x} y2={y} stroke={hover === i ? "#75E66B" : "rgb(241 238 232 / .15)"} strokeDasharray="4 6" className="animate-dash" />
              <circle r="3" fill="#75E66B">
                <animateMotion dur={`${2 + i * 0.3}s`} repeatCount="indefinite" path={`M200,200 L${x},${y}`} />
              </circle>
            </g>
          );
        })}
        <circle cx="200" cy="200" r="58" fill="rgb(117 230 107 / .08)" stroke="#75E66B" strokeOpacity=".6" />
        <circle cx="200" cy="200" r="80" fill="none" stroke="#75E66B" strokeOpacity=".15" className="origin-center animate-spin-slow" strokeDasharray="2 10" />
        <text x="200" y="205" textAnchor="middle" fill="#F1EEE8" fontSize="16" fontFamily="var(--font-mono)">
          AI CORE
        </text>
      </svg>
      {AGENT_NODES.map((n, i) => {
        const a = (i / AGENT_NODES.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] backdrop-blur transition-all",
              hover === i ? "border-signal bg-signal/15 text-signal" : "border-line bg-ink/80 text-bone/70",
            )}
            style={{ left: `${50 + Math.cos(a) * 35}%`, top: `${50 + Math.sin(a) * 35}%` }}
          >
            {n}
          </button>
        );
      })}
      <p className="absolute inset-x-0 bottom-2 text-center text-xs text-bone/50" aria-live="polite">
        {hover === null ? "Passe o mouse pelos nós" : `Agente ${AGENT_NODES[hover]!.toLowerCase()} conectado ao núcleo`}
      </p>
    </div>
  );
}

/* 03 — Fluxo de dados percorrendo plataformas */
function AutomationVisual() {
  const boxes = [
    { x: 40, y: 60, label: "Site" },
    { x: 40, y: 260, label: "WhatsApp" },
    { x: 200, y: 160, label: "Automação" },
    { x: 340, y: 60, label: "CRM" },
    { x: 340, y: 260, label: "E-mail" },
  ];
  const paths = ["M90,80 C150,80 150,180 200,180", "M90,280 C150,280 150,180 200,180", "M250,180 C300,180 300,80 340,80", "M250,180 C300,180 300,280 340,280"];
  return (
    <svg viewBox="0 0 420 340" className="size-full" aria-hidden>
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} stroke="rgb(241 238 232 / .15)" fill="none" />
          <path d={d} stroke="#75E66B" strokeOpacity=".7" fill="none" strokeDasharray="4 8" className="animate-dash" />
          {[0, 1].map((k) => (
            <circle key={k} r="4" fill={i < 2 ? "#75E66B" : "#C18B65"}>
              <animateMotion dur="2.4s" begin={`${k * 1.2 + i * 0.3}s`} repeatCount="indefinite" path={d} />
            </circle>
          ))}
        </g>
      ))}
      {boxes.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width={b.label === "Automação" ? 70 : 64} height="40" rx="10" fill="#0f1417" stroke={b.label === "Automação" ? "#75E66B" : "rgb(241 238 232 / .2)"} transform={b.label === "Automação" ? "translate(-10 0)" : undefined} />
          <text x={b.x + (b.label === "Automação" ? 25 : 32)} y={b.y + 25} textAnchor="middle" fontSize="10" fill="#F1EEE8" fontFamily="var(--font-mono)">
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* 04 — Dashboard futurista em camadas 3D */
function SaasVisual({ active }: { active: boolean }) {
  return (
    <div className="perspective-1200 grid size-full place-items-center">
      <div className={cn("preserve-3d relative h-[70%] w-[78%] transition-transform duration-[1.6s] ease-[var(--ease-expo)]", active ? "[transform:rotateX(52deg)_rotateZ(-32deg)]" : "[transform:rotateX(0)_rotateZ(0)]")}>
        {[0, 1, 2].map((layer) => (
          <div
            key={layer}
            className="absolute inset-0 rounded-xl border p-3 transition-transform duration-[1.6s] ease-[var(--ease-expo)]"
            style={{
              transform: `translateZ(${active ? layer * 60 : 0}px)`,
              borderColor: layer === 2 ? "rgb(117 230 107 / .6)" : "rgb(241 238 232 / .12)",
              background: layer === 0 ? "rgb(15 20 23 / .95)" : layer === 1 ? "rgb(25 34 29 / .6)" : "rgb(117 230 107 / .06)",
            }}
          >
            {layer === 0 && (
              <div className="grid h-full grid-cols-[1fr_3fr] gap-2">
                <div className="space-y-1.5 rounded-md bg-bone/5 p-2">
                  {[0, 1, 2, 3].map((k) => (
                    <div key={k} className="h-1.5 rounded bg-bone/15" />
                  ))}
                </div>
                <div className="rounded-md bg-bone/[0.03]" />
              </div>
            )}
            {layer === 1 && (
              <div className="flex h-full items-end gap-1.5 p-3">
                {[40, 65, 50, 80, 60, 95, 75].map((h, k) => (
                  <div key={k} className="flex-1 rounded-t bg-copper/60" style={{ height: `${h}%` }} />
                ))}
              </div>
            )}
            {layer === 2 && (
              <div className="flex h-full flex-col justify-between">
                <span className="font-mono text-[0.6rem] text-signal">MRR · ASSINANTES · CHURN</span>
                <svg viewBox="0 0 100 30" className="w-full" aria-hidden>
                  <polyline points="0,25 15,20 30,22 45,14 60,16 75,8 100,4" fill="none" stroke="#75E66B" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* 05 — Dados entram numa estrutura neural e saem organizados */
function IntegrationsVisual() {
  const inputs = ["PDF", "CSV", "E-mail", "Áudio", "Planilha"];
  return (
    <div className="grid size-full grid-cols-[1fr_auto_1fr] items-center gap-3 p-4">
      <div className="space-y-2">
        {inputs.map((t, i) => (
          <div key={t} className="rounded-md border border-line bg-ink/80 px-2 py-1.5 font-mono text-[0.6rem] text-bone/60" style={{ animation: `feed-in 3s ${i * 0.4}s ease-in-out infinite`, transform: `rotate(${(i - 2) * 4}deg)` }}>
            {t}
          </div>
        ))}
      </div>
      <svg viewBox="0 0 120 160" className="h-48 w-32" aria-hidden>
        {[0, 1, 2].map((col) =>
          [0, 1, 2, 3].map((row) => {
            const x = 20 + col * 40;
            const y = 25 + row * 37;
            return (
              <g key={`${col}-${row}`}>
                {col < 2 &&
                  [0, 1, 2, 3].map((r2) => <line key={r2} x1={x} y1={y} x2={x + 40} y2={25 + r2 * 37} stroke="#75E66B" strokeOpacity=".15" />)}
                <circle cx={x} cy={y} r="5" fill="#0f1417" stroke="#75E66B" style={{ animation: `pulse-dot 1.8s ${(col + row) * 0.2}s infinite` }} />
              </g>
            );
          }),
        )}
      </svg>
      <div className="space-y-2">
        {["Resumo", "Respostas", "Insights", "Busca"].map((t, i) => (
          <div key={t} className="flex items-center gap-2 rounded-md border border-signal/30 bg-signal/5 px-2 py-1.5 font-mono text-[0.6rem] text-signal" style={{ animation: `feed-out 3s ${1 + i * 0.4}s ease-in-out infinite` }}>
            <span className="size-1 rounded-full bg-signal" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* 06 — Blocos de código que viram interface */
function SoftwareVisual({ active }: { active: boolean }) {
  const [ui, setUi] = useState(false);
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setUi((v) => !v), 2600);
    return () => clearInterval(t);
  }, [active]);
  const lines = ["<Panel title='Pedidos'>", "  <Table data={orders} />", "  <Chart type='area' />", "  <Button>Exportar</Button>", "</Panel>"];
  return (
    <div className="relative grid size-full place-items-center">
      <div className={cn("absolute w-[80%] rounded-xl border border-line bg-[#070a0c] p-4 font-mono text-[0.7rem] leading-6 transition-all duration-700", ui ? "scale-95 opacity-0 blur-sm" : "opacity-100")}>
        {lines.map((l, i) => (
          <div key={i} className="text-bone/70">
            <span className="mr-3 text-steel">{i + 1}</span>
            <span className={l.includes("<") ? "code-token-t" : ""}>{l}</span>
          </div>
        ))}
      </div>
      <div className={cn("absolute w-[80%] rounded-xl border border-signal/40 bg-ink p-4 transition-all duration-700", ui ? "opacity-100" : "scale-105 opacity-0 blur-sm")}>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-sm font-semibold">Pedidos</span>
          <span className="rounded-full bg-signal px-3 py-1 text-[0.6rem] font-semibold text-ink">Exportar</span>
        </div>
        <div className="space-y-1.5">
          {[0, 1, 2].map((k) => (
            <div key={k} className="flex justify-between rounded bg-bone/5 px-2 py-1.5 text-[0.6rem] text-bone/60">
              <span>#{1042 + k}</span>
              <span className="text-signal">pago</span>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 100 24" className="mt-3 w-full" aria-hidden>
          <path d="M0,20 L20,14 L40,16 L60,8 L80,10 L100,3 L100,24 L0,24Z" fill="rgb(117 230 107 / .15)" />
          <path d="M0,20 L20,14 L40,16 L60,8 L80,10 L100,3" fill="none" stroke="#75E66B" />
        </svg>
      </div>
    </div>
  );
}

export default function ServiceVisualRenderer({ visual, active }: { visual: ServiceVisual; active: boolean }) {
  switch (visual) {
    case "website":
      return <WebsiteVisual active={active} />;
    case "agents":
      return <AgentsVisual />;
    case "automation":
      return <AutomationVisual />;
    case "saas":
      return <SaasVisual active={active} />;
    case "integrations":
      return <IntegrationsVisual />;
    case "software":
      return <SoftwareVisual active={active} />;
  }
}
