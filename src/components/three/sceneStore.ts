"use client";

/**
 * Estado compartilhado (fora do React) entre a cena WebGL e a UI.
 * Atualizado a cada frame sem causar re-render.
 */
type Listener = (shape: number) => void;

export const sceneState = {
  /** forma atualmente exibida (índice em SHAPES) */
  shape: 0,
  /** forma escolhida pelo usuário no hero (restaurada ao voltar ao topo) */
  heroShape: 0,
  /** alvo de posição/escala/opacidade definido pela seção visível */
  target: { x: 0, y: 0, scale: 1, opacity: 1 },
  /** ponteiro normalizado (-1..1) */
  pointer: { x: 0, y: 0, active: false },
  /** rotação acumulada por arraste */
  drag: { x: 0, y: 0 },
  /** energia extra (clique) que decai com o tempo */
  pulse: 0,
  /** solicita um novo frame (usado com frameloop "demand") */
  requestRender: null as null | (() => void),
};

const listeners = new Set<Listener>();

export function setShape(shape: number) {
  if (shape === sceneState.shape) return;
  sceneState.shape = shape;
  listeners.forEach((l) => l(shape));
}

export function onShapeChange(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function setSceneTarget(t: Partial<typeof sceneState.target>) {
  Object.assign(sceneState.target, t);
  sceneState.requestRender?.();
}
