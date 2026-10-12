"use client";

import { useEffect, useState } from "react";

export type AiStatus = "checking" | "live" | "demo" | "offline";

let cached: Promise<AiStatus> | null = null;

function fetchStatus(): Promise<AiStatus> {
  cached ??= fetch("/api/ai/status", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d: { mode: "live" | "demo" }) => d.mode)
    .catch(() => {
      cached = null;
      return "offline" as const;
    });
  return cached;
}

/** Estado da integração de IA: conectada, em demonstração ou indisponível. */
export function useAiStatus() {
  const [status, setStatus] = useState<AiStatus>("checking");
  useEffect(() => {
    let alive = true;
    fetchStatus().then((s) => alive && setStatus(s));
    return () => {
      alive = false;
    };
  }, []);
  return status;
}

export const aiStatusLabel: Record<AiStatus, string> = {
  checking: "Verificando IA…",
  live: "IA conectada",
  demo: "Modo demonstração",
  offline: "IA indisponível",
};
