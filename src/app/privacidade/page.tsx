import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como os dados enviados pelo site de Raul Ramos são tratados.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
  return (
    <main id="main" className="container-x max-w-3xl py-24">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.18em] text-signal hover:underline">
        ← Voltar ao site
      </Link>
      <h1 className="mt-8 font-display text-5xl font-semibold tracking-tight">Política de Privacidade</h1>
      <div className="mt-10 space-y-8 leading-relaxed text-bone/75">
        <section>
          <h2 className="mb-3 font-display text-2xl text-bone">Dados coletados</h2>
          <p>
            Pelo formulário de contato, coletamos nome, e-mail, tipo de projeto, descrição e — opcionalmente — faixa de orçamento. Esses dados são usados exclusivamente para
            responder ao seu contato e não são vendidos nem compartilhados para fins de marketing.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl text-bone">Ferramentas de IA</h2>
          <p>
            Textos digitados nas ferramentas do AI Lab e no assistente são enviados a um provedor de inteligência artificial apenas para gerar a resposta solicitada. Não
            digite dados pessoais sensíveis nessas ferramentas. O histórico do chat fica salvo somente no seu navegador durante a sessão.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl text-bone">Cookies e armazenamento local</h2>
          <p>
            Usamos um cookie técnico de sessão para aplicar limites de uso das ferramentas de IA (proteção contra abuso) e o armazenamento local do navegador para lembrar se
            você já viu a introdução animada. Não usamos cookies de publicidade.
          </p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl text-bone">Seus direitos (LGPD)</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo{" "}
            <a href={site.instagram.url} className="text-signal hover:underline" target="_blank" rel="noopener noreferrer">
              Instagram {site.instagram.handle}
            </a>
            {site.email && (
              <>
                {" "}
                ou pelo e-mail{" "}
                <a href={site.email.url} className="text-signal hover:underline">
                  {site.email.address}
                </a>
              </>
            )}
            .
          </p>
        </section>
      </div>
    </main>
  );
}
