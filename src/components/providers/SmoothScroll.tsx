"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";

/**
 * Smooth scrolling com Lenis, sincronizado com o ticker do GSAP para que
 * ScrollTrigger e Lenis usem o mesmo relógio (sem conflito de animações).
 * Desativado quando o usuário prefere movimento reduzido.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const { gsap, ScrollTrigger } = getGsap();
    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Deep link (#secao) na carga inicial
    if (location.hash.length > 1) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) requestAnimationFrame(() => lenis.scrollTo(el, { immediate: true, offset: -64 }));
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
