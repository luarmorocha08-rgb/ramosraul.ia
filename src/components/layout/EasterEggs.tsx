"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/events";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/**
 * Pequenas surpresas que não atrapalham a navegação:
 *  - Código Konami (ou comando "matrix") → chuva de código por alguns segundos
 *  - Mensagem para devs no console
 */
export default function EasterEggs() {
  const [matrix, setMatrix] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log(
      "%cRAUL.OS%c  Curioso pelo código? Também gosto de quem olha os detalhes. Digite `help` no terminal do site ou ↑↑↓↓←→←→BA.",
      "background:#75E66B;color:#0B0F12;padding:4px 8px;border-radius:4px;font-weight:700",
      "color:#9aa29d",
    );
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === KONAMI[pos] ? pos + 1 : k === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        setMatrix(true);
      }
    };
    window.addEventListener("keydown", onKey);
    const off = on("matrix:toggle", () => setMatrix((v) => !v));
    return () => {
      window.removeEventListener("keydown", onKey);
      off();
    };
  }, []);

  useEffect(() => {
    if (!matrix) return;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const size = 16;
    const cols = Math.ceil(c.width / size);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    const chars = "RAULRAMOS01アイウエオカキクケコ<>/{}=+*".split("");
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(11,15,18,0.12)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${size}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillStyle = Math.random() > 0.96 ? "#F1EEE8" : "#75E66B";
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)]!, i * size, y * size);
        drops[i] = y * size > c.height && Math.random() > 0.975 ? 0 : y + 1;
      });
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    const t = window.setTimeout(() => setMatrix(false), 6000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [matrix]);

  if (!matrix) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[85] opacity-70 mix-blend-screen" aria-hidden>
      <canvas ref={canvas} className="size-full" />
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-signal">wake up, visitor… you found an easter egg.</p>
    </div>
  );
}
