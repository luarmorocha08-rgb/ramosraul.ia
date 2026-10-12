import type { ReactNode } from "react";
import SplitHeading from "./SplitHeading";
import Reveal from "./Reveal";
import { cn } from "@/lib/utils";

/** Cabeçalho padrão de seção: índice técnico + kicker + título + descrição. */
export default function SectionHeader({
  index,
  kicker,
  title,
  accent,
  description,
  align = "left",
  className,
  children,
}: {
  index: string;
  kicker: string;
  title: string;
  accent?: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}) {
  const center = align === "center";
  return (
    <header className={cn("relative mb-12 md:mb-16", center && "mx-auto max-w-4xl text-center", className)}>
      <Reveal className={cn("mb-6 flex items-center gap-3", center && "justify-center")}>
        <span className="font-mono text-xs text-signal">[{index}]</span>
        <span className="h-px w-10 bg-gradient-to-r from-signal/70 to-transparent" />
        <span className="kicker">{kicker}</span>
      </Reveal>
      <SplitHeading
        className="font-display text-[clamp(2.4rem,6.4vw,5.8rem)] font-semibold uppercase leading-[0.92] tracking-[-0.045em]"
        lines={[{ text: title }, ...(accent ? [{ text: accent, className: "text-gradient-signal" }] : [])]}
      />
      {description && (
        <Reveal delay={0.15} className={cn("mt-6 max-w-2xl text-base leading-relaxed text-bone/65 md:text-lg", center && "mx-auto")}>
          {description}
        </Reveal>
      )}
      {children}
    </header>
  );
}
