"use client";

import { useState } from "react";
import type { Analysis } from "@/lib/ai/schemas";
import { emit } from "@/lib/events";
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { ErrorNote, Panel, ResultSource, ScanLoader, ToolInput } from "./LabParts";
import { useAiTool } from "./useAiTool";

const CATEGORY: Record<Analysis["opportunities"][number]["category"], { label: string; icon: string }> = {
  automation: { label: "Automação", icon: "⟳" },
  website: { label: "Website", icon: "◫" },
  agent: { label: "Agente IA", icon: "◉" },
  support: { label: "Atendimento", icon: "◌" },
  digital: { label: "Digitalização", icon: "◇" },
};

const LEVEL = { alto: 3, médio: 2, baixo: 1, alta: 3, média: 2, baixa: 1 } as const;

function Meter({ label, level }: { label: string; level: keyof typeof LEVEL }) {
  const n = LEVEL[level];
  return (
    <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">
      {label}
      <span className="flex gap-0.5" aria-label={`${label}: ${level}`}>
        {[1, 2, 3].map((k) => (
          <span key={k} className={cn("h-2 w-3 rounded-[2px]", k <= n ? "bg-signal" : "bg-bone/10")} />
        ))}
      </span>
    </span>
  );
}

export default function BusinessAnalyzer() {
  const [input, setInput] = useState("");
  const { run, result, error, loading } = useAiTool<Analysis>("/api/ai/analyze");
  const a = result?.data;

  const implement = () => {
    emit("contact:prefill", {
      projectType: "Automação de processos",
      description: `Quero implementar as soluções sugeridas pelo AI Business Analyzer.\n\nMeu negócio: ${input.trim()}${a ? `\n\nOportunidades que me interessaram:\n${a.opportunities.map((o) => `- ${o.title}`).join("\n")}` : ""}`,
    });
    scrollToSection("contact");
  };

  return (
    <div className="space-y-8">
      <ToolInput
        id="analyzer-input"
        label="Descreva seu negócio e o que você quer melhorar"
        value={input}
        onChange={setInput}
        onSubmit={() => run(input)}
        loading={loading}
        placeholder="Ex.: Tenho uma loja de roupas e quero vender mais."
        submitLabel="Analisar negócio"
        examples={["Tenho uma loja de roupas e quero vender mais.", "Clínica odontológica com muitas faltas nas consultas.", "Cafeteria que quer receber pedidos online."]}
      />

      {loading && <ScanLoader steps={["Identificando segmento…", "Mapeando processos…", "Buscando oportunidades de IA…", "Montando diagnóstico…"]} />}
      {error && !loading && <ErrorNote message={error} />}

      {a && result && !loading && (
        <div className="space-y-6" style={{ animation: "msg-in .6s var(--ease-expo)" }}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="kicker mb-2">Diagnóstico · {a.segment}</p>
              <p className="max-w-2xl font-display text-xl leading-snug md:text-2xl">{a.summary}</p>
            </div>
            <ResultSource mode={result.mode} notice={result.notice} />
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {a.opportunities.map((o, i) => (
              <li
                key={o.title}
                className="edge-glow group rounded-2xl border border-line bg-ink/50 p-5 transition-colors hover:bg-night/40"
                style={{ animation: `msg-in .6s ${i * 0.07}s var(--ease-expo) both` }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-signal">
                    <span className="grid size-7 place-items-center rounded-lg bg-signal/10 text-sm" aria-hidden>
                      {CATEGORY[o.category].icon}
                    </span>
                    {CATEGORY[o.category].label}
                  </span>
                  <span className="font-mono text-[0.6rem] text-steel">0{i + 1}</span>
                </div>
                <h4 className="font-display text-lg font-medium leading-tight">{o.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-bone/60">{o.description}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Meter label="Impacto" level={o.impact} />
                  <Meter label="Complexidade" level={o.complexity} />
                </div>
              </li>
            ))}
          </ul>

          {/* Diagrama do fluxo sugerido */}
          <Panel>
            <p className="kicker mb-5">Fluxo de atendimento automatizado sugerido</p>
            <ol className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-0">
              {a.flow.map((step, i) => (
                <li key={i} className="relative flex flex-1 items-center md:flex-col md:items-stretch">
                  <div
                    className="relative z-10 flex-1 rounded-xl border border-signal/25 bg-signal/[0.06] p-3 text-sm md:mx-2"
                    style={{ animation: `msg-in .5s ${0.3 + i * 0.15}s var(--ease-expo) both` }}
                  >
                    <span className="mb-1 block font-mono text-[0.6rem] text-signal">STEP {i + 1}</span>
                    {step}
                  </div>
                  {i < a.flow.length - 1 && (
                    <svg className="absolute -bottom-3 left-6 h-3 w-px md:bottom-auto md:left-auto md:right-[-0.5rem] md:top-1/2 md:h-px md:w-4" aria-hidden>
                      <line x1="0" y1="0" x2="100%" y2="100%" stroke="#75E66B" strokeDasharray="3 3" className="animate-dash" />
                    </svg>
                  )}
                </li>
              ))}
            </ol>
          </Panel>

          <div className="grid gap-3 md:grid-cols-2">
            <Panel>
              <p className="kicker mb-4">Agentes inteligentes</p>
              <ul className="space-y-3">
                {a.agents.map((ag) => (
                  <li key={ag.name} className="flex gap-3">
                    <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-copper/50 text-[0.6rem] text-copper" aria-hidden>
                      AI
                    </span>
                    <span>
                      <span className="block font-medium">{ag.name}</span>
                      <span className="text-sm text-bone/60">{ag.role}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel>
              <p className="kicker mb-4">Funcionalidades para o site</p>
              <ul className="flex flex-wrap gap-2">
                {a.websiteFeatures.map((f) => (
                  <li key={f} className="chip">
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-bone/60">
                <span className="text-signal">Próximo passo:</span> {a.nextStep}
              </p>
            </Panel>
          </div>

          <button type="button" onClick={implement} className="btn-primary">
            Quero implementar essa solução →
          </button>
        </div>
      )}
    </div>
  );
}
