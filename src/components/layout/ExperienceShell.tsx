"use client";

import dynamic from "next/dynamic";
import SmoothScroll from "@/components/providers/SmoothScroll";
import SceneBackground from "@/components/three/SceneBackground";
import Nav from "./Nav";
import Cursor from "./Cursor";
import ScrollProgress from "./ScrollProgress";
import BootSequence from "./BootSequence";

// carregados sob demanda — não entram no bundle inicial
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });
const ChatWidget = dynamic(() => import("@/components/lab/ChatWidget"), { ssr: false });
const EasterEggs = dynamic(() => import("./EasterEggs"), { ssr: false });

/** Camadas globais da experiência (fundo 3D, navegação, cursor, atalhos…). */
export default function ExperienceShell() {
  return (
    <>
      <BootSequence />
      <SmoothScroll />
      <SceneBackground />
      <ScrollProgress />
      <Nav />
      <Cursor />
      <CommandPalette />
      <ChatWidget />
      <EasterEggs />
    </>
  );
}
