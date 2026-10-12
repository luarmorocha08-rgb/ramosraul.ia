"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card com efeito tilt 3D + borda luminosa que segue o cursor.
 * Apenas em dispositivos com hover; no toque permanece estático.
 */
export default function TiltCard({
  children,
  className,
  max = 8,
  style,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
  as?: "div" | "article" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0)`;
      }
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Tag
      ref={ref as never}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={style}
      className={cn("edge-glow transition-transform duration-500 ease-[var(--ease-expo)] will-change-transform", className)}
    >
      {children}
    </Tag>
  );
}
