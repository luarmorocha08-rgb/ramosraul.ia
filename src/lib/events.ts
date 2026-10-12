"use client";

/**
 * Barramento de eventos tipado para ações entre componentes
 * (terminal, command palette, CTAs, chat...).
 */
export interface AppEvents {
  "chat:open": { message?: string } | undefined;
  "palette:open": undefined;
  "contact:prefill": { projectType?: string; description?: string };
  "hero:shape": { shape: number };
  "lab:tab": { tab: LabTab };
  "matrix:toggle": undefined;
}

export type LabTab = "chat" | "analyzer" | "concept" | "automation" | "prompt";

export function emit<K extends keyof AppEvents>(name: K, detail?: AppEvents[K]) {
  window.dispatchEvent(new CustomEvent(`rr:${name}`, { detail }));
}

export function on<K extends keyof AppEvents>(name: K, handler: (detail: AppEvents[K]) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<AppEvents[K]>).detail);
  window.addEventListener(`rr:${name}`, listener);
  return () => window.removeEventListener(`rr:${name}`, listener);
}
