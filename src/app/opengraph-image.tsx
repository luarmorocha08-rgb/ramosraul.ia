import { ImageResponse } from "next/og";

export const alt = "Raul Ramos — AI Developer & Creative Technologist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem Open Graph gerada no build: esfera pontilhada + assinatura. */
export default function OgImage() {
  const dots: Array<{ x: number; y: number; r: number; o: number; g: boolean }> = [];
  const N = 520;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const x = Math.cos(golden * i) * rad;
    const z = Math.sin(golden * i) * rad;
    if (z < -0.1) continue;
    dots.push({ x: 880 + x * 230, y: 315 + y * 230, r: 1.2 + z * 2.2, o: 0.25 + z * 0.75, g: i % 11 === 0 });
  }
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0B0F12", color: "#F1EEE8", position: "relative", fontFamily: "sans-serif" }}>
        {dots.map((d, i) => (
          <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: d.r * 2, height: d.r * 2, borderRadius: 999, background: d.g ? "#75E66B" : "#F1EEE8", opacity: d.o }} />
        ))}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 720 }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#9aa29d" }}>AI DEVELOPER & CREATIVE TECHNOLOGIST</div>
          <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -4, marginTop: 24, lineHeight: 0.95 }}>RAUL RAMOS</div>
          <div style={{ fontSize: 44, fontWeight: 700, color: "#75E66B", marginTop: 24, lineHeight: 1.05 }}>I build intelligence.</div>
          <div style={{ fontSize: 24, color: "#9aa29d", marginTop: 28 }}>Pequenas ideias. Grandes resultados. · @ramosraul.ia</div>
        </div>
      </div>
    ),
    size,
  );
}
