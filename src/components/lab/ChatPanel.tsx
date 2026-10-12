"use client";

import { useEffect, useRef, useState } from "react";
import { useAiStatus } from "@/hooks/useAiStatus";
import { cn } from "@/lib/utils";
import { clearChat, sendChat, stopChat, useChat } from "./chatStore";
import RichText from "./RichText";

const SUGGESTIONS = [
  "O que você desenvolve?",
  "Como a IA pode ajudar minha loja?",
  "Quanto tempo leva um site premium?",
  "Que automações posso ter no WhatsApp?",
];

/** Interface do assistente de IA — usada no AI Lab e na janela flutuante. */
export default function ChatPanel({ compact = false, autoFocus = false }: { compact?: boolean; autoFocus?: boolean }) {
  const { messages, pending, streaming } = useChat();
  const status = useAiStatus();
  const [text, setText] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  const submit = (value = text) => {
    if (!value.trim() || pending) return;
    setText("");
    void sendChat(value);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {status === "demo" && (
        <div className="mx-4 mt-4 rounded-xl border border-dashed border-copper/50 bg-copper/5 px-3 py-2 text-xs leading-relaxed text-copper">
          <strong className="font-semibold">Modo demonstração:</strong> a IA não está conectada. As respostas abaixo são pré-definidas, não geradas por um modelo.
        </div>
      )}

      <div
        ref={list}
        data-lenis-prevent
        className={cn("flex-1 space-y-4 overflow-y-auto px-4 py-5", compact ? "min-h-[240px]" : "min-h-[320px]")}
        aria-live="polite"
        aria-busy={pending}
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-start justify-end gap-4">
            <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-line bg-bone/[0.03] px-4 py-3 text-sm leading-relaxed text-bone/80">
              Olá! Sou o assistente do Raul. Posso explicar o que ele desenvolve, sugerir soluções para o seu negócio e ajudar você a pedir um orçamento.
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => submit(s)} className="chip transition-colors hover:border-signal/60 hover:text-bone">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")} style={{ animation: "msg-in .45s var(--ease-expo)" }}>
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "rounded-br-md bg-signal text-ink"
                  : m.error
                    ? "rounded-bl-md border border-danger/40 bg-danger/5 text-bone/80"
                    : "rounded-bl-md border border-line bg-bone/[0.03] text-bone/85",
              )}
            >
              {m.role === "assistant" ? <RichText text={m.content || " "} /> : m.content}
              {m.role === "assistant" && streaming && i === messages.length - 1 && <span className="ml-0.5 inline-block animate-blink text-signal">▌</span>}
              {m.demo && <span className="demo-badge mt-2 !text-[0.55rem]">resposta pré-definida · não gerada por IA</span>}
            </div>
          </div>
        ))}

        {pending && !streaming && (
          <div className="flex items-center gap-1.5 px-1" aria-label="Assistente digitando">
            {[0, 1, 2].map((d) => (
              <span key={d} className="size-1.5 rounded-full bg-signal animate-pulse-dot" style={{ animationDelay: `${d * 0.18}s` }} />
            ))}
          </div>
        )}
      </div>

      <form
        className="border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-ink/70 p-2 transition-colors focus-within:border-signal/60">
          <label htmlFor={compact ? "chat-input-float" : "chat-input"} className="sr-only">
            Mensagem para o assistente
          </label>
          <textarea
            id={compact ? "chat-input-float" : "chat-input"}
            ref={input}
            rows={1}
            value={text}
            maxLength={2000}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Pergunte sobre projetos, IA, automações…"
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-bone placeholder:text-steel focus:outline-none"
          />
          {pending ? (
            <button type="button" onClick={stopChat} className="grid size-10 place-items-center rounded-xl border border-line text-bone/70 hover:text-bone" aria-label="Parar resposta">
              <span className="size-3 rounded-sm bg-current" />
            </button>
          ) : (
            <button type="submit" disabled={!text.trim()} className="grid size-10 place-items-center rounded-xl bg-signal text-ink transition-opacity disabled:opacity-30" aria-label="Enviar mensagem">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between px-1 font-mono text-[0.6rem] text-steel">
          <span>Enter envia · Shift+Enter quebra linha</span>
          {messages.length > 0 && (
            <button type="button" onClick={clearChat} className="hover:text-bone">
              limpar conversa
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
