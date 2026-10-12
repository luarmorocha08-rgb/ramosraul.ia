"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Registra plugins do GSAP uma única vez (apenas no cliente). */
export function getGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ nullTargetWarn: false });
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Tempo (s) até a intro terminar — animações de entrada esperam por ela. */
export function bootDelay() {
  if (typeof document === "undefined") return 0;
  const boot = document.documentElement.dataset.boot;
  return boot === "full" ? 2.75 : boot === "short" ? 1 : 0.15;
}
