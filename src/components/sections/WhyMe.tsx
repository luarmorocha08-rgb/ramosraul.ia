import { differentiators } from "@/content/process";
import SectionHeader from "@/components/ui/SectionHeader";
import TiltCard from "@/components/ui/TiltCard";
import Reveal from "@/components/ui/Reveal";

const GLYPHS = ["◆", "⌘", "◎", "✦", "⇄", "▲"];

/** WHY WORK WITH ME? — diferenciais com cards interativos e 3D discreto. */
export default function WhyMe() {
  return (
    <section id="why" aria-label="Por que trabalhar comigo" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader index="10" kicker="Why work with me?" title="Built different." accent="Built for you." />
        <Reveal as="ul" stagger={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((d, i) => (
            <li key={d.title} className="perspective-1200">
              <TiltCard className="glass group h-full rounded-[1.5rem] p-7" max={10}>
                <div className="preserve-3d">
                  <div className="mb-10 flex items-start justify-between [transform:translateZ(40px)]">
                    <span className="relative grid size-14 place-items-center rounded-2xl border border-signal/30 bg-signal/[0.07] text-xl text-signal transition-transform duration-700 ease-[var(--ease-expo)] group-hover:[transform:rotateY(180deg)]">
                      <span aria-hidden>{GLYPHS[i]}</span>
                    </span>
                    <span className="font-mono text-xs text-steel">0{i + 1}</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight [transform:translateZ(24px)]">{d.title}</h3>
                  <p className="mt-3 leading-relaxed text-bone/60 [transform:translateZ(12px)]">{d.description}</p>
                </div>
              </TiltCard>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
