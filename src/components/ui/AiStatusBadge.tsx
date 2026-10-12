"use client";

import { aiStatusLabel, useAiStatus } from "@/hooks/useAiStatus";
import { cn } from "@/lib/utils";

const tone = {
  checking: "bg-steel",
  live: "bg-signal shadow-[0_0_12px_rgb(117_230_107/0.9)]",
  demo: "bg-copper shadow-[0_0_12px_rgb(193_139_101/0.8)]",
  offline: "bg-danger",
} as const;

/** Indicador visual do estado da IA (conectada / demonstração / indisponível). */
export default function AiStatusBadge({ className, compact = false }: { className?: string; compact?: boolean }) {
  const status = useAiStatus();
  const help =
    status === "demo"
      ? "A API de IA não está configurada. As ferramentas funcionam com respostas por regras, sinalizadas como demonstração."
      : status === "live"
        ? "As ferramentas do AI Lab estão conectadas a um modelo de IA real."
        : status === "offline"
          ? "Não foi possível verificar o serviço de IA."
          : "Verificando conexão com a IA.";
  return (
    <span
      role="status"
      title={help}
      className={cn("inline-flex items-center gap-2 rounded-full border border-line bg-ink/60 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-bone/75", className)}
    >
      <span className={cn("size-1.5 rounded-full animate-pulse-dot", tone[status])} aria-hidden />
      {compact ? (status === "live" ? "AI · online" : status === "demo" ? "AI · demo" : status === "offline" ? "AI · off" : "AI · …") : aiStatusLabel[status]}
      <span className="sr-only">. {help}</span>
    </span>
  );
}
