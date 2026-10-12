"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

interface RevealProps {
  children: ReactNode;
  as?: "div" | "p" | "ul" | "li" | "span";
  className?: string;
  /** anima filhos diretos em sequência */
  stagger?: number;
  delay?: number;
  y?: number;
  id?: string;
}

/** Revelação progressiva ao entrar na viewport (GSAP + ScrollTrigger). */
export default function Reveal({ children, as = "div", className, stagger, delay = 0, y = 36, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = stagger ? Array.from(el.children) : [el];
    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      return;
    }
    const { gsap } = getGsap();
    gsap.set(el, { opacity: 1 });
    // blur é caro de pintar em telas pequenas: só no desktop
    const blur = window.matchMedia("(min-width: 1024px)").matches ? "blur(8px)" : "blur(0px)";
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y, opacity: 0, filter: blur },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "expo.out",
          delay,
          stagger: stagger ?? 0,
          clearProps: "filter",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [stagger, delay, y]);

  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className} data-reveal id={id}>
      {children}
    </Tag>
  );
}
