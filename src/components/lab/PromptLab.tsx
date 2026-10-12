"use client";

import { useState } from "react";
import type { PromptLab as PromptLabResult } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";
import { ErrorNote, ResultSource, ScanLoader, ToolInput } from "./LabParts";
import { useAiTool } from "./useAiTool";

const KIND_COLOR: Record<PromptLabResult["improvements"][number]["kind"], string> = {
  role: "#75E66B",
  context: "#C18B65",
  task: "#F1EEE8",
  constraints: "#E2B48F",
  format: "#9FD8A0",
  examples: "#B7F0B0",
  quality: "#69716C",
};

/** Realça cabeçalhos de seção (# Papel, # Contexto…) no prompt aprimorado. */
function EngineeredText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) =>
        /^#{1,3}\s/.test(line) ? (
          <span key={i} className="mt-3 block font-semibold text-signal first:mt-0">
            {line}
          </span>
        ) : (
          <span key={i} className="block min-h-[1em]">
            {line}
          </span>
        ),
      )}
    </>
  );
}

export default function PromptLab() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [copied, setCopied] = useState(false);
  const { run, result, error, loading } = useAiTool<PromptLabResult>("/api/ai/prompt");

  const go = () => {
    setSubmitted(input.trim());
    void run(input);
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.data.engineeredPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="space-y-8">
      <ToolInput
        id="prompt-input"
        label="Escreva um pedido como faria para uma IA"
        value={input}
        onChange={setInput}
        onSubmit={go}
        loading={loading}
        placeholder="Ex.: escreva um post sobre meu restaurante"
        submitLabel="Aprimorar prompt"
        examples={["escreva um post sobre meu restaurante", "resuma esse contrato", "crie um plano de estudos de inglês"]}
      />
      {loading && <ScanLoader steps={["Analisando intenção…", "Definindo papel e contexto…", "Estruturando restrições…", "Formatando saída…"]} />}
      {error && !loading && <ErrorNote message={error} />}

      {result && !loading && (
        <div className="space-y-6" style={{ animation: "msg-in .6s var(--ease-expo)" }}>
          <div className="flex justify-end">
            <ResultSource mode={result.mode} notice={result.notice} />
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl border border-line bg-ink/50 p-5">
              <p className="kicker mb-4 flex items-center justify-between">
                Basic Prompt <span className="font-mono text-[0.6rem] text-steel">{submitted.split(/\s+/).length} palavras</span>
              </p>
              <p className="font-mono text-sm leading-relaxed text-bone/60">{submitted}</p>
              <ul className="mt-6 space-y-2 text-xs text-steel">
                <li>× sem papel definido</li>
                <li>× sem contexto ou público</li>
                <li>× sem formato de saída</li>
              </ul>
            </div>
            <div className="relative rounded-2xl border border-signal/30 bg-signal/[0.03] p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="kicker !text-signal">Engineered Prompt</p>
                <button type="button" onClick={copy} className="rounded-full border border-line px-3 py-1 font-mono text-[0.62rem] text-bone/70 hover:border-signal hover:text-bone">
                  {copied ? "copiado ✓" : "copiar"}
                </button>
              </div>
              <pre data-lenis-prevent className="max-h-[420px] overflow-auto whitespace-pre-wrap font-mono text-[0.8rem] leading-relaxed text-bone/85">
                <EngineeredText text={result.data.engineeredPrompt} />
              </pre>
            </div>
          </div>

          <div>
            <p className="kicker mb-4">O que mudou</p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.improvements.map((imp, i) => (
                <li
                  key={imp.label + i}
                  className={cn("rounded-2xl border border-line bg-ink/50 p-4")}
                  style={{ animation: `msg-in .5s ${i * 0.08}s var(--ease-expo) both`, borderLeftColor: KIND_COLOR[imp.kind], borderLeftWidth: 2 }}
                >
                  <p className="font-medium">{imp.label}</p>
                  <p className="mt-1 text-sm text-bone/60">{imp.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
