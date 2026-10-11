// A flat text/graphic piece on the card that eases between per-stage states.
// When its texture changes between stages it dissolves from the old texture
// into the new one in blocky "pixels" with a cyan edge (the morph effect).
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FACE_Z } from "./layout";

const DISSOLVE_SECONDS = 0.65;
const MOVE_RATE = 6;
const FADE_RATE = 7;

// Unit plane anchored at its left edge, so a piece's x is where its text starts
export const PLANE = new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0);

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Both textures are drawn from the plane's left edge and centred vertically at
// their own size, so swapping between differently sized textures never stretches.
const fragmentShader = /* glsl */ `
  uniform sampler2D mapA;
  uniform sampler2D mapB;
  uniform vec2 sizeA;
  uniform vec2 sizeB;
  uniform vec2 planeSize;
  uniform float mixT;
  uniform float opacity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  vec4 sampleAt(sampler2D map, vec2 size) {
    vec2 p = vec2(vUv.x * planeSize.x, (vUv.y - 0.5) * planeSize.y);
    vec2 uv = vec2(p.x / size.x, p.y / size.y + 0.5);
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
    return texture2D(map, uv);
  }

  void main() {
    vec4 a = sampleAt(mapA, sizeA);
    vec4 b = sampleAt(mapB, sizeB);

    // ~30 dissolve cells per world unit
    float n = hash(floor(vUv * planeSize * 30.0));
    float d = n - mixT;
    vec4 color = d < 0.0 ? b : a;

    float dissolving = step(0.0001, mixT) * (1.0 - step(0.9999, mixT));
    float glow = (1.0 - smoothstep(0.0, 0.07, abs(d))) * dissolving;
    float cover = max(a.a, b.a);
    color.rgb = mix(color.rgb, vec3(0.4, 0.9, 1.0), glow * cover);
    color.a = max(color.a, glow * cover);

    gl_FragColor = vec4(color.rgb, color.a * opacity);
  }
`;

export function createTextMaterial(texture) {
  const [w, h] = texture.userData.size;
  return new THREE.ShaderMaterial({
    uniforms: {
      mapA: { value: texture },
      mapB: { value: texture },
      sizeA: { value: new THREE.Vector2(w, h) },
      sizeB: { value: new THREE.Vector2(w, h) },
      planeSize: { value: new THREE.Vector2(w, h) },
      mixT: { value: 0 },
      opacity: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });
}

// Which stage a piece should be in right now, honouring its stagger delay
export function currentStage(timeline, clockTime, delay, reduced) {
  if (reduced || clockTime - timeline.changedAt >= delay) return timeline.stage;
  return timeline.prevStage;
}

export const easeFactor = (rate, delta, reduced) => (reduced ? 1 : 1 - Math.exp(-rate * delta));

export default function MorphPiece({ piece, timeline, reduced }) {
  const meshRef = useRef();
  const startState = piece.states[timeline.current.stage];
  // Created once per piece; later texture changes go through the uniforms
  const material = useMemo(() => createTextMaterial(startState.tex), [piece]);
  const state = useRef({
    applied: timeline.current.stage,
    shown: startState.tex,
    x: startState.x,
    y: startState.y,
    opacity: 0,
    mix: 0,
    mixing: false,
  });

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    const tl = timeline.current;
    const s = state.current;
    const u = material.uniforms;
    const stage = currentStage(tl, clock.elapsedTime, piece.delay, reduced);
    const target = piece.states[stage];

    if (stage !== s.applied) {
      if (target.visible && target.tex !== s.shown) {
        if (s.opacity > 0.05 && !reduced) {
          // Visible on both sides: dissolve old -> new
          u.mapA.value = s.shown;
          u.mapB.value = target.tex;
          s.mix = 0;
          s.mixing = true;
        } else {
          // Appearing from hidden: just swap
          u.mapA.value = target.tex;
          u.mapB.value = target.tex;
          s.mixing = false;
        }
        s.shown = target.tex;
      }
      s.applied = stage;
    }

    const visible = target.visible && !tl.exiting;
    const move = easeFactor(MOVE_RATE, delta, reduced);
    s.x += (target.x - s.x) * move;
    s.y += (target.y - s.y) * move;
    s.opacity += ((visible ? 1 : 0) - s.opacity) * easeFactor(FADE_RATE, delta, reduced);

    if (s.mixing) {
      s.mix = Math.min(1, s.mix + delta / DISSOLVE_SECONDS);
      if (s.mix >= 1) {
        u.mapA.value = u.mapB.value;
        s.mixing = false;
        s.mix = 0;
      }
    }

    const [aw, ah] = u.mapA.value.userData.size;
    const [bw, bh] = u.mapB.value.userData.size;
    const pw = Math.max(aw, bw);
    const ph = Math.max(ah, bh);
    u.sizeA.value.set(aw, ah);
    u.sizeB.value.set(bw, bh);
    u.planeSize.value.set(pw, ph);
    u.mixT.value = s.mixing ? s.mix : 0;
    u.opacity.value = s.opacity;

    mesh.scale.set(pw, ph, 1);
    mesh.position.set(s.x, s.y, FACE_Z + 0.004);
    mesh.visible = s.opacity > 0.003;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={PLANE}
      material={material}
      renderOrder={piece.renderOrder ?? 2}
      visible={false}
    />
  );
}
