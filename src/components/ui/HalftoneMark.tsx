"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Retrato holográfico gerado por código: um texto/monograma amostrado em
 * uma grade de pontos que respiram e reagem ao cursor.
 * Usado enquanto não há fotografia definida em content/profile.ts.
 */
export default function HalftoneMark({ text = "RR", className }: { text?: string; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useInView(canvas, "100px");

  useEffect(() => {
    const c = canvas.current;
    if (!c || !visible) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, dots: Array<{ x: number; y: number; v: number }> = [];
    const mouse = { x: -999, y: -999 };

    const build = () => {
      const rect = c.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      c.width = w * dpr;
      c.height = h * dpr;
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.floor(w));
      off.height = Math.max(1, Math.floor(h));
      const o = off.getContext("2d");
      if (!o) return;
      o.fillStyle = "#000";
      o.fillRect(0, 0, off.width, off.height);
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.font = `700 ${Math.min(w, h) * 0.62}px ${getComputedStyle(document.body).fontFamily}`;
      o.fillText(text, w / 2, h * 0.53);
      const img = o.getImageData(0, 0, off.width, off.height).data;
      const step = Math.max(6, Math.round(Math.min(w, h) / 62));
      dots = [];
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const i = (Math.floor(y) * off.width + Math.floor(x)) * 4;
          const v = (img[i] ?? 0) / 255;
          // pontos de fundo bem tênues formam uma "esfera" ao redor
          const dx = (x - w / 2) / (w / 2);
          const dy = (y - h / 2) / (h / 2);
          const ring = Math.max(0, 1 - Math.abs(Math.hypot(dx, dy) - 0.82) * 9);
          if (v > 0.1 || ring > 0.05) dots.push({ x, y, v: Math.max(v, ring * 0.35) });
        }
      }
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(c);

    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const leave = () => {
      mouse.x = mouse.y = -999;
    };
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerleave", leave);

    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const dist = Math.hypot(d.x - mouse.x, d.y - mouse.y);
        const push = Math.max(0, 1 - dist / 90);
        const wave = reduced ? 0 : Math.sin(t * 1.4 + d.x * 0.03 + d.y * 0.02) * 0.25;
        const r = (0.6 + d.v * 2.1 + wave * d.v) * (1 + push * 0.9);
        const ox = push ? ((d.x - mouse.x) / (dist || 1)) * push * 10 : 0;
        const oy = push ? ((d.y - mouse.y) / (dist || 1)) * push * 10 : 0;
        ctx.globalAlpha = 0.15 + d.v * 0.85;
        ctx.fillStyle = push > 0.2 ? "#75E66B" : d.v > 0.5 ? "#F1EEE8" : "#C18B65";
        ctx.beginPath();
        ctx.arc(d.x + ox, d.y + oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    if (reduced) c.addEventListener("pointermove", () => requestAnimationFrame(draw));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerleave", leave);
    };
  }, [text, visible]);

  return <canvas ref={canvas} className={className} aria-hidden />;
}
