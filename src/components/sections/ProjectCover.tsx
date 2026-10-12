import type { Project } from "@/content/projects";

const HUES = {
  green: { a: "#75E66B", b: "#19221D" },
  copper: { a: "#C18B65", b: "#21170f" },
  mono: { a: "#F1EEE8", b: "#14191c" },
} as const;

/** Capa gerada por código para projetos sem imagem real. */
export default function ProjectCover({ project, className }: { project: Project; className?: string }) {
  const { a, b } = HUES[project.cover.hue];
  const id = project.id;
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <radialGradient id={`g-${id}`} cx="70%" cy="30%" r="80%">
          <stop offset="0%" stopColor={a} stopOpacity=".35" />
          <stop offset="60%" stopColor={b} stopOpacity="1" />
          <stop offset="100%" stopColor="#0B0F12" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill={`url(#g-${id})`} />
      {project.cover.motif === "orbit" &&
        [90, 150, 210].map((r, i) => (
          <g key={r} transform={`rotate(${-20 + i * 25} 520 230)`}>
            <ellipse cx="520" cy="230" rx={r * 1.6} ry={r * 0.55} fill="none" stroke={a} strokeOpacity={0.5 - i * 0.12} />
            <circle cx={520 + r * 1.6} cy="230" r="5" fill={a} />
          </g>
        ))}
      {project.cover.motif === "orbit" && <circle cx="520" cy="230" r="46" fill={a} fillOpacity=".2" stroke={a} />}
      {project.cover.motif === "grid" &&
        Array.from({ length: 22 * 14 }).map((_, k) => {
          const x = (k % 22) * 38 + 20;
          const y = Math.floor(k / 22) * 38 + 10;
          const d = Math.hypot(x - 560, y - 220);
          return <circle key={k} cx={x} cy={y} r={Math.max(0.6, 5 - d / 70)} fill={a} fillOpacity={Math.max(0.08, 1 - d / 420)} />;
        })}
      {project.cover.motif === "wave" &&
        Array.from({ length: 16 }).map((_, i) => (
          <path
            key={i}
            d={`M0 ${200 + i * 16} C200 ${120 + i * 18}, 420 ${330 + i * 6}, 800 ${160 + i * 18}`}
            fill="none"
            stroke={a}
            strokeOpacity={0.08 + i * 0.04}
          />
        ))}
      {project.cover.motif === "nodes" &&
        (() => {
          const pts = [
            [140, 120], [300, 210], [470, 110], [620, 260], [420, 360], [220, 380], [680, 120],
          ];
          return (
            <g>
              {pts.map(([x, y], i) =>
                pts.slice(i + 1, i + 3).map(([x2, y2], j) => <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke={a} strokeOpacity=".35" strokeDasharray="6 6" />),
              )}
              {pts.map(([x, y], i) => (
                <g key={i}>
                  <rect x={x! - 34} y={y! - 16} width="68" height="32" rx="9" fill="#0B0F12" stroke={a} strokeOpacity=".7" />
                  <circle cx={x! - 20} cy={y} r="4" fill={a} />
                </g>
              ))}
            </g>
          );
        })()}
      {project.cover.motif === "bars" && (
        <g>
          <rect x="340" y="80" width="400" height="300" rx="16" fill="#0B0F12" fillOpacity=".75" stroke={a} strokeOpacity=".25" />
          {[120, 180, 140, 230, 200, 260, 240].map((h, i) => (
            <rect key={i} x={370 + i * 52} y={350 - h} width="30" height={h} rx="5" fill={a} fillOpacity={0.25 + i * 0.1} />
          ))}
          <polyline points="370,260 422,230 474,250 526,170 578,190 630,120 700,100" fill="none" stroke="#75E66B" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  );
}
