/**
 * Transição entre páginas: uma cortina escura com borda luminosa se recolhe,
 * revelando a nova rota. O conteúdo não é ocultado (não atrasa o LCP);
 * a cortina apenas passa por cima dele.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden className="page-curtain" />
      {children}
    </>
  );
}
