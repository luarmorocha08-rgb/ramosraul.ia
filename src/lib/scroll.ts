"use client";

import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/** Rola suavemente até uma seção e move o foco para ela (acessibilidade). */
export function scrollToSection(id: string, opts: { focus?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const done = () => {
    if (opts.focus === false) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };
  if (lenis) {
    lenis.scrollTo(el, { offset: id === "home" ? 0 : -64, duration: 1.4, onComplete: done });
  } else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    done();
  }
  if (history.replaceState) history.replaceState(null, "", id === "home" ? " " : `#${id}`);
}
