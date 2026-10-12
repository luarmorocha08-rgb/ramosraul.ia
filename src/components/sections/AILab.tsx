"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { on, type LabTab } from "@/lib/events";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import AiStatusBadge from "@/components/ui/AiStatusBadge";
import Reveal from "@/components/ui/Reveal";
import ChatPanel from "@/components/lab/ChatPanel";

// ferramentas carregadas sob demanda (code splitting)
const BusinessAnalyzer = dynamic(() => import("@/components/lab/BusinessAnalyzer"));
const ConceptGenerator = dynamic(() => import("@/components/lab/ConceptGenerator"));
const AutomationSimulator = dynamic(() => import("@/components/lab/AutomationSimulator"));
const PromptLab = dynamic(() => import("@/components/lab/PromptLab"));

const TABS: Array<{ id: LabTab; index: string; title: string; description: string }> = [
  { id: "chat", index: "01", title: "AI Chat Assistant", description: "Converse com um assistente especializado nos serviços do Raul." },
  { id: "analyzer", index: "02", title: "AI Business Analyzer", description: "Descreva seu negócio e receba oportunidades de IA e automação." },
  { id: "concept", index: "03", title: "Website Concept Generator", description: "Transforme uma ideia em proposta visual de site." },
  { id: "automation", index: "04", title: "Automation Simulator", description: "Veja um fluxo de automação acontecendo, etapa por etapa." },
  { id: "prompt", index: "05", title: "Prompt Engineering Lab", description: "Compare um prompt simples com um prompt estruturado." },
];

/** AI PLAYGROUND — laboratório interativo. */
export default function AILab() {
  const [tab, setTab] = useState<LabTab>("chat");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => on("lab:tab", ({ tab: t }) => setTab(t)), []);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = TABS[(i + dir + TABS.length) % TABS.length]!;
    setTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <section id="lab" aria-label="AI Lab — laboratório interativo" className="relative py-28 md:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgb(117_230_107/0.08),transparent)]" aria-hidden />
      <div className="container-x relative">
        <SectionHeader
          index="02"
          kicker="AI Playground"
          title="Don't just watch AI."
          accent="Experience it."
          description="Um laboratório com ferramentas reais. Experimente agora algumas das soluções que posso desenvolver para o seu negócio."
        >
          <Reveal className="mt-6">
            <AiStatusBadge />
          </Reveal>
        </SectionHeader>

        <Reveal className="glass-strong relative overflow-hidden rounded-[1.75rem]">
          {/* cantos técnicos */}
          <span className="pointer-events-none absolute left-3 top-3 size-4 border-l border-t border-signal/50" aria-hidden />
          <span className="pointer-events-none absolute right-3 top-3 size-4 border-r border-t border-signal/50" aria-hidden />
          <span className="pointer-events-none absolute bottom-3 left-3 size-4 border-b border-l border-signal/50" aria-hidden />
          <span className="pointer-events-none absolute bottom-3 right-3 size-4 border-b border-r border-signal/50" aria-hidden />

          <div className="grid lg:grid-cols-[300px_1fr]">
            <div
              role="tablist"
              aria-label="Experiências de IA"
              aria-orientation="vertical"
              className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line p-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:p-4"
            >
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[t.id] = el;
                  }}
                  id={`lab-tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  aria-controls={`lab-panel-${t.id}`}
                  tabIndex={tab === t.id ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "group relative shrink-0 rounded-xl px-4 py-3 text-left transition-all duration-300 lg:w-full",
                    tab === t.id ? "bg-signal/10" : "hover:bg-bone/[0.03]",
                  )}
                >
                  <span className={cn("absolute inset-y-3 left-0 w-0.5 rounded-full transition-all", tab === t.id ? "bg-signal" : "bg-transparent")} aria-hidden />
                  <span className="flex items-baseline gap-3">
                    <span className={cn("font-mono text-[0.62rem]", tab === t.id ? "text-signal" : "text-steel")}>{t.index}</span>
                    <span className={cn("whitespace-nowrap font-display text-sm font-medium", tab === t.id ? "text-bone" : "text-bone/60")}>{t.title}</span>
                  </span>
                  <span className="mt-1 hidden pl-7 text-xs leading-snug text-bone/45 lg:block">{t.description}</span>
                </button>
              ))}
            </div>

            <div
              id={`lab-panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`lab-tab-${tab}`}
              tabIndex={0}
              key={tab}
              className="min-h-[560px] p-5 md:p-8"
              style={{ animation: "msg-in .5s var(--ease-expo)" }}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="font-mono text-xs text-signal">EXP.{active.index}</span>
                <h3 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{active.title}</h3>
              </div>
              {tab === "chat" && (
                <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-line bg-ink/40">
                  <ChatPanel />
                </div>
              )}
              {tab === "analyzer" && <BusinessAnalyzer />}
              {tab === "concept" && <ConceptGenerator />}
              {tab === "automation" && <AutomationSimulator />}
              {tab === "prompt" && <PromptLab />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
