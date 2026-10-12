"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { budgetRanges, projectTypes } from "@/lib/contact-options";
import type { AiResult, Brief } from "@/lib/ai/schemas";
import { on } from "@/lib/events";
import { cn } from "@/lib/utils";
import SplitHeading from "@/components/ui/SplitHeading";
import Reveal from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";
import { ResultSource } from "@/components/lab/LabParts";

type Status = "idle" | "sending" | "sent" | "unconfigured" | "error";
type Errors = Partial<Record<"name" | "email" | "projectType" | "description" | "consent" | "form", string>>;

function briefToText(b: Brief) {
  return [
    b.title,
    "",
    b.summary,
    "",
    "Objetivos:",
    ...b.objectives.map((o) => `- ${o}`),
    "",
    "Funcionalidades desejadas:",
    ...b.features.map((f) => `- ${f}`),
    "",
    "Pontos a alinhar:",
    ...b.questions.map((q) => `- ${q}`),
  ].join("\n");
}

function validate(f: { name: string; email: string; projectType: string; description: string; consent: boolean }): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Informe um e-mail válido.";
  if (!f.projectType) e.projectType = "Selecione o tipo de projeto.";
  if (f.description.trim().length < 20) e.description = "Conte um pouco mais (mínimo de 20 caracteres).";
  if (!f.consent) e.consent = "É preciso concordar com o uso dos dados para contato.";
  return e;
}

