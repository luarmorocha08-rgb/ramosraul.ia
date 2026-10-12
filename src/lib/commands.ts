"use client";

import { site } from "@/config/site";
import { emit, type LabTab } from "./events";
import { scrollToSection } from "./scroll";

export interface PaletteCommand {
  id: string;
  label: string;
  group: "Navegar" | "AI Lab" | "Contato" | "Extras";
  keywords: string;
  hint?: string;
  run: () => void;
}

const openLab = (tab: LabTab) => () => {
  emit("lab:tab", { tab });
  scrollToSection("lab");
};

export function buildPaletteCommands(): PaletteCommand[] {
  const cmds: PaletteCommand[] = [
    { id: "home", label: "Início", group: "Navegar", keywords: "home hero topo inicio", run: () => scrollToSection("home") },
    { id: "about", label: "Quem é Raul", group: "Navegar", keywords: "about sobre bio raul", run: () => scrollToSection("about") },
    { id: "lab", label: "AI Lab", group: "Navegar", keywords: "ia ai laboratorio playground", run: () => scrollToSection("lab") },
    { id: "capabilities", label: "Capabilities — o que posso criar", group: "Navegar", keywords: "servicos services capacidades", run: () => scrollToSection("capabilities") },
    { id: "ecosystem", label: "Ecossistema de tecnologias", group: "Navegar", keywords: "stack tecnologias tech", run: () => scrollToSection("ecosystem") },
    { id: "projects", label: "Selected Work — projetos", group: "Navegar", keywords: "projetos portfolio work", run: () => scrollToSection("projects") },
    { id: "workflow", label: "Como trabalho", group: "Navegar", keywords: "processo workflow etapas", run: () => scrollToSection("workflow") },
    { id: "terminal", label: "RAUL.OS — terminal", group: "Navegar", keywords: "terminal cli raulos", run: () => scrollToSection("terminal") },
    { id: "contact", label: "Contato", group: "Navegar", keywords: "contato contact orcamento", run: () => scrollToSection("contact") },
    { id: "chat", label: "Conversar com o assistente de IA", group: "AI Lab", keywords: "chat assistente bot conversar", run: () => emit("chat:open") },
    { id: "analyzer", label: "AI Business Analyzer", group: "AI Lab", keywords: "analise negocio analyzer", run: openLab("analyzer") },
    { id: "concept", label: "Website Concept Generator", group: "AI Lab", keywords: "site conceito gerador website", run: openLab("concept") },
    { id: "automation", label: "Automation Simulator", group: "AI Lab", keywords: "automacao fluxo simulador", run: openLab("automation") },
    { id: "prompt", label: "Prompt Engineering Lab", group: "AI Lab", keywords: "prompt engenharia", run: openLab("prompt") },
    { id: "orchestration", label: "Orquestração de agentes", group: "AI Lab", keywords: "agentes multiagente orquestracao", run: () => scrollToSection("orchestration") },
    { id: "instagram", label: `Abrir Instagram ${site.instagram.handle}`, group: "Contato", keywords: "instagram social", run: () => window.open(site.instagram.url, "_blank", "noopener") },
    { id: "start", label: "Iniciar um projeto", group: "Contato", keywords: "start project projeto orcamento", run: () => scrollToSection("contact") },
    { id: "matrix", label: "Modo Matrix", group: "Extras", keywords: "matrix easter egg", hint: "easter egg", run: () => emit("matrix:toggle") },
  ];
  if (site.whatsapp) {
    const url = site.whatsapp.url;
    cmds.push({ id: "whatsapp", label: "Conversar no WhatsApp", group: "Contato", keywords: "whatsapp zap mensagem", run: () => window.open(url, "_blank", "noopener") });
  }
  if (site.email) {
    const url = site.email.url;
    cmds.push({ id: "email", label: `Enviar e-mail`, group: "Contato", keywords: "email e-mail", run: () => (window.location.href = url) });
  }
  return cmds;
}
