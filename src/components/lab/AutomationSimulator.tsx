"use client";

import { useEffect, useRef, useState } from "react";
import { scrollToSection } from "@/lib/scroll";
import { emit } from "@/lib/events";
import { cn } from "@/lib/utils";

interface FlowNode {
  label: string;
  tool: string;
  log: string;
}

interface Scenario {
  id: string;
  label: string;
  message: string;
  nodes: FlowNode[];
  result: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "store",
    label: "Atendimento de loja",
    message: "Oi! Vocês têm o tênis branco no tamanho 40?",
    nodes: [
      { label: "Mensagem recebida", tool: "WhatsApp", log: "Nova mensagem de cliente · canal WhatsApp" },
      { label: "IA interpreta", tool: "LLM", log: "Intenção: consulta_estoque · produto: tênis branco · tamanho: 40" },
      { label: "Consulta estoque", tool: "ERP / API", log: "GET /estoque?sku=TEN-BR&tam=40 → 3 unidades" },
      { label: "Resposta gerada", tool: "LLM", log: "“Temos sim! 3 pares no 40. Quer que eu reserve um?”" },
      { label: "Lead registrado", tool: "CRM", log: "Contato salvo · interesse: tênis branco · etapa: negociação" },
    ],
    result: "Cliente respondido em segundos e oportunidade registrada para a equipe.",
  },
  {
    id: "schedule",
    label: "Agendamento",
    message: "Quero marcar um horário para quinta à tarde.",
    nodes: [
      { label: "Pedido recebido", tool: "Site / Chat", log: "Solicitação de agendamento recebida" },
      { label: "IA extrai data", tool: "LLM", log: "Dia: quinta-feira · período: tarde" },
      { label: "Consulta agenda", tool: "Google Calendar", log: "Horários livres: 14:00, 15:30, 17:00" },
      { label: "Confirma horário", tool: "LLM", log: "“Tenho 14h, 15h30 ou 17h. Qual prefere?”" },
      { label: "Lembrete agendado", tool: "Automação", log: "Lembrete automático programado para 24h antes" },
    ],
    result: "Horário oferecido sem troca de mensagens manual e lembrete garantido.",
  },
  {
    id: "leads",
    label: "Qualificação de leads",
    message: "Preciso de um sistema para minha empresa de 40 funcionários.",
    nodes: [
      { label: "Formulário enviado", tool: "Site", log: "Novo lead via formulário de contato" },
      { label: "IA qualifica", tool: "LLM", log: "Porte: médio · necessidade: sistema interno · prioridade: alta" },
      { label: "Enriquecimento", tool: "API", log: "Dados públicos da empresa anexados ao lead" },
      { label: "Roteamento", tool: "Regras", log: "Encaminhado para: comercial · SLA: hoje" },
      { label: "Alerta à equipe", tool: "Slack / E-mail", log: "Notificação enviada com resumo do lead" },
    ],
    result: "Leads priorizados automaticamente — a equipe foca em quem tem mais aderência.",
  },
  {
    id: "orders",
    label: "Organização de pedidos",
    message: "2 pizzas grandes, uma calabresa e uma margherita, para entrega.",
    nodes: [
      { label: "Pedido recebido", tool: "WhatsApp", log: "Mensagem de pedido recebida" },
      { label: "IA estrutura", tool: "LLM", log: "Itens: [calabresa G, margherita G] · tipo: entrega" },
      { label: "Valida cardápio", tool: "Banco de dados", log: "Itens disponíveis · total calculado" },
      { label: "Envia à cozinha", tool: "Painel", log: "Pedido #A-102 exibido no painel da cozinha" },
      { label: "Confirma ao cliente", tool: "WhatsApp", log: "Resumo do pedido e previsão enviados" },
    ],
    result: "Pedidos chegam organizados na cozinha, sem digitação manual.",
  },
  {
    id: "faq",
    label: "Respostas automatizadas",
    message: "Qual o horário de funcionamento no sábado?",
    nodes: [
      { label: "Pergunta recebida", tool: "Instagram DM", log: "Nova mensagem direta recebida" },
      { label: "IA busca resposta", tool: "RAG", log: "Documento: políticas.pdf · trecho: horários" },
      { label: "Verifica confiança", tool: "Regras", log: "Confiança alta → resposta automática permitida" },
      { label: "Resposta enviada", tool: "Instagram", log: "“Aos sábados abrimos das 9h às 14h.”" },
      { label: "Métrica registrada", tool: "Dashboard", log: "Pergunta contabilizada em ‘horários’" },
    ],
    result: "Dúvidas frequentes respondidas na hora, com base nos documentos do negócio.",
  },
];

