"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Campo de entrada das ferramentas, com exemplos clicáveis. */
export function ToolInput({
  id,
  label,
  value,
  onChange,
  onSubmit,
  placeholder,
  examples,
  submitLabel,
  loading,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  examples: string[];
  submitLabel: string;
  loading: boolean;
}) {
  const tooShort = value.trim().length < 8;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!tooShort && !loading) onSubmit();
      }}
      className="space-y-3"
    >
      <label htmlFor={id} className="kicker block">
        {label}
      </label>
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !tooShort && !loading) onSubmit();
          }}
          placeholder={placeholder}
          maxLength={1200}
          rows={3}
          className="field min-h-28 resize-y pr-4 text-[0.95rem] leading-relaxed"
        />
        <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-[0.6rem] text-steel">{value.length}/1200</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel">Exemplos:</span>
        {examples.map((ex) => (
          <button key={ex} type="button" onClick={() => onChange(ex)} className="chip transition-colors hover:border-signal/60 hover:text-bone">
            {ex}
          </button>
        ))}
      </div>
      <button type="submit" disabled={tooShort || loading} className="btn-primary disabled:opacity-40">
        {loading ? "Processando…" : submitLabel}
        {!loading && <span aria-hidden>→</span>}
      </button>
    </form>
  );
}

/** Estado de carregamento criativo — etapas cíclicas enquanto a requisição real acontece. */
export function ScanLoader({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % steps.length), 1100);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div role="status" className="relative overflow-hidden rounded-2xl border border-line bg-ink/60 p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-signal/10 to-transparent animate-scan" aria-hidden />
      <div className="grid grid-cols-6 gap-2 opacity-60" aria-hidden>
        {Array.from({ length: 18 }).map((_, k) => (
          <div key={k} className="h-8 rounded-md bg-bone/[0.04]" style={{ animation: `pulse-dot 1.6s ${k * 0.07}s ease-in-out infinite` }} />
        ))}
      </div>
      <p className="mt-6 font-mono text-xs text-signal">
        {steps[i]}
        <span className="ml-1 animate-blink">▌</span>
      </p>
    </div>
  );
}

/** Selo de origem do resultado: IA real ou demonstração por regras. */
export function ResultSource({ mode, notice }: { mode: "live" | "demo"; notice?: string }) {
  return mode === "live" ? (
    <span className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-signal">
      <span className="size-1.5 rounded-full bg-signal" aria-hidden /> Gerado por IA · revise antes de usar
    </span>
  ) : (
    <span className="demo-badge" title={notice}>
      Demonstração · gerado por regras, não por IA
    </span>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-bone/80">
      {message}
    </p>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-line bg-ink/50 p-5", className)}>{children}</div>;
}
