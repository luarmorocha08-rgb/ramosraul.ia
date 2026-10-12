"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildPaletteCommands, type PaletteCommand } from "@/lib/commands";
import { emit, on } from "@/lib/events";
import { getLenis } from "@/lib/scroll";
import { cn } from "@/lib/utils";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Central de navegação inteligente (Ctrl/⌘ + K). */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const commands = useMemo(() => buildPaletteCommands(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    const off = on("palette:open", () => setOpen(true));
    return () => {
      window.removeEventListener("keydown", onKey);
      off();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    getLenis()?.stop();
    requestAnimationFrame(() => input.current?.focus());
    return () => {
      getLenis()?.start();
      setQuery("");
      setIndex(0);
      lastFocus.current?.focus?.();
    };
  }, [open]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const list: PaletteCommand[] = q
      ? commands.filter((c) => normalize(`${c.label} ${c.keywords} ${c.group}`).includes(q))
      : commands;
    if (q.length > 2) {
      list.push({
        id: "ask",
        label: `Perguntar à IA: “${query.trim()}”`,
        group: "AI Lab",
        keywords: "",
        run: () => emit("chat:open", { message: query.trim() }),
      });
    }
    return list;
  }, [commands, query]);

  const run = (c: PaletteCommand | undefined) => {
    if (!c) return;
    setOpen(false);
    setTimeout(c.run, 60);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[index]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[14vh]" role="presentation">
      <button type="button" aria-label="Fechar central de comandos" className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Central de comandos"
        className="glass-strong relative w-full max-w-xl overflow-hidden rounded-2xl"
        style={{ animation: "palette-in .4s var(--ease-expo)" }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <span className="font-mono text-signal" aria-hidden>
            ›
          </span>
          <input
            ref={input}
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Para onde vamos? Digite um comando ou pergunta…"
            className="h-14 flex-1 bg-transparent text-bone placeholder:text-steel focus:outline-none"
            role="combobox"
            aria-label="Buscar comando ou perguntar à IA"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
            aria-autocomplete="list"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.65rem] text-steel">ESC</kbd>
        </div>
        <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent>
          {results.length === 0 && <li className="px-4 py-6 text-center text-sm text-steel">Nenhum comando encontrado.</li>}
          {results.map((c, i) => {
            const header = c.group !== results[i - 1]?.group;
            return (
              <li key={c.id} role="presentation">
                {header && <div className="px-3 pb-1 pt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-steel">{c.group}</div>}
                <div
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={i === index}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => run(c)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors",
                    i === index ? "bg-signal/10 text-bone" : "text-bone/70",
                  )}
                >
                  <span>{c.label}</span>
                  {c.hint ? <span className="font-mono text-[0.62rem] text-copper">{c.hint}</span> : i === index && <span className="font-mono text-xs text-signal">↵</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-4 border-t border-line px-5 py-2.5 font-mono text-[0.62rem] text-steel">
          <span>↑↓ navegar</span>
          <span>↵ executar</span>
          <span className="ml-auto">RAUL.OS</span>
        </div>
      </div>
    </div>
  );
}
