/** Monograma RR: anel orbital + núcleo verde. */
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeOpacity="0.25" />
      <path d="M20 1.5a18.5 18.5 0 0 1 18.5 18.5" stroke="#75E66B" strokeLinecap="round" />
      <path
        d="M13 28V12h7.2c3.2 0 5.3 1.9 5.3 4.7 0 2.2-1.3 3.8-3.4 4.4L26.5 28M13 20.6h6.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="38.5" cy="20" r="1.6" fill="#75E66B" />
    </svg>
  );
}
