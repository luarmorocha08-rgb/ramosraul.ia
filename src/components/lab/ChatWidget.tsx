"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/events";
import { cn } from "@/lib/utils";
import AiStatusBadge from "@/components/ui/AiStatusBadge";
import ChatPanel from "./ChatPanel";
import { sendChat } from "./chatStore";

/** Janela flutuante do assistente de IA, disponível em todo o site. */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const off = on("chat:open", (detail) => {
      setOpen(true);
      if (detail?.message) void sendChat(detail.message);
    });
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      off();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcher.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div
        role="dialog"
        aria-label="Assistente de IA"
        aria-modal="false"
        inert={!open}
        className={cn(
          "glass-strong fixed bottom-24 right-4 z-[70] flex h-[min(620px,calc(100dvh-8rem))] w-[min(400px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl transition-all duration-500 ease-[var(--ease-expo)] md:right-6",
          open ? "scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="relative grid size-9 place-items-center rounded-full bg-signal/10">
              <span className="absolute inset-0 rounded-full border border-signal/40 animate-pulse-dot" />
              <span className="size-2 rounded-full bg-signal" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold">Assistente RAUL.AI</p>
              <AiStatusBadge className="!border-0 !bg-transparent !p-0 !text-[0.58rem]" />
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full border border-line text-bone/60 hover:text-bone" aria-label="Fechar assistente">
            ✕
          </button>
        </div>
        {open && <ChatPanel compact autoFocus />}
      </div>

      <button
        ref={launcher}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Fechar assistente de IA" : "Abrir assistente de IA"}
        data-cursor-label="AI chat"
        className={cn(
          "group fixed bottom-5 right-4 z-[70] flex h-14 items-center gap-3 rounded-full border border-signal/40 bg-ink/80 pl-2 pr-5 backdrop-blur-xl transition-all duration-500 ease-[var(--ease-expo)] hover:border-signal md:right-6",
          visible || open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-20 opacity-0",
        )}
      >
        <span className="relative grid size-10 place-items-center rounded-full bg-signal text-ink shadow-[0_0_30px_rgb(117_230_107/0.5)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </span>
        <span className="font-display text-sm font-medium">{open ? "Fechar" : "Fale com a IA"}</span>
      </button>
    </>
  );
}
