"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { bootDelay, getGsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface Line {
  text: string;
  className?: string;
}

/**
 * Título com revelação linha a linha (máscara + deslocamento).
 * O texto completo permanece acessível para leitores de tela.
 */
export default function SplitHeading({
  lines,
  as: Tag = "h2",
  className,
  trigger = "scroll",
  delay = 0,
  children,
}: {
  lines: Line[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  trigger?: "scroll" | "load";
  delay?: number;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = getGsap();
    const inner = el.querySelectorAll<HTMLElement>("[data-line-inner]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { yPercent: 110, rotate: 2 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.09,
          delay: delay + (trigger === "load" ? bootDelay() : 0),
          ...(trigger === "scroll" ? { scrollTrigger: { trigger: el, start: "top 85%", once: true } } : {}),
        },
      );
    }, el);
    return () => ctx.revert();
  }, [trigger, delay]);

  return (
    <Tag ref={ref} className={className} aria-label={lines.map((l) => l.text).join(" ")}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]" aria-hidden>
          <span data-line-inner className={cn("block will-change-transform", line.className)}>
            {line.text}
          </span>
        </span>
      ))}
      {children}
    </Tag>
  );
}
