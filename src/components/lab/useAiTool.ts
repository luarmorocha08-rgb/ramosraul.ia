"use client";

import { useCallback, useRef, useState } from "react";
import type { AiResult } from "@/lib/ai/schemas";

/** Estado e chamada de uma ferramenta de IA com saída estruturada. */
export function useAiTool<T>(endpoint: string) {
  const [result, setResult] = useState<AiResult<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  const run = useCallback(
    async (input: string) => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
          signal: c.signal,
        });
        const data = (await res.json().catch(() => ({}))) as AiResult<T> & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Não foi possível concluir. Tente novamente.");
        setResult(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      } finally {
        if (ctrl.current === c) setLoading(false);
      }
    },
    [endpoint],
  );

  const reset = useCallback(() => {
    ctrl.current?.abort();
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { run, reset, result, error, loading };
}
