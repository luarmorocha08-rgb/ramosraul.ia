"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Concept } from "@/lib/ai/schemas";
import { emit } from "@/lib/events";
import { scrollToSection } from "@/lib/scroll";
import { ErrorNote, Panel, ResultSource, ScanLoader, ToolInput } from "./LabParts";
import { useAiTool } from "./useAiTool";

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
}
const onColor = (hex: string) => (luminance(hex) > 0.4 ? "#0B0F12" : "#FFFFFF");

/** Peça da prévia que "voa" até sua posição quando a montagem começa. */
function Piece({ children, i, assembled, className, style }: { children?: ReactNode; i: number; assembled: boolean; className?: string; style?: CSSProperties }) {
  const seed = (i * 7919) % 100;
  const from = `translate(${(seed % 2 ? 1 : -1) * (40 + seed)}px, ${((seed * 3) % 80) - 40}px) rotate(${(seed % 13) - 6}deg) scale(.9)`;
  return (
    <div
      className={className}
      style={{
        ...style,
        transform: assembled ? "none" : from,
        opacity: assembled ? 1 : 0,
        transition: `transform 0.9s cubic-bezier(.16,1,.3,1) ${i * 0.08}s, opacity 0.5s ${i * 0.08}s`,
      }}
    >
      {children}
    </div>
  );
}

