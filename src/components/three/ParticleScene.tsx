"use client";
/* eslint-disable react-hooks/immutability -- uniforms/geometria do three.js são mutados por frame dentro do useFrame (padrão do R3F). */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildShapes, mulberry32 } from "./shapes";
import { onShapeChange, sceneState } from "./sceneStore";

/* ─── Shaders ─────────────────────────────────────────────────────── */

const commonVertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uAspect;

  vec4 applyMouse(vec4 mv, out float force) {
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = ndc - uMouse;
    d.x *= uAspect;
    float dist = length(d);
    force = smoothstep(0.34, 0.0, dist) * uMouseStrength;
    vec2 dir = normalize(d + 1e-5);
    mv.xy += dir * force * 0.38;
    mv.z += force * 0.25;
    return mv;
  }
`;

const pointsVertex = /* glsl */ `
  ${commonVertex}
  uniform float uMix;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uPulse;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aRand;
  varying float vAlpha;
  varying float vTint;
  varying float vGlow;

  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float delay = aRand.x * 0.35;
    float t = easeInOutCubic(clamp((uMix - delay) / 0.65, 0.0, 1.0));
    vec3 p = mix(aFrom, aTo, t);

    // dispersão orgânica no meio da transição
    float mid = sin(t * 3.14159265);
    p += normalize(p + vec3(1e-4)) * mid * (0.18 + aRand.y * 0.55);

    // respiração sutil — a estrutura parece viva
    p += vec3(
      sin(uTime * 0.6 + aRand.x * 23.0),
      cos(uTime * 0.5 + aRand.y * 19.0),
      sin(uTime * 0.7 + aRand.z * 17.0)
    ) * (0.01 + uPulse * 0.08);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float force;
    mv = applyMouse(mv, force);
    gl_Position = projectionMatrix * mv;

    float size = uSize * (0.5 + aRand.z * 0.95);
    gl_PointSize = size * uPixelRatio * (6.0 / -mv.z) * (1.0 + force * 0.8);

    float depth = smoothstep(9.5, 3.8, -mv.z);
    float twinkle = 0.72 + 0.28 * sin(uTime * 1.6 + aRand.x * 41.0);
    vAlpha = (0.28 + 0.72 * depth) * twinkle + force * 0.5;
    vTint = aRand.y;
    vGlow = force;
  }
`;

const pointsFragment = /* glsl */ `
  uniform vec3 uBone;
  uniform vec3 uSignal;
  uniform vec3 uCopper;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vTint;
  varying float vGlow;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.0, r);
    float a = core * core;
    vec3 col = vTint < 0.74 ? uBone : (vTint < 0.95 ? uSignal : uCopper);
    col = mix(col, uSignal, clamp(vGlow * 1.4, 0.0, 1.0));
    gl_FragColor = vec4(col, a * vAlpha * uOpacity);
  }
`;

const linesVertex = /* glsl */ `
  ${commonVertex}
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float force;
    mv = applyMouse(mv, force);
    gl_Position = projectionMatrix * mv;
    // conexões acendem e apagam
    float flick = smoothstep(0.35, 1.0, sin(uTime * (0.35 + aSeed * 0.6) + aSeed * 60.0));
    float depth = smoothstep(9.5, 3.8, -mv.z);
    vAlpha = flick * depth + force * 0.6;
  }
`;

const linesFragment = /* glsl */ `
  uniform vec3 uSignal;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uSignal, vAlpha * 0.32 * uOpacity);
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────── */

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Calcula pares de "sinapses" entre partículas âncora próximas numa forma. */
function buildLinks(shape: Float32Array, anchors: number[], maxDist: number) {
  const pairs: number[] = [];
  const seeds: number[] = [];
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i]!;
    const ax = shape[a * 3]!, ay = shape[a * 3 + 1]!, az = shape[a * 3 + 2]!;
    let linked = 0;
    for (let j = i + 1; j < anchors.length && linked < 2; j++) {
      const b = anchors[j]!;
      const d = Math.hypot(ax - shape[b * 3]!, ay - shape[b * 3 + 1]!, az - shape[b * 3 + 2]!);
      if (d < maxDist) {
        pairs.push(ax, ay, az, shape[b * 3]!, shape[b * 3 + 1]!, shape[b * 3 + 2]!);
        const s = ((i * 9301 + j * 49297) % 233280) / 233280;
        seeds.push(s, s);
        linked++;
      }
    }
  }
  return { positions: new Float32Array(pairs), seeds: new Float32Array(seeds) };
}

