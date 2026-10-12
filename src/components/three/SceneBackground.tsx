"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { bootDelay, getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { sceneState, setSceneTarget, setShape } from "./sceneStore";

const ParticleScene = dynamic(() => import("./ParticleScene"), { ssr: false });

interface SectionScene {
  shape: number | "hero";
  x: number;
  y?: number;
  scale: number;
  opacity: number;
}

/**
 * Coreografia da cena por seção: ao rolar, a estrutura de partículas
 * se transforma em outros elementos e muda de posição/luminosidade.
 * Índices de forma: 0 core · 1 neural · 2 terrain · 3 helix · 4 orbit
 */
const CHOREOGRAPHY: Record<string, SectionScene> = {
  home: { shape: "hero", x: 1.45, scale: 1, opacity: 1 },
  about: { shape: 3, x: -2.3, scale: 0.85, opacity: 0.4 },
  lab: { shape: 1, x: 0, scale: 1.35, opacity: 0.2 },
  capabilities: { shape: 2, x: 0, y: -0.3, scale: 1.15, opacity: 0.26 },
  ecosystem: { shape: 4, x: 0, scale: 1.1, opacity: 0.08 },
  projects: { shape: 4, x: 1.6, scale: 0.9, opacity: 0.16 },
  code: { shape: 1, x: 0, scale: 1.2, opacity: 0.12 },
  workflow: { shape: 3, x: 2, scale: 0.85, opacity: 0.3 },
  terminal: { shape: 0, x: -1.8, scale: 0.8, opacity: 0.25 },
  orchestration: { shape: 1, x: 0, scale: 1.3, opacity: 0.2 },
  transformation: { shape: 2, x: 0, y: -0.5, scale: 1.1, opacity: 0.2 },
  why: { shape: 4, x: 1.7, scale: 0.95, opacity: 0.35 },
  contact: { shape: 0, x: 0, scale: 1.25, opacity: 0.7 },
};

function detectWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function particleBudget() {
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (w < 768 || cores <= 4 || mem <= 2) return 5200;
  if (w < 1280) return 9000;
  return 15000;
}

export default function SceneBackground() {
  const reduced = useReducedMotion();
  const [support, setSupport] = useState<null | { webgl: boolean; count: number }>(null);

  useEffect(() => {
    // adiado até a intro terminar e o navegador ficar ocioso — não compete com o LCP
    const init = () => setSupport({ webgl: detectWebGL(), count: particleBudget() });
    let idle = 0;
    const t = globalThis.setTimeout(() => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(init, { timeout: 1200 });
      else init();
    }, Math.max(0, bootDelay() - 0.4) * 1000);
    return () => {
      globalThis.clearTimeout(t);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, []);

  // Ponteiro global
  useEffect(() => {
    const move = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      sceneState.pointer.active = e.pointerType === "mouse" || e.buttons > 0;
    };
    const leave = () => {
      sceneState.pointer.active = false;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") leave();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  // Coreografia por scroll
  useEffect(() => {
    const { ScrollTrigger } = getGsap();
    const triggers = Object.entries(CHOREOGRAPHY).flatMap(([id, cfg]) => {
      const el = document.getElementById(id);
      if (!el) return [];
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (!self.isActive) return;
          // no mobile o conteúdo ocupa toda a largura: a cena fica mais discreta
          const mobile = window.innerWidth < 768 && id !== "home";
          setSceneTarget({ x: cfg.x, y: cfg.y ?? 0, scale: cfg.scale, opacity: cfg.opacity * (mobile ? 0.55 : 1) });
          setShape(cfg.shape === "hero" ? sceneState.heroShape : cfg.shape);
        },
      });
    });
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {/* brilho ambiente */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_70%_40%,rgb(117_230_107/0.07),transparent_70%)]" />
      {support?.webgl ? (
        <ParticleScene count={support.count} reducedMotion={reduced} />
      ) : support ? (
        <div className="absolute right-[8%] top-1/2 aspect-square w-[min(70vw,560px)] -translate-y-1/2 rounded-full opacity-70 [background-image:radial-gradient(circle,rgb(241_238_232/0.75)_1.2px,transparent_1.6px)] [background-size:12px_12px] [mask-image:radial-gradient(circle,#000_45%,transparent_70%)]" />
      ) : null}
    </div>
  );
}