function Preview({ c }: { c: Concept }) {
  const [assembled, setAssembled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAssembled(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const [bg, surface, text, accent, secondary] = c.palette.map((p) => p.hex) as [string, string, string, string, string];
  const font = (name: string) => `"${name}", var(--font-display), sans-serif`;

  return (
    <div className="overflow-hidden rounded-2xl border border-line shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]" aria-label={`Prévia conceitual do site ${c.projectName}`}>
      <div className="flex items-center gap-1.5 border-b border-line bg-ink px-3 py-2">
        <span className="size-2 rounded-full bg-danger/70" />
        <span className="size-2 rounded-full bg-copper/70" />
        <span className="size-2 rounded-full bg-signal/70" />
        <span className="ml-3 truncate rounded-md bg-bone/5 px-3 py-0.5 font-mono text-[0.6rem] text-steel">
          {c.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com
        </span>
      </div>
      <div style={{ background: bg, color: text, fontFamily: font(c.typography.body) }} className="relative p-5 md:p-7">
        <Piece i={0} assembled={assembled} className="flex items-center justify-between">
          <span style={{ fontFamily: font(c.typography.display) }} className="text-sm font-bold tracking-tight">
            {c.projectName}
          </span>
          <span className="hidden gap-4 text-[0.65rem] opacity-70 sm:flex">
            {c.sections.slice(1, 4).map((s) => (
              <span key={s.name}>{s.name}</span>
            ))}
          </span>
        </Piece>
        <div className="mt-8 grid items-center gap-6 md:grid-cols-[1.3fr_1fr]">
          <div>
            <Piece i={1} assembled={assembled}>
              <p style={{ fontFamily: font(c.typography.display) }} className="text-2xl font-bold leading-[1.05] tracking-tight md:text-3xl">
                {c.hero.headline}
              </p>
            </Piece>
            <Piece i={2} assembled={assembled}>
              <p className="mt-3 text-xs leading-relaxed opacity-75">{c.hero.subheadline}</p>
            </Piece>
            <Piece i={3} assembled={assembled} className="mt-5 flex gap-2">
              <span style={{ background: accent, color: onColor(accent) }} className="rounded-full px-4 py-2 text-[0.7rem] font-semibold">
                {c.hero.cta}
              </span>
              <span style={{ borderColor: secondary, color: text }} className="rounded-full border px-4 py-2 text-[0.7rem]">
                Saiba mais
              </span>
            </Piece>
          </div>
          <Piece i={4} assembled={assembled} className="relative aspect-[4/3] overflow-hidden rounded-xl" style={{ background: surface }}>
            <div className="absolute -right-6 -top-6 size-28 rounded-full opacity-80 blur-xl" style={{ background: accent }} />
            <div className="absolute bottom-3 left-3 size-14 rounded-full opacity-60 blur-lg" style={{ background: secondary }} />
            <div className="absolute inset-x-3 bottom-3 h-1.5 rounded-full opacity-30" style={{ background: text }} />
          </Piece>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {c.features.slice(0, 3).map((f, i) => (
            <Piece key={f} i={5 + i} assembled={assembled} className="rounded-lg p-3 text-[0.62rem] leading-snug" style={{ background: surface }}>
              <span className="mb-2 block h-1 w-6 rounded-full" style={{ background: i === 1 ? secondary : accent }} />
              {f}
            </Piece>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ConceptGenerator() {
  const [input, setInput] = useState("");
  const { run, result, error, loading } = useAiTool<Concept>("/api/ai/concept");
  const c = result?.data;

  const build = () => {
    emit("contact:prefill", {
      projectType: "Website / Landing page",
      description: `Gostei do conceito "${c?.projectName}" gerado no AI Lab e quero desenvolver o site.\n\nPedido original: ${input.trim()}`,
    });
    scrollToSection("contact");
  };

  return (
    <div className="space-y-8">
      <ToolInput
        id="concept-input"
        label="Que site você imagina?"
        value={input}
        onChange={setInput}
        onSubmit={() => run(input)}
        loading={loading}
        placeholder="Ex.: Quero um site para uma cafeteria moderna."
        submitLabel="Gerar conceito"
        examples={["Quero um site para uma cafeteria moderna.", "Loja online de moda minimalista.", "Site para consultoria de tecnologia."]}
      />
      {loading && <ScanLoader steps={["Lendo o briefing…", "Definindo direção visual…", "Compondo paleta…", "Organizando seções…"]} />}
      {error && !loading && <ErrorNote message={error} />}

      {c && result && !loading && (
        <div className="space-y-6" style={{ animation: "msg-in .6s var(--ease-expo)" }}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="kicker mb-2">Proposta conceitual · nome provisório</p>
              <p className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{c.projectName}</p>
              <p className="mt-1 text-bone/60">{c.tagline}</p>
            </div>
            <ResultSource mode={result.mode} notice={result.notice} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
            <Preview key={c.projectName + c.palette.map((p) => p.hex).join("")} c={c} />
            <div className="space-y-3">
              <Panel>
                <p className="kicker mb-3">Direção visual</p>
                <p className="text-sm leading-relaxed text-bone/75">{c.visualDirection}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.mood.map((m) => (
                    <span key={m} className="chip">
                      {m}
                    </span>
                  ))}
                </div>
              </Panel>
              <Panel>
                <p className="kicker mb-3">Paleta</p>
                <ul className="grid grid-cols-5 gap-2">
                  {c.palette.map((p) => (
                    <li key={p.hex + p.name} className="text-center">
                      <span className="block aspect-square rounded-lg border border-line" style={{ background: p.hex }} />
                      <span className="mt-1.5 block truncate text-[0.62rem] text-bone/70">{p.name}</span>
                      <span className="block font-mono text-[0.55rem] text-steel">{p.hex.toUpperCase()}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel>
                <p className="kicker mb-3">Tipografia</p>
                <p className="text-sm text-bone/75">
                  Títulos: <strong className="text-bone">{c.typography.display}</strong> · Textos: <strong className="text-bone">{c.typography.body}</strong>
                </p>
              </Panel>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Panel>
              <p className="kicker mb-4">Estrutura sugerida</p>
              <ol className="space-y-2">
                {c.sections.map((s, i) => (
                  <li key={s.name} className="flex gap-3 text-sm">
                    <span className="font-mono text-xs text-signal">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <strong className="font-medium">{s.name}</strong> <span className="text-bone/55">— {s.purpose}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Panel>
            <Panel>
              <p className="kicker mb-4">Funcionalidades</p>
              <ul className="space-y-2 text-sm text-bone/75">
                {c.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-signal" aria-hidden>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-steel">Prévia conceitual simplificada — não é um site pronto para produção.</p>
            </Panel>
          </div>

          <button type="button" onClick={build} className="btn-primary">
            Desenvolver meu projeto →
          </button>
        </div>
      )}
    </div>
  );
}
