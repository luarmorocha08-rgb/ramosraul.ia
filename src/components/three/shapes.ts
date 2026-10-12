/**
 * Geradores de formas para o sistema de partículas.
 * Cada função preenche um Float32Array (x, y, z) com `count` pontos.
 * Pseudoaleatório determinístico para manter a cena estável entre renders.
 */

export type ShapeName = "core" | "neural" | "terrain" | "helix" | "orbit";
export const SHAPES: ShapeName[] = ["core", "neural", "terrain", "helix", "orbit"];
export const SHAPE_LABELS: Record<ShapeName, string> = {
  core: "Core",
  neural: "Neural",
  terrain: "Terrain",
  helix: "Helix",
  orbit: "Orbit",
};

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  const u = Math.max(rand(), 1e-6);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Esfera de Fibonacci — distribuição uniforme e "pontilhada" como um holograma. */
function core(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const shell = Math.floor(count * 0.86);
  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < shell) {
      const yy = 1 - (i / (shell - 1)) * 2;
      const r = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      const R = 1.55 + (rand() - 0.5) * 0.015;
      x = Math.cos(th) * r * R;
      y = yy * R;
      z = Math.sin(th) * r * R;
    } else {
      // núcleo interno difuso
      const R = Math.pow(rand(), 0.6) * 0.95;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      x = R * Math.sin(ph) * Math.cos(th);
      y = R * Math.cos(ph);
      z = R * Math.sin(ph) * Math.sin(th);
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** Rede neural: clusters (neurônios) conectados por filamentos (sinapses). */
function neural(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const nodes: Array<[number, number, number]> = [];
  for (let i = 0; i < 46; i++) {
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const R = 0.4 + Math.pow(rand(), 0.7) * 1.55;
    nodes.push([R * Math.sin(ph) * Math.cos(th) * 1.25, R * Math.cos(ph) * 0.95, R * Math.sin(ph) * Math.sin(th)]);
  }
  const edges: Array<[number, number]> = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3);
    near.forEach((n) => edges.push([i, n.j]));
  });
  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (rand() < 0.42) {
      const n = nodes[Math.floor(rand() * nodes.length)]!;
      const s = 0.07 + rand() * 0.05;
      x = n[0] + gauss(rand) * s;
      y = n[1] + gauss(rand) * s;
      z = n[2] + gauss(rand) * s;
    } else {
      const e = edges[Math.floor(rand() * edges.length)]!;
      const a = nodes[e[0]]!;
      const b = nodes[e[1]]!;
      const t = rand();
      const j = 0.012;
      x = a[0] + (b[0] - a[0]) * t + gauss(rand) * j;
      y = a[1] + (b[1] - a[1]) * t + gauss(rand) * j;
      z = a[2] + (b[2] - a[2]) * t + gauss(rand) * j;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** Terreno holográfico: grade de pontos com picos (inspirado em paisagens de dados). */
function terrain(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const side = Math.ceil(Math.sqrt(count));
  const peaks = [
    { x: -0.2, z: -0.3, h: 1.45, s: 0.55 },
    { x: 0.9, z: 0.2, h: 0.75, s: 0.45 },
    { x: -1.1, z: 0.4, h: 0.55, s: 0.5 },
  ];
  for (let i = 0; i < count; i++) {
    const gx = i % side;
    const gz = Math.floor(i / side);
    const x = (gx / (side - 1) - 0.5) * 4.6 + (rand() - 0.5) * 0.01;
    const z = (gz / (side - 1) - 0.5) * 3.4 + (rand() - 0.5) * 0.01;
    let y = Math.sin(x * 1.6) * 0.08 + Math.cos(z * 2.1) * 0.06;
    for (const p of peaks) y += p.h * Math.exp(-((x - p.x) ** 2 + (z - p.z) ** 2) / (2 * p.s * p.s));
    out[i * 3] = x;
    out[i * 3 + 1] = y - 0.7;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** Dupla hélice (DNA) com degraus. */
function helix(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const turns = 2.6;
  const height = 3.8;
  for (let i = 0; i < count; i++) {
    const r = rand();
    const t = rand();
    const ang = t * turns * Math.PI * 2;
    const y = (t - 0.5) * height;
    let x: number, z: number;
    if (r < 0.72) {
      const strand = r < 0.36 ? 0 : Math.PI;
      const R = 0.78 + gauss(rand) * 0.035;
      x = Math.cos(ang + strand) * R;
      z = Math.sin(ang + strand) * R;
      x += gauss(rand) * 0.03;
      z += gauss(rand) * 0.03;
    } else {
      // degraus a cada passo discreto
      const step = Math.round(t * 34) / 34;
      const a2 = step * turns * Math.PI * 2;
      const k = rand() * 2 - 1;
      x = Math.cos(a2) * 0.78 * k;
      z = Math.sin(a2) * 0.78 * k;
      out[i * 3 + 1] = (step - 0.5) * height;
      out[i * 3] = x;
      out[i * 3 + 2] = z;
      continue;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  // inclina levemente a hélice
  const c = Math.cos(0.35);
  const s = Math.sin(0.35);
  for (let i = 0; i < count; i++) {
    const x = out[i * 3]!;
    const y = out[i * 3 + 1]!;
    out[i * 3] = x * c - y * s;
    out[i * 3 + 1] = x * s + y * c;
  }
  return out;
}

/** Órbitas: anéis inclinados ao redor de um núcleo — como um sistema de dados. */
function orbit(count: number, rand: () => number) {
  const out = new Float32Array(count * 3);
  const rings = [
    { R: 1.9, tilt: 0.35, w: 0.06 },
    { R: 1.45, tilt: -0.55, w: 0.04 },
    { R: 2.3, tilt: 1.1, w: 0.03 },
  ];
  for (let i = 0; i < count; i++) {
    const r = rand();
    if (r < 0.22) {
      const R = Math.pow(rand(), 0.4) * 0.55;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      out[i * 3] = R * Math.sin(ph) * Math.cos(th);
      out[i * 3 + 1] = R * Math.cos(ph);
      out[i * 3 + 2] = R * Math.sin(ph) * Math.sin(th);
      continue;
    }
    const ring = rings[Math.floor(rand() * rings.length)]!;
    const a = rand() * Math.PI * 2;
    const R = ring.R + gauss(rand) * ring.w;
    const x = Math.cos(a) * R;
    const z = Math.sin(a) * R;
    const y = gauss(rand) * ring.w * 0.6;
    const c = Math.cos(ring.tilt);
    const s = Math.sin(ring.tilt);
    out[i * 3] = x;
    out[i * 3 + 1] = y * c - z * s;
    out[i * 3 + 2] = y * s + z * c;
  }
  return out;
}

const GENERATORS: Record<ShapeName, (count: number, rand: () => number) => Float32Array> = {
  core,
  neural,
  terrain,
  helix,
  orbit,
};

export function buildShapes(count: number) {
  return SHAPES.map((name, i) => GENERATORS[name](count, mulberry32(1337 + i * 101)));
}
