"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { site } from "@/config/site";
import { services } from "@/content/services";
import { stack } from "@/content/stack";
import { projects } from "@/content/projects";
import { emit } from "@/lib/events";
import { scrollToSection } from "@/lib/scroll";
import { SHAPES } from "@/components/three/shapes";
import { cn } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";

interface Line {
  id: number;
  kind: "in" | "out" | "ok" | "err" | "muted";
  content: ReactNode;
}

const COMMANDS: Record<string, string> = {
  help: "lista os comandos disponíveis",
  about: "quem é Raul → abre a seção About",
  projects: "abre o portfólio",
  services: "lista serviços → abre Capabilities",
  ai: "leva ao laboratório de IA",
  chat: "conversa com o assistente (ex.: chat olá)",
  stack: "tecnologias do ecossistema",
  contact: "abre as opções de contato",
  shape: "muda a estrutura 3D (core, neural, terrain, helix, orbit)",
  whoami: "quem é você?",
  clear: "limpa o terminal",
  history: "comandos usados",
};

const HIDDEN = ["sudo", "matrix", "hello", "oi", "ls", "date", "exit"];

let lineId = 0;
const L = (kind: Line["kind"], content: ReactNode): Line => ({ id: ++lineId, kind, content });

/** RAUL.OS — navegação alternativa em formato de terminal. */
export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(() => [
    L("muted", "RAUL.OS v1.0 — creative intelligence shell"),
    L("muted", "Digite help (ou clique em um comando abaixo). Tab completa · ↑↓ histórico."),
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const out = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    out.current?.scrollTo({ top: out.current.scrollHeight });
  }, [lines]);

  const navigate = (id: string) => window.setTimeout(() => scrollToSection(id), 650);

  const exec = (raw: string) => {
    const cmdline = raw.trim();
    if (!cmdline) return;
    const [cmd = "", ...args] = cmdline.split(/\s+/);
    const c = cmd.toLowerCase();
    const arg = args.join(" ");
    setHistory((h) => [...h, cmdline].slice(-50));
    setCursor(-1);
    const add = (...ls: Line[]) => setLines((prev) => [...prev, L("in", cmdline), ...ls].slice(-120));

    switch (c) {
      case "help":
        add(
          ...Object.entries(COMMANDS).map(([k, v]) =>
            L(
              "out",
              <>
                <span className="inline-block w-24 text-signal">{k}</span>
                <span className="text-bone/60">{v}</span>
              </>,
            ),
          ),
        );
        break;
      case "about":
        add(L("out", `${site.shortName} — ${site.signature}.`), L("out", site.tagline), L("ok", "→ abrindo About…"));
        navigate("about");
        break;
      case "projects":
        add(...projects.map((p) => L("out", `• ${p.name} — ${p.category}${p.isDemo ? " (conceito)" : ""}`)), L("ok", "→ abrindo Selected Work…"));
        navigate("projects");
        break;
      case "services":
        add(...services.map((s) => L("out", `${s.index}  ${s.title}`)), L("ok", "→ abrindo Capabilities…"));
        navigate("capabilities");
        break;
      case "ai":
      case "lab":
        add(L("ok", "→ entrando no AI Lab…"));
        navigate("lab");
        break;
      case "chat":
        add(L("ok", arg ? `→ enviando ao assistente: “${arg}”` : "→ abrindo assistente de IA…"));
        emit("chat:open", arg ? { message: arg } : undefined);
        break;
      case "stack":
        add(L("out", stack.map((s) => s.name).join(" · ")), L("ok", "→ abrindo o ecossistema…"));
        navigate("ecosystem");
        break;
      case "contact":
        add(
          L("out", `Instagram  ${site.instagram.handle}`),
          ...(site.whatsapp ? [L("out", "WhatsApp   disponível na seção de contato")] : []),
          ...(site.email ? [L("out", `E-mail     ${site.email.address}`)] : []),
          L("ok", "→ abrindo contato…"),
        );
        navigate("contact");
        break;
      case "shape": {
        const idx = SHAPES.indexOf(arg.toLowerCase() as (typeof SHAPES)[number]);
        if (idx < 0) add(L("err", `forma inválida. Use: ${SHAPES.join(", ")}`));
        else {
          add(L("ok", `→ reconfigurando estrutura para ${SHAPES[idx]}…`));
          emit("hero:shape", { shape: idx });
          navigate("home");
        }
        break;
      }
      case "whoami":
        add(L("out", "visitor — alguém com uma ideia que pode virar um grande resultado."));
        break;
      case "history":
        add(...(history.length ? history.map((h, i) => L("muted", `${i + 1}  ${h}`)) : [L("muted", "histórico vazio")]));
        break;
      case "clear":
        setLines([]);
        break;
      case "sudo":
        add(L("ok", arg.includes("hire") ? "permissão concedida ✓ — vamos conversar sobre o seu projeto." : "nice try. 😉"));
        if (arg.includes("hire")) navigate("contact");
        break;
      case "matrix":
        add(L("ok", "follow the white rabbit…"));
        emit("matrix:toggle");
        break;
      case "hello":
      case "oi":
        add(L("out", "Olá! Digite help para começar."));
        break;
      case "ls":
        add(L("out", "about/  lab/  capabilities/  projects/  contact/  secrets.txt"));
        break;
      case "date":
        add(L("out", new Date().toLocaleString("pt-BR")));
        break;
      case "exit":
        add(L("muted", "não há saída — só próximos passos. 🚀"));
        break;
      default:
        add(L("err", `comando não encontrado: ${c}. Digite help.`));
    }
  };

  const complete = () => {
    const v = value.trim().toLowerCase();
    if (!v) return;
    const all = [...Object.keys(COMMANDS), ...HIDDEN];
    if (v.startsWith("shape ")) {
      const part = v.slice(6);
      const m = SHAPES.find((s) => s.startsWith(part));
      if (m) setValue(`shape ${m}`);
      return;
    }
    const matches = all.filter((k) => k.startsWith(v));
    if (matches.length === 1) setValue(matches[0]! + (matches[0] === "shape" || matches[0] === "chat" ? " " : ""));
    else if (matches.length > 1) setLines((p) => [...p, L("muted", matches.join("   "))]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(value);
      setValue("");
    } else if (e.key === "Tab") {
      if (value.trim()) {
        e.preventDefault();
        complete();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor < 0) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setValue("");
      } else {
        setCursor(next);
        setValue(history[next] ?? "");
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const suggestion = value && !value.includes(" ") ? Object.keys(COMMANDS).find((k) => k.startsWith(value.toLowerCase()) && k !== value.toLowerCase()) : undefined;

  return (
    <section id="terminal" aria-label="RAUL.OS — terminal interativo" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeader index="11" kicker="Interactive AI Terminal" title="RAUL" accent=".OS" description="Uma forma alternativa de navegar. Não precisa saber programar: clique nos comandos ou digite." />

        <Reveal className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-line bg-[#060809]/95 shadow-[0_40px_120px_-40px_rgb(117_230_107/0.25)]" onClick={() => input.current?.focus()}>
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="size-2.5 rounded-full bg-danger/70" />
              <span className="size-2.5 rounded-full bg-copper/70" />
              <span className="size-2.5 rounded-full bg-signal/70" />
              <span className="ml-auto font-mono text-[0.65rem] text-steel">visitor@raul.os: ~</span>
            </div>
            <div ref={out} data-lenis-prevent className="h-[340px] overflow-y-auto p-5 font-mono text-[0.8rem] leading-6" role="log" aria-live="polite" aria-label="Saída do terminal">
              {lines.map((l) => (
                <div
                  key={l.id}
                  className={cn(
                    l.kind === "in" && "text-bone",
                    l.kind === "out" && "text-bone/75",
                    l.kind === "ok" && "text-signal",
                    l.kind === "err" && "text-danger",
                    l.kind === "muted" && "text-steel",
                  )}
                >
                  {l.kind === "in" && <span className="mr-2 text-signal">❯</span>}
                  {l.content}
                </div>
              ))}
              <div className="flex items-center">
                <span className="mr-2 text-signal" aria-hidden>
                  ❯
                </span>
                <label htmlFor="terminal-input" className="sr-only">
                  Comando do terminal
                </label>
                <div className="relative flex-1">
                  {suggestion && (
                    <span className="pointer-events-none absolute left-0 top-0 text-steel/60" aria-hidden>
                      {value}
                      <span>{suggestion.slice(value.length)}</span>
                    </span>
                  )}
                  <input
                    id="terminal-input"
                    ref={input}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="relative w-full bg-transparent text-bone caret-signal outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 border-t border-line p-3">
              {["help", "about", "projects", "services", "ai", "stack", "contact"].map((c) => (
                <button key={c} type="button" onClick={() => exec(c)} className="rounded-md border border-line px-2.5 py-1 font-mono text-[0.7rem] text-bone/70 transition-colors hover:border-signal hover:text-signal">
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
