"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";

const BEFORE = ["Atendimento manual", "Processos repetitivos", "Informações descentralizadas", "Respostas demoradas"];
const AFTER = ["Atendimento assistido por IA", "Automação de tarefas", "Informações organizadas", "Processos mais eficientes"];

function BeforeScene() {
  return (
    <div className="absolute inset-0 bg-[#121212] p-5 md:p-8">
      <div className="mb-4 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-bone/40">
        <span>Before AI</span>
        <span className="text-danger/80">● 47 mensagens não lidas</span>
      </div>
      <div className="relative h-[85%]">
        {[
          { t: "Planilha_vendas_FINAL_v3.xlsx", x: 4, y: 6, r: -6 },
          { t: "Responder cliente (ontem!)", x: 52, y: 4, r: 4 },
          { t: "Copiar pedidos p/ sistema", x: 10, y: 38, r: 3 },
          { t: "Onde está o contrato?", x: 58, y: 34, r: -3 },
          { t: "Agenda no papel", x: 30, y: 64, r: -5 },
          { t: "Mesma dúvida pela 12ª vez", x: 62, y: 66, r: 6 },
        ].map((n) => (
          <div
            key={n.t}
            className="absolute w-[38%] rounded-md border border-bone/10 bg-[#1d1d1d] p-3 font-mono text-[0.65rem] text-bone/55 shadow-xl"
            style={{ left: `${n.x}%`, top: `${n.y}%`, transform: `rotate(${n.r}deg)` }}
          >
            <span className="mb-1 block h-1 w-8 rounded bg-danger/50" />
            {n.t}
          </div>
        ))}
        <div className="absolute bottom-0 left-0 font-mono text-[0.65rem] text-bone/35">⏱ tempo médio de resposta: horas</div>
      </div>
    </div>
  );
}

function AfterScene() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,#1c2a20,#0b0f12_70%)] p-5 md:p-8">
      <div className="mb-4 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-signal">
        <span>After AI</span>
        <span>● sistemas sincronizados</span>
      </div>
      <div className="grid h-[85%] grid-cols-2 gap-3 md:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-signal/25 bg-ink/70 p-3 md:col-span-2">
          <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">Assistente de atendimento</p>
          <div className="space-y-2 text-[0.7rem]">
            <p className="ml-auto w-fit rounded-lg bg-bone/10 px-2 py-1 text-bone/80">Vocês entregam no sábado?</p>
            <p className="w-fit rounded-lg bg-signal/15 px-2 py-1 text-bone">Sim! Entregas aos sábados até 14h. Quer agendar? ✓</p>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-ink/70 p-3">
          <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">Automações</p>
          {["Pedidos → sistema", "Lembretes", "Relatório semanal"].map((t) => (
            <p key={t} className="flex items-center gap-1.5 text-[0.65rem] text-bone/75">
              <span className="text-signal">✓</span> {t}
            </p>
          ))}
        </div>
        <div className="col-span-2 rounded-xl border border-line bg-ink/70 p-3 md:col-span-3">
          <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">Painel unificado</p>
          <div className="flex h-[60%] items-end gap-1.5">
            {[30, 42, 38, 55, 60, 58, 72, 70, 80].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-signal/50" style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="mt-2 font-mono text-[0.55rem] text-steel">dados ilustrativos</p>
        </div>
      </div>
    </div>
  );
}

/** BEFORE AI vs AFTER AI — controle deslizante que transforma a interface. */
export default function Transformation() {
  const [v, setV] = useState(50);

  return (
    <section id="transformation" aria-label="Transformação de negócios com IA" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader index="04" kicker="Business Transformation" title="Before AI" accent="vs After AI." description="Arraste o controle e veja a mesma operação antes e depois de processos inteligentes." />

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-line sm:aspect-[16/10]">
            <BeforeScene />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${v}%)` }}>
              <AfterScene />
            </div>
            <div className="pointer-events-none absolute inset-y-0 z-10 w-px bg-signal shadow-[0_0_20px_rgb(117_230_107/0.8)]" style={{ left: `${v}%` }}>
              <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-signal bg-ink font-mono text-xs text-signal">⇆</span>
            </div>
            <label htmlFor="ba-range" className="sr-only">
              Comparar antes e depois da IA
            </label>
            <input
              id="ba-range"
              type="range"
              min={0}
              max={100}
              value={v}
              onChange={(e) => setV(Number(e.target.value))}
              aria-valuetext={v < 50 ? "Mostrando mais o cenário depois da IA" : "Mostrando mais o cenário antes da IA"}
              className="absolute inset-0 z-20 size-full cursor-ew-resize opacity-0"
              data-cursor-label="drag"
            />
          </Reveal>

          <Reveal className="grid content-start gap-6">
            <div className={cn("rounded-2xl border p-5 transition-all duration-500", v > 50 ? "border-danger/40 bg-danger/5" : "border-line opacity-50")}>
              <p className="kicker mb-3">Antes</p>
              <ul className="space-y-2 text-sm text-bone/70">
                {BEFORE.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-danger" aria-hidden>
                      ×
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className={cn("rounded-2xl border p-5 transition-all duration-500", v <= 50 ? "border-signal/40 bg-signal/5" : "border-line opacity-50")}>
              <p className="kicker mb-3 !text-signal">Depois</p>
              <ul className="space-y-2 text-sm text-bone/80">
                {AFTER.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-signal" aria-hidden>
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setV(100)} className="chip hover:text-bone">
                Ver antes
              </button>
              <button type="button" onClick={() => setV(0)} className="chip hover:text-bone">
                Ver depois
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
