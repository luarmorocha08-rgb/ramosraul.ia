"use client";

import { useSyncExternalStore } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** resposta pré-definida do modo demonstração (não gerada por IA) */
  demo?: boolean;
  error?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  pending: boolean;
  streaming: boolean;
}

const STORAGE_KEY = "rr:chat";
const ERROR_MARKER = "\u0000ERR:";

const EMPTY: ChatState = { messages: [], pending: false, streaming: false };
let state: ChatState = { messages: [], pending: false, streaming: false };
let hydrated = false;
const listeners = new Set<() => void>();
let controller: AbortController | null = null;

function emitChange() {
  listeners.forEach((l) => l());
}

function set(partial: Partial<ChatState>) {
  state = { ...state, ...partial };
  emitChange();
  if (!state.pending) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages.slice(-30)));
    } catch {}
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) state = { ...state, messages: JSON.parse(saved) as ChatMessage[] };
  } catch {}
}

function updateLast(patch: Partial<ChatMessage>) {
  const messages = state.messages.slice();
  const last = messages[messages.length - 1];
  if (!last) return;
  messages[messages.length - 1] = { ...last, ...patch };
  set({ messages });
}

const uid = () => Math.random().toString(36).slice(2, 10);

export async function sendChat(text: string) {
  const content = text.trim().slice(0, 2000);
  if (!content || state.pending) return;
  const history = [...state.messages.filter((m) => !m.error), { id: uid(), role: "user" as const, content }];
  set({ messages: [...state.messages, history[history.length - 1]!], pending: true });

  controller = new AbortController();
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-16).map(({ role, content }) => ({ role, content })) }),
      signal: controller.signal,
    });

    const type = res.headers.get("content-type") ?? "";
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Não foi possível responder agora.");
    }

    if (type.includes("application/json")) {
      const data = (await res.json()) as { mode: "demo"; reply: string };
      set({ messages: [...state.messages, { id: uid(), role: "assistant", content: data.reply, demo: true }], pending: false });
      return;
    }

    // streaming de texto
    set({ messages: [...state.messages, { id: uid(), role: "assistant", content: "" }], streaming: true });
    const reader = res.body?.getReader();
    if (!reader) throw new Error("Resposta vazia.");
    const decoder = new TextDecoder();
    let acc = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      const errAt = acc.indexOf(ERROR_MARKER);
      if (errAt >= 0) {
        const partial = acc.slice(0, errAt).trim();
        const msg = acc.slice(errAt + ERROR_MARKER.length);
        updateLast({ content: partial ? `${partial}\n\n— ${msg}` : msg, error: !partial });
        set({ pending: false, streaming: false });
        return;
      }
      updateLast({ content: acc });
    }
    if (!acc.trim()) updateLast({ content: "Não recebi uma resposta. Tente novamente.", error: true });
    set({ pending: false, streaming: false });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      set({ pending: false, streaming: false });
      return;
    }
    set({
      messages: [...state.messages, { id: uid(), role: "assistant", content: (err as Error).message || "Erro inesperado.", error: true }],
      pending: false,
      streaming: false,
    });
  } finally {
    controller = null;
  }
}

export function stopChat() {
  controller?.abort();
}

export function clearChat() {
  stopChat();
  set({ messages: [], pending: false, streaming: false });
}

export function useChat() {
  return useSyncExternalStore(
    (l) => {
      hydrate();
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      hydrate();
      return state;
    },
    () => EMPTY,
  );
}
