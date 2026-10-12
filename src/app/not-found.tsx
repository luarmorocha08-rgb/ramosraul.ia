import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-[100svh] place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Erro 404 · rota não encontrada</p>
        <h1 className="mt-6 font-display text-[clamp(3rem,12vw,9rem)] font-bold leading-none tracking-[-0.05em]">
          Lost in <span className="text-gradient-signal">space.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-bone/60">Essa página não existe — mas boas ideias sempre encontram um caminho.</p>
        <Link href="/" className="btn-primary mt-10">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
