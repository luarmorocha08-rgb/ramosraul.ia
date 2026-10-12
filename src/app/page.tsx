import ExperienceShell from "@/components/layout/ExperienceShell";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import AILab from "@/components/sections/AILab";
import Orchestration from "@/components/sections/Orchestration";
import Transformation from "@/components/sections/Transformation";
import Capabilities from "@/components/sections/Capabilities";
import Ecosystem from "@/components/sections/Ecosystem";
import LiveCode from "@/components/sections/LiveCode";
import Workflow from "@/components/sections/Workflow";
import Projects from "@/components/sections/Projects";
import WhyMe from "@/components/sections/WhyMe";
import Terminal from "@/components/sections/Terminal";
import Contact from "@/components/sections/Contact";

/**
 * Narrativa: impactar → apresentar → deixar experimentar → mostrar capacidades
 * → provar com trabalho → construir confiança → convidar para contato.
 */
export default function Home() {
  return (
    <>
      <ExperienceShell />
      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <AILab />
        <Orchestration />
        <Transformation />
        <Capabilities />
        <Ecosystem />
        <LiveCode />
        <Workflow />
        <Projects />
        <WhyMe />
        <Terminal />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}