/** CONTACT EXPERIENCE — final cinematográfico + formulário inteligente. */
export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", projectType: "", description: "", budget: "", consent: false, website: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [brief, setBrief] = useState<AiResult<Brief> | null>(null);
  const [briefState, setBriefState] = useState<"idle" | "loading" | "error">("idle");
  const [briefError, setBriefError] = useState("");
  const startedAt = useRef(0);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(
    () =>
      on("contact:prefill", (d) => {
        setForm((f) => ({
          ...f,
          projectType: d.projectType && (projectTypes as readonly string[]).includes(d.projectType) ? d.projectType : f.projectType,
          description: d.description ?? f.description,
        }));
        setStatus("idle");
      }),
    [],
  );

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as keyof Errors]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const assist = async () => {
    if (form.description.trim().length < 8) {
      setBriefError("Escreva pelo menos uma frase sobre o projeto para a IA estruturar.");
      setBriefState("error");
      descRef.current?.focus();
      return;
    }
    setBriefState("loading");
    setBriefError("");
    try {
      const res = await fetch("/api/ai/brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: form.description }) });
      const data = (await res.json()) as AiResult<Brief> & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Não foi possível estruturar agora.");
      setBrief(data);
      setBriefState("idle");
    } catch (e) {
      setBriefError((e as Error).message);
      setBriefState("error");
    }
  };

  const applyBrief = () => {
    if (!brief) return;
    const match = projectTypes.find((t) => brief.data.projectType.toLowerCase().includes(t.split(" ")[0]!.toLowerCase()));
    setForm((f) => ({ ...f, description: briefToText(brief.data).slice(0, 4000), projectType: f.projectType || match || "" }));
    setBrief(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) {
      const first = Object.keys(v)[0];
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          projectType: form.projectType,
          description: form.description,
          budget: form.budget || undefined,
          consent: form.consent,
          website: form.website,
          startedAt: startedAt.current,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reason?: string; error?: string; fieldErrors?: Errors };
      if (res.ok && data.ok) {
        setStatus("sent");
        return;
      }
      if (data.reason === "unconfigured") {
        // sem banco configurado: abre o e-mail do visitante com o pedido pronto
        setStatus("unconfigured");
        if (mailtoHref) window.location.href = mailtoHref;
        return;
      }
      if (data.fieldErrors) setErrors(data.fieldErrors);
      setErrors((er) => ({ ...er, form: data.error ?? "Não foi possível enviar agora." }));
      setStatus("error");
    } catch {
      setErrors((er) => ({ ...er, form: "Falha de conexão. Tente novamente." }));
      setStatus("error");
    }
  };

  const channels = [
    site.whatsapp && { label: "WhatsApp", href: site.whatsapp.url, detail: "Resposta direta", external: true },
    { label: "Instagram", href: site.instagram.url, detail: site.instagram.handle, external: true },
    site.email && { label: "E-mail", href: site.email.url, detail: site.email.address, external: false },
  ].filter(Boolean) as Array<{ label: string; href: string; detail: string; external: boolean }>;

  const messageText = [
    `Olá, Raul! Sou ${form.name || "[seu nome]"} (${form.email || "[seu e-mail]"}).`,
    `Tipo de projeto: ${form.projectType || "-"}`,
    ...(form.budget ? [`Orçamento estimado: ${form.budget}`] : []),
    "",
    form.description,
  ].join("\n");
  const mailtoHref = site.email
    ? `${site.email.url}?subject=${encodeURIComponent(`Projeto via site — ${form.projectType || "contato"}`)}&body=${encodeURIComponent(messageText)}`
    : null;
  const [copied, setCopied] = useState(false);

  return (
    <section id="contact" aria-label="Contato" className="relative overflow-hidden pb-16 pt-28 md:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgb(117_230_107/0.1),transparent_70%)]" aria-hidden />
      <div className="container-x relative">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal className="mb-6 flex items-center justify-center gap-3">
            <span className="font-mono text-xs text-signal">[12]</span>
            <span className="kicker">Contact</span>
          </Reveal>
          <SplitHeading
            as="h2"
            className="font-display text-[clamp(2.6rem,8vw,7.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.05em]"
            lines={[{ text: "Let's build" }, { text: "something" }, { text: "intelligent.", className: "text-gradient-signal" }]}
          />
          <Reveal as="p" className="mx-auto mt-8 max-w-xl text-lg text-bone/65">
            Sua próxima grande ideia pode começar com uma conversa.
          </Reveal>
          <Reveal stagger={0.08} className="mt-10 flex flex-wrap justify-center gap-3">
            {channels.map((c) => (
              <Magnetic key={c.label}>
                <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="btn-ghost !min-h-14 !px-6">
                  <span className="font-semibold">{c.label}</span>
                  <span className="text-xs text-bone/50">{c.detail}</span>
                </a>
              </Magnetic>
            ))}
          </Reveal>
        </div>

        <Reveal className="glass-strong mx-auto mt-16 max-w-4xl rounded-[1.75rem] p-6 md:p-10">
          {status === "sent" ? (
            <div className="py-10 text-center" role="status">
              <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-signal text-2xl text-ink">✓</div>
              <h3 className="font-display text-3xl font-semibold">Mensagem enviada.</h3>
              <p className="mx-auto mt-3 max-w-md text-bone/65">Obrigado, {form.name.split(" ")[0]}! Raul vai ler seu pedido e responder pelo e-mail informado.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-2xl font-semibold tracking-tight">Conte sobre seu projeto</h3>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel">* obrigatório</span>
              </div>

              <div>
                <label htmlFor="cf-name" className="mb-2 block text-sm text-bone/75">
                  Nome *
                </label>
                <input id="cf-name" className="field" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={120} aria-invalid={!!errors.name} aria-describedby={errors.name ? "cf-name-err" : undefined} />
                {errors.name && <p id="cf-name-err" className="mt-1.5 text-xs text-danger">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="cf-email" className="mb-2 block text-sm text-bone/75">
                  E-mail *
                </label>
                <input id="cf-email" type="email" className="field" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={200} aria-invalid={!!errors.email} aria-describedby={errors.email ? "cf-email-err" : undefined} />
                {errors.email && <p id="cf-email-err" className="mt-1.5 text-xs text-danger">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="cf-projectType" className="mb-2 block text-sm text-bone/75">
                  Tipo de projeto *
                </label>
                <select id="cf-projectType" className="field appearance-none" value={form.projectType} onChange={(e) => set("projectType", e.target.value)} aria-invalid={!!errors.projectType} aria-describedby={errors.projectType ? "cf-type-err" : undefined}>
                  <option value="">Selecione…</option>
                  {projectTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.projectType && <p id="cf-type-err" className="mt-1.5 text-xs text-danger">{errors.projectType}</p>}
              </div>
              <div>
                <label htmlFor="cf-budget" className="mb-2 block text-sm text-bone/75">
                  Orçamento estimado <span className="text-steel">(opcional)</span>
                </label>
                <select id="cf-budget" className="field appearance-none" value={form.budget} onChange={(e) => set("budget", e.target.value)}>
                  <option value="">Prefiro não informar</option>
                  {budgetRanges.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="cf-description" className="text-sm text-bone/75">
                    Descrição *
                  </label>
                  <button type="button" onClick={assist} disabled={briefState === "loading"} className="inline-flex items-center gap-2 rounded-full border border-signal/40 bg-signal/5 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-signal transition-colors hover:bg-signal/15 disabled:opacity-50">
                    <span aria-hidden>✦</span> {briefState === "loading" ? "Estruturando…" : "Estruturar com IA"}
                  </button>
                </div>
                <textarea
                  id="cf-description"
                  ref={descRef}
                  className="field min-h-40 resize-y leading-relaxed"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  maxLength={4000}
                  placeholder="Qual problema você quer resolver? Quem vai usar? Tem prazo ou referência?"
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "cf-desc-err" : "cf-desc-help"}
                />
                {errors.description ? (
                  <p id="cf-desc-err" className="mt-1.5 text-xs text-danger">{errors.description}</p>
                ) : (
                  <p id="cf-desc-help" className="mt-1.5 text-xs text-steel">Dica: escreva livremente e use “Estruturar com IA” para organizar seu pedido.</p>
                )}
                {briefState === "error" && <p className="mt-2 text-xs text-danger" role="alert">{briefError}</p>}

                {brief && (
                  <div className="mt-4 rounded-2xl border border-signal/30 bg-signal/[0.04] p-5" style={{ animation: "msg-in .5s var(--ease-expo)" }}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-lg font-semibold">{brief.data.title}</p>
                      <ResultSource mode={brief.mode} notice={brief.notice} />
                    </div>
                    <p className="text-sm text-bone/70">{brief.data.summary}</p>
                    <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                      {(
                        [
                          ["Objetivos", brief.data.objectives],
                          ["Funcionalidades", brief.data.features],
                          ["A alinhar", brief.data.questions],
                        ] as const
                      ).map(([title, items]) => (
                        <div key={title}>
                          <p className="kicker mb-2">{title}</p>
                          <ul className="space-y-1 text-bone/70">
                            {items.map((it) => (
                              <li key={it}>· {it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex gap-2">
                      <button type="button" onClick={applyBrief} className="btn-primary !min-h-10 !text-sm">
                        Usar no formulário
                      </button>
                      <button type="button" onClick={() => setBrief(null)} className="btn-ghost !min-h-10 !text-sm">
                        Descartar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* honeypot anti-spam (invisível para pessoas) */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                <label htmlFor="cf-website">Website</label>
                <input id="cf-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-bone/70">
                  <input
                    id="cf-consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-[#75E66B]"
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? "cf-consent-err" : undefined}
                  />
                  <span>
                    Concordo com o uso dos meus dados para retorno sobre este contato, conforme a{" "}
                    <Link href="/privacidade" className="text-signal underline-offset-2 hover:underline">
                      política de privacidade
                    </Link>
                    .
                  </span>
                </label>
                {errors.consent && <p id="cf-consent-err" className="mt-1.5 text-xs text-danger">{errors.consent}</p>}
              </div>

              {status === "unconfigured" && (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-copper/50 bg-copper/5 p-5 text-sm" role="alert">
                  <p className="font-medium text-copper">Falta só um clique: enviar o e-mail.</p>
                  <p className="mt-1 text-bone/70">
                    Abrimos o seu aplicativo de e-mail com o pedido já escrito{site.email ? <> para <strong className="text-bone">{site.email.address}</strong></> : null}. A mensagem só chega quando você clicar em enviar lá.
                    Não abriu? Use uma das opções abaixo.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mailtoHref && (
                      <a href={mailtoHref} className="btn-primary !min-h-10 !text-sm">
                        Abrir e-mail novamente
                      </a>
                    )}
                    <button
                      type="button"
                      className="btn-ghost !min-h-10 !text-sm"
                      onClick={() =>
                        navigator.clipboard
                          ?.writeText(messageText)
                          .then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1800);
                          })
                          .catch(() => {})
                      }
                    >
                      {copied ? "Copiado ✓" : "Copiar mensagem"}
                    </button>
                    {channels
                      .filter((c) => c.label !== "E-mail")
                      .map((c) => (
                        <a key={c.label} href={c.label === "WhatsApp" ? `${c.href.split("?")[0]}?text=${encodeURIComponent(messageText)}` : c.href} target="_blank" rel="noopener noreferrer" className="btn-ghost !min-h-10 !text-sm">
                          {c.label}
                        </a>
                      ))}
                  </div>
                </div>
              )}
              {status === "error" && errors.form && (
                <p className="md:col-span-2 rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-bone/80" role="alert">
                  {errors.form}
                </p>
              )}

              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-steel">Sem spam. Seus dados são usados apenas para responder este contato.</p>
                <button type="submit" disabled={status === "sending"} className={cn("btn-primary !min-h-14 !px-8", status === "sending" && "opacity-60")}>
                  {status === "sending" ? "Enviando…" : "Enviar projeto"} →
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
