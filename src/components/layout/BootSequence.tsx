"use client";

import { useEffect, useRef, useState } from "react";

const CODE_LINES = [
  "import { intelligence } from '@raul/core'",
  "const lab = await boot({ mode: 'creative' })",
  "neural.connect(nodes, { density: 0.86 })",
  "render(<Experience particles={12_000} />)",
  "agents.spawn(['strategy', 'design', 'code'])",
  "> compiling shaders ……… ok",
  "> loading interface ……… ok",
];

const MESSAGES = ["Initializing creative intelligence...", "Building digital experiences...", "Welcome to the future."];

/**
 * Introdução cinematográfica (≈2,6 s na primeira visita, ≈0,9 s depois).
 * Não bloqueia a página: o conteúdo já está renderizado por baixo,
 * o visitante pode pular (botão ou Esc) e o overlay some sozinho.
 */
export default function BootSequence() {
  const [phase, setPhase] = useState<"run" | "exit" | "done">("run");
  const [msg, setMsg] = useState(0);
  const [mode, setMode] = useState<"full" | "short">("full");
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const boot = document.documentElement.dataset.boot;
    if (boot === "skip") {
      const t = window.setTimeout(() => setPhase("done"), 0);
      return () => clearTimeout(t);
    }
    const m = boot === "short" ? "short" : "full";
    const total = m === "full" ? 2600 : 900;
    try {
      localStorage.setItem("rr:boot", "seen");
    } catch {}
    const timers = [
      window.setTimeout(() => setMode(m), 0),
      window.setTimeout(() => setMsg(1), total * 0.38),
      window.setTimeout(() => setMsg(2), total * 0.7),
      window.setTimeout(() => setPhase("exit"), total),
      window.setTimeout(() => setPhase("done"), total + 900),
    ];
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPhase("exit");
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (phase === "exit") {
      const t = window.setTimeout(() => setPhase("done"), 900);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // partículas formando uma esfera (Canvas 2D — leve e instantâneo)
  useEffect(() => {
    const c = canvas.current;
    if (!c || phase === "done") return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const N = window.innerWidth < 768 ? 700 : 1400;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      return {
        tx: Math.cos(golden * i) * r,
        ty: y,
        tz: Math.sin(golden * i) * r,
        sx: (Math.random() - 0.5) * 3,
        sy: (Math.random() - 0.5) * 3,
        d: Math.random() * 0.5,
      };
    });
    const start = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const w = c.width;
      const h = c.height;
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.2;
      const form = Math.min(1, Math.max(0, (t - 0.25) / 1.3));
      const rot = t * 0.6;
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      for (const p of pts) {
        const k = Math.min(1, Math.max(0, (form - p.d * 0.5) / 0.5));
        const e = 1 - Math.pow(1 - k, 3);
        const x3 = p.tx * cos - p.tz * sin;
        const z3 = p.tx * sin + p.tz * cos;
        const x = (p.sx * (1 - e) + x3 * e) * R + w / 2;
        const y = (p.sy * (1 - e) + p.ty * e) * R + h / 2;
        const depth = (z3 + 1) / 2;
        ctx.globalAlpha = (0.2 + depth * 0.8) * Math.min(1, t * 2);
        ctx.fillStyle = depth > 0.92 ? "#75E66B" : "#F1EEE8";
        const s = (0.6 + depth * 1.2) * dpr;
        ctx.fillRect(x, y, s, s);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      id="boot-sequence"
      role="status"
      aria-live="polite"
      aria-label="Carregando experiência"
      className="fixed inset-0 z-[95] bg-ink transition-[clip-path,opacity] duration-[900ms] ease-[var(--ease-quart)]"
      style={{
        clipPath: phase === "exit" ? "circle(0% at 50% 50%)" : "circle(150% at 50% 50%)",
        opacity: phase === "exit" ? 0.6 : 1,
      }}
    >
      <canvas ref={canvas} className="absolute inset-0 size-full" aria-hidden />

      {mode === "full" && (
        <div className="absolute left-4 top-20 hidden max-w-md font-mono text-[0.7rem] leading-6 text-signal/60 md:left-10 md:block" aria-hidden>
          {CODE_LINES.map((l, i) => (
            <div key={i} className="opacity-0" style={{ animation: `msg-in .3s ${0.1 + i * 0.16}s forwards` }}>
              {l}
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-[14vh] flex flex-col items-center gap-4 text-center">
        <p className="font-display text-2xl font-semibold tracking-[0.35em] text-bone opacity-0 md:text-3xl" style={{ animation: "msg-in .8s .5s forwards" }}>
          RAUL RAMOS
        </p>
        <p key={msg} className="font-mono text-xs text-bone/60" style={{ animation: "msg-in .4s forwards" }}>
          {MESSAGES[msg]}
          <span className="ml-1 inline-block animate-blink text-signal">▌</span>
        </p>
        <div className="mt-2 h-px w-48 overflow-hidden bg-line">
          <div className="h-full bg-signal" style={{ animation: `boot-bar ${mode === "full" ? 2.6 : 0.9}s linear forwards` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPhase("exit")}
        className="absolute bottom-6 right-6 rounded-full border border-line px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-bone/60 transition-colors hover:border-signal hover:text-bone"
      >
        Pular intro
      </button>
    </div>
  );
}
