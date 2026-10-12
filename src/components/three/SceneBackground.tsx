"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
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
  /** luz ambiente: posição (% do viewport, relativa ao centro) e intensidade verde/cobre */
  light: { x: number; y: number; signal: number; copper: number };
}

/**
 * Coreografia da cena por seção: ao rolar, a estrutura de partículas
 * se transforma em outros elementos e muda de posição/luminosidade.
 * Índices de forma: 0 core · 1 neural · 2 terrain · 3 helix · 4 orbit
 */
const CHOREOGRAPHY: Record<string, SectionScene> = {
  home: { shape: "hero", x: 1.45, scale: 1, opacity: 1, light: { x: 22, y: -8, signal: 1, copper: 0.2 } },
  about: { shape: 3, x: -2.3, scale: 0.85, opacity: 0.4, light: { x: -25, y: 5, signal: 0.3, copper: 1 } },
  lab: { shape: 1, x: 0, scale: 1.35, opacity: 0.2, light: { x: 0, y: -30, signal: 1, copper: 0 } },
  capabilities: { shape: 2, x: 0, y: -0.3, scale: 1.15, opacity: 0.26, light: { x: 0, y: 25, signal: 0.7, copper: 0.4 } },
  ecosystem: { shape: 4, x: 0, scale: 1.1, opacity: 0.08, light: { x: -15, y: 0, signal: 0.8, copper: 0.2 } },
  projects: { shape: 4, x: 1.6, scale: 0.9, opacity: 0.16, light: { x: 20, y: -20, signal: 0.3, copper: 0.9 } },
  code: { shape: 1, x: 0, scale: 1.2, opacity: 0.12, light: { x: 25, y: 10, signal: 0.8, copper: 0 } },
  workflow: { shape: 3, x: 2, scale: 0.85, opacity: 0.3, light: { x: 0, y: 0, signal: 0.6, copper: 0.5 } },
  terminal: { shape: 0, x: -1.8, scale: 0.8, opacity: 0.25, light: { x: 0, y: 15, signal: 0.9, copper: 0 } },
  orchestration: { shape: 1, x: 0, scale: 1.3, opacity: 0.2, light: { x: 10, y: -10, signal: 0.9, copper: 0.3 } },
  transformation: { shape: 2, x: 0, y: -0.5, scale: 1.1, opacity: 0.2, light: { x: 25, y: 0, signal: 0.8, copper: 0.6 } },
  why: { shape: 4, x: 1.7, scale: 0.95, opacity: 0.35, light: { x: -20, y: -10, signal: 0.4, copper: 1 } },
  contact: { shape: 0, x: 0, scale: 1.25, opacity: 0.7, light: { x: 0, y: -15, signal: 1.2, copper: 0.3 } },
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
  const signalLight = useRef<HTMLDivElement>(null);
  const copperLight = useRef<HTMLDivElement>(null);

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
          const { light } = cfg;
          if (signalLight.current) {
            signalLight.current.style.transform = `translate(${light.x}vw, ${light.y}vh)`;
            signalLight.current.style.opacity = String(light.signal);
          }
          if (copperLight.current) {
            copperLight.current.style.transform = `translate(${-light.x * 0.8}vw, ${-light.y + 20}vh)`;
            copperLight.current.style.opacity = String(light.copper);
          }
        },
      });
    });
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {/* iluminação ambiente — muda suavemente entre seções */}
      <div className="absolute inset-0 overflow-hidden">
        <div ref={signalLight} className="ambient-light" data-tone="signal" style={{ transform: "translate(22vw, -8vh)" }} />
        <div ref={copperLight} className="ambient-light" data-tone="copper" style={{ transform: "translate(-18vw, 28vh)", opacity: 0.2 }} />
      </div>
      {support?.webgl ? (
        <ParticleScene count={support.count} reducedMotion={reduced} />
      ) : support ? (
        <div className="absolute right-[8%] top-1/2 aspect-square w-[min(70vw,560px)] -translate-y-1/2 rounded-full opacity-70 [background-image:radial-gradient(circle,rgb(241_238_232/0.75)_1.2px,transparent_1.6px)] [background-size:12px_12px] [mask-image:radial-gradient(circle,#000_45%,transparent_70%)]" />
      ) : null}
    </div>
  );
}
