"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor personalizado: um anel que segue o ponteiro com inércia.
 * O cursor nativo continua visível — o anel é apenas um reforço visual.
 * Desativado em telas de toque e com movimento reduzido.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = -100, y = -100, tx = -100, ty = -100, raf = 0, scale = 1, ts = 1;
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      scale += (ts - scale) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = "1";
      const target = (e.target as Element | null)?.closest?.("a,button,[data-cursor],input,textarea,select,label");
      const text = target?.getAttribute("data-cursor-label") ?? "";
      ts = target ? (text ? 2.6 : target.matches("input,textarea,select") ? 0.6 : 1.8) : 1;
      el.dataset.hover = target ? "true" : "false";
      if (label.current) label.current.textContent = text;
    };
    const leave = () => (el.style.opacity = "0");
    const down = () => (ts *= 0.8);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden size-8 place-items-center rounded-full border border-signal/60 opacity-0 mix-blend-difference transition-[opacity,background-color,border-color] duration-300 data-[hover=true]:border-signal data-[hover=true]:bg-signal/10 [@media(hover:hover)_and_(pointer:fine)]:grid"
    >
      <span ref={label} className="font-mono text-[0.32rem] uppercase tracking-widest text-signal" />
    </div>
  );
}