/* ─── Cena ────────────────────────────────────────────────────────── */

interface ParticlesProps {
  count: number;
  reducedMotion: boolean;
}

function Particles({ count, reducedMotion }: ParticlesProps) {
  const group = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { size, gl, invalidate } = useThree();

  const shapes = useMemo(() => buildShapes(count), [count]);
  const anchors = useMemo(() => {
    const step = Math.max(1, Math.floor(count / 260));
    return Array.from({ length: Math.floor(count / step) }, (_, i) => i * step);
  }, [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const initial = shapes[sceneState.shape] ?? shapes[0]!;
    const rand = new Float32Array(count * 3);
    const rnd = mulberry32(42);
    for (let i = 0; i < count * 3; i++) rand[i] = rnd();
    g.setAttribute("position", new THREE.BufferAttribute(initial.slice(), 3));
    g.setAttribute("aFrom", new THREE.BufferAttribute(initial.slice(), 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(initial.slice(), 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return g;
  }, [count, shapes]);

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const { positions, seeds } = buildLinks(shapes[sceneState.shape] ?? shapes[0]!, anchors, 0.62);
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return g;
  }, [shapes, anchors]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMix: { value: 1 },
      uSize: { value: count > 9000 ? 2.3 : 2.9 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uPulse: { value: 0 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uMouseStrength: { value: 0 },
      uAspect: { value: 1 },
      uOpacity: { value: 1 },
      uBone: { value: new THREE.Color("#F1EEE8") },
      uSignal: { value: new THREE.Color("#75E66B") },
      uCopper: { value: new THREE.Color("#C18B65") },
    }),
    [count, gl],
  );
  const lineUniforms = useMemo(
    () => ({
      uTime: uniforms.uTime,
      uMouse: uniforms.uMouse,
      uMouseStrength: uniforms.uMouseStrength,
      uAspect: uniforms.uAspect,
      uSignal: uniforms.uSignal,
      uOpacity: { value: 1 },
    }),
    [uniforms],
  );

  const morph = useRef({ active: false, linksOut: false, nextShape: sceneState.shape });

  // Ao trocar de forma: congela posição atual como origem e define o novo destino.
  useEffect(() => {
    return onShapeChange((shape) => {
      const target = shapes[shape];
      if (!target) return;
      const from = geometry.getAttribute("aFrom") as THREE.BufferAttribute;
      const to = geometry.getAttribute("aTo") as THREE.BufferAttribute;
      const rnd = geometry.getAttribute("aRand") as THREE.BufferAttribute;
      const mix = uniforms.uMix.value;
      const fa = from.array as Float32Array;
      const ta = to.array as Float32Array;
      const ra = rnd.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const t = easeInOutCubic(Math.min(1, Math.max(0, (mix - ra[i * 3]! * 0.35) / 0.65)));
        for (let k = 0; k < 3; k++) {
          const idx = i * 3 + k;
          fa[idx] = fa[idx]! + (ta[idx]! - fa[idx]!) * t;
          ta[idx] = target[idx]!;
        }
      }
      from.needsUpdate = true;
      to.needsUpdate = true;
      uniforms.uMix.value = reducedMotion ? 1 : 0;
      morph.current.active = !reducedMotion;
      morph.current.nextShape = shape;

      const { positions, seeds } = buildLinks(target, anchors, shape === 2 ? 0.34 : 0.62);
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      lineGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      lineUniforms.uOpacity.value = 0;
      invalidate();
    });
  }, [anchors, count, geometry, invalidate, lineGeometry, lineUniforms, reducedMotion, shapes, uniforms]);

  useEffect(() => {
    sceneState.requestRender = invalidate;
    return () => {
      sceneState.requestRender = null;
    };
  }, [invalidate]);

  useEffect(() => () => {
    geometry.dispose();
    lineGeometry.dispose();
  }, [geometry, lineGeometry]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += reducedMotion ? 0 : dt;
    uniforms.uAspect.value = size.width / Math.max(1, size.height);

    if (morph.current.active) {
      uniforms.uMix.value = Math.min(1, uniforms.uMix.value + dt / 1.7);
      if (uniforms.uMix.value >= 1) morph.current.active = false;
    }
    const linkTarget = morph.current.active ? 0 : 1;
    lineUniforms.uOpacity.value = reducedMotion
      ? 1
      : lineUniforms.uOpacity.value + (linkTarget - lineUniforms.uOpacity.value) * Math.min(1, dt * (linkTarget ? 1.2 : 8));

    // pulso de clique decai
    sceneState.pulse *= Math.pow(0.04, dt);
    uniforms.uPulse.value = sceneState.pulse;

    // ponteiro
    const p = sceneState.pointer;
    const m = uniforms.uMouse.value;
    m.x += ((p.active ? p.x : 9) - m.x) * (p.active ? 0.25 : 1);
    m.y += ((p.active ? p.y : 9) - m.y) * (p.active ? 0.25 : 1);
    const strength = p.active && !reducedMotion ? 1 : 0;
    uniforms.uMouseStrength.value += (strength - uniforms.uMouseStrength.value) * Math.min(1, dt * 4);

    // posição/escala/opacidade dirigidas pelo scroll
    const tgt = sceneState.target;
    const k = reducedMotion ? 1 : Math.min(1, dt * 2.4);
    const mobile = size.width < 768;
    const tx = mobile ? 0 : tgt.x;
    g.position.x += (tx - g.position.x) * k;
    g.position.y += (tgt.y - g.position.y) * k;
    const s = g.scale.x + ((mobile ? tgt.scale * 0.78 : tgt.scale) - g.scale.x) * k;
    g.scale.setScalar(s);
    uniforms.uOpacity.value += (tgt.opacity - uniforms.uOpacity.value) * k;
    g.visible = uniforms.uOpacity.value > 0.01;

    // rotação: automática + arraste + parallax do mouse
    if (!reducedMotion) sceneState.drag.y += dt * 0.07;
    const rx = sceneState.drag.x + (p.active ? -p.y * 0.18 : 0);
    const ry = sceneState.drag.y + (p.active ? p.x * 0.35 : 0);
    const kr = reducedMotion ? 1 : Math.min(1, dt * 3);
    g.rotation.x += (rx - g.rotation.x) * kr;
    g.rotation.y += (ry - g.rotation.y) * kr;

    if (linesRef.current) linesRef.current.visible = lineUniforms.uOpacity.value > 0.02;
    state.camera.position.z = 6.2;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          vertexShader={pointsVertex}
          fragmentShader={pointsFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry} frustumCulled={false}>
        <shaderMaterial
          vertexShader={linesVertex}
          fragmentShader={linesFragment}
          uniforms={lineUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/** Pausa o loop de render quando a aba não está visível. */
function VisibilityPause() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [setFrameloop]);
  return null;
}

export default function ParticleScene({ count, reducedMotion }: ParticlesProps) {
  return (
    <Canvas
      dpr={[1, count > 9000 ? 1.75 : 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: false }}
      camera={{ position: [0, 0, 6.2], fov: 42, near: 0.1, far: 50 }}
      frameloop={reducedMotion ? "demand" : "always"}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Particles count={count} reducedMotion={reducedMotion} />
      {!reducedMotion && <VisibilityPause />}
    </Canvas>
  );
}