export default function AutomationSimulator() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0]!.id);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const done = step >= scenario.nodes.length;

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const runFlow = () => {
    if (timer.current) clearInterval(timer.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStep(scenario.nodes.length);
      return;
    }
    setRunning(true);
    setStep(0);
    let s = 0;
    timer.current = window.setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= scenario.nodes.length) {
        if (timer.current) clearInterval(timer.current);
        setRunning(false);
      }
    }, 950);
  };

  const pick = (id: string) => {
    if (timer.current) clearInterval(timer.current);
    setRunning(false);
    setStep(-1);
    setScenarioId(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Cenários de automação" className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === scenarioId}
              onClick={() => pick(s.id)}
              className={cn("chip transition-colors", s.id === scenarioId ? "!border-signal/70 !bg-signal/10 !text-signal" : "hover:text-bone")}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="demo-badge">Simulação · nenhum sistema real é acionado</span>
      </div>

      <div className="rounded-2xl border border-line bg-ink/50 p-5">
        <p className="kicker mb-2">Entrada</p>
        <p className="font-display text-lg">“{scenario.message}”</p>
      </div>

      {/* Fluxo */}
      <ol className="grid gap-3 md:grid-cols-5 md:gap-0" aria-label="Etapas do fluxo">
        {scenario.nodes.map((n, i) => {
          const state = step > i ? "done" : step === i ? "active" : "idle";
          return (
            <li key={n.label} className="relative md:px-1.5">
              <div
                className={cn(
                  "relative h-full rounded-2xl border p-4 transition-all duration-500",
                  state === "active" && "border-signal bg-signal/10 shadow-[0_0_40px_-8px_rgb(117_230_107/0.6)]",
                  state === "done" && "border-signal/40 bg-signal/[0.04]",
                  state === "idle" && "border-line bg-ink/40",
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={cn("grid size-7 place-items-center rounded-full border font-mono text-[0.62rem]", state === "idle" ? "border-line text-steel" : "border-signal text-signal")}>
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  {state === "active" && <span className="size-2 rounded-full bg-signal animate-pulse-dot" aria-hidden />}
                </div>
                <p className={cn("font-medium leading-tight transition-colors", state === "idle" ? "text-bone/50" : "text-bone")}>{n.label}</p>
                <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-steel">{n.tool}</p>
              </div>
              {i < scenario.nodes.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute z-10 bg-signal transition-all duration-700",
                    "left-7 top-full h-3 w-px md:left-auto md:right-[-0.375rem] md:top-1/2 md:h-px md:w-3",
                    step > i ? "opacity-100" : "opacity-15",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Log */}
      <div className="rounded-2xl border border-line bg-[#070a0c] p-4 font-mono text-xs" aria-live="polite">
        <div className="mb-3 flex items-center justify-between text-steel">
          <span>automation.log</span>
          <span>{running ? "executando…" : done ? "concluído" : "aguardando"}</span>
        </div>
        <ul className="min-h-28 space-y-1.5">
          {step < 0 && <li className="text-steel">Clique em “Executar automação” para iniciar a simulação.</li>}
          {scenario.nodes.slice(0, Math.max(0, Math.min(step + 1, scenario.nodes.length))).map((n, i) => (
            <li key={n.label} className="flex gap-3" style={{ animation: "msg-in .35s var(--ease-expo)" }}>
              <span className="text-steel">[{String(i + 1).padStart(2, "0")}]</span>
              <span className="text-signal">{n.tool}</span>
              <span className="text-bone/75">{n.log}</span>
            </li>
          ))}
          {done && <li className="pt-2 text-copper">✔ {scenario.result}</li>}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={runFlow} disabled={running} className="btn-primary disabled:opacity-50">
          {running ? "Executando…" : done ? "Executar novamente" : "Executar automação"} ▶
        </button>
        {done && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              emit("contact:prefill", { projectType: "Automação de processos", description: `Quero uma automação parecida com o cenário "${scenario.label}" do simulador.` });
              scrollToSection("contact");
            }}
          >
            Automatizar meu negócio
          </button>
        )}
      </div>
    </div>
  );
}
