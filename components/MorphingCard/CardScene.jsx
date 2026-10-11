// The 3D scene: a card that tilts back into a board once the code becomes a
// system, plus the text pieces, system blocks, edges and request particles.
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import MorphPiece, { PLANE, createTextMaterial, currentStage, easeFactor } from "./MorphPiece";
import { buildLayout, CARD, FACE_Z } from "./layout";

const PURPLE = new THREE.Color("#8b5cf6");
const CYAN = new THREE.Color("#22d3ee");

// Card orientation per stage [x, y] in radians: upright while it's text,
// tilted back into a board once it's a running system.
const TILT = [
  [0.05, -0.2],
  [0.05, 0.18],
  [-0.58, -0.1],
  [-0.58, 0.1],
];

// Area kept in view: tight while the card is read upright, wider once it
// tilts into a board (its near edge grows with perspective). Capped so the
// card doesn't get huge on large screens.
const FIT_UPRIGHT = { width: 4.9, height: 3.9 };
const FIT_BOARD = { width: 5.8, height: 4.3 };
const MAX_PX_PER_UNIT = 150;

const PARTICLE_COUNT = 18;

function fitDistance(fit, camera, size) {
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  return Math.max(
    fit.height / 2 / tan,
    fit.width / 2 / (tan * (size.width / size.height)),
    size.height / (2 * tan * MAX_PX_PER_UNIT)
  );
}

// Pulls the camera back as the card tilts into a board, and in again after
function CameraRig({ stage, reduced }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const placed = useRef(false);

  useFrame((_, delta) => {
    const target = fitDistance(stage >= 2 ? FIT_BOARD : FIT_UPRIGHT, camera, size);
    const z = placed.current && !reduced
      ? camera.position.z + (target - camera.position.z) * easeFactor(2, delta, false)
      : target;
    placed.current = true;
    camera.position.set(0, 0, z);
  });

  return null;
}

// Tilts the card per stage, floats it gently and leans towards the pointer
function CardRig({ stage, reduced, children }) {
  const ref = useRef();

  useFrame(({ clock, pointer }, delta) => {
    const group = ref.current;
    const [tiltX, tiltY] = TILT[stage];
    const ease = easeFactor(2.5, delta, reduced);
    const leanX = reduced ? 0 : pointer.y * 0.08;
    const leanY = reduced ? 0 : pointer.x * 0.12;
    group.rotation.x += (tiltX - leanX - group.rotation.x) * ease;
    group.rotation.y += (tiltY + leanY - group.rotation.y) * ease;
    group.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.7) * 0.05;
  });

  return <group ref={ref}>{children}</group>;
}

function roundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

// The card itself: a thin rounded slab with a purple-to-cyan rim
function CardBase() {
  const { geometry, rim, rimColors } = useMemo(() => {
    const shape = roundedRectShape(CARD.width, CARD.height, CARD.radius);
    const slab = new THREE.ExtrudeGeometry(shape, {
      depth: CARD.depth,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
      curveSegments: 10,
    });
    slab.translate(0, 0, -CARD.depth / 2);
    const outline = shape.getPoints(10);
    const points = [...outline, outline[0]].map((p) => [p.x, p.y, FACE_Z + 0.002]);
    const colors = points.map(([x]) => PURPLE.clone().lerp(CYAN, (x + CARD.width / 2) / CARD.width));
    return { geometry: slab, rim: points, rimColors: colors };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#0b1120" roughness={0.55} metalness={0.2} />
      </mesh>
      <Line points={rim} vertexColors={rimColors} lineWidth={1.4} transparent opacity={0.8} />
    </group>
  );
}

// A service in the architecture: grows out of a code line into a 3D block
function NodeBlock({ block, timeline, initialStage, reduced }) {
  const groupRef = useRef();
  const boxRef = useRef();
  const labelRef = useRef();
  const labelMaterial = useMemo(() => createTextMaterial(block.label), [block]);
  const [labelWidth, labelHeight] = block.label.userData.size;
  const [start] = useState(() => block.states[initialStage]);
  const state = useRef({ x: start.x, y: start.y, scale: 0.001, opacity: 0 });

  useEffect(() => () => labelMaterial.dispose(), [labelMaterial]);

  useFrame(({ clock }, delta) => {
    const tl = timeline.current;
    const s = state.current;
    const target = block.states[currentStage(tl, clock.elapsedTime, block.delay, reduced)];
    const visible = target.visible && !tl.exiting;
    const move = easeFactor(5, delta, reduced);
    s.x += (target.x - s.x) * move;
    s.y += (target.y - s.y) * move;
    s.scale += ((visible ? 1 : 0.001) - s.scale) * move;
    s.opacity += ((visible ? 1 : 0) - s.opacity) * easeFactor(6, delta, reduced);

    const group = groupRef.current;
    group.position.set(s.x, s.y, FACE_Z + (block.depth / 2) * s.scale);
    group.scale.setScalar(Math.max(s.scale, 0.001));
    group.visible = s.opacity > 0.01;
    boxRef.current.material.opacity = s.opacity;
    labelRef.current.material.uniforms.opacity.value = s.opacity;
  });

  return (
    <group ref={groupRef} visible={false}>
      <RoundedBox ref={boxRef} args={[block.width, block.height, block.depth]} radius={0.05} smoothness={3}>
        <meshStandardMaterial
          color={block.entry ? "#3b0764" : "#1e293b"}
          emissive={block.entry ? "#6d28d9" : "#000000"}
          emissiveIntensity={block.entry ? 0.35 : 0}
          roughness={0.45}
          metalness={0.25}
          transparent
        />
      </RoundedBox>
      <mesh
        ref={labelRef}
        geometry={PLANE}
        material={labelMaterial}
        position={[-labelWidth / 2, 0, block.depth / 2 + 0.003]}
        scale={[labelWidth, labelHeight, 1]}
        renderOrder={3}
      />
    </group>
  );
}

function EdgeLine({ edge, timeline, reduced }) {
  const ref = useRef();
  const opacity = useRef(0);
  const points = useMemo(() => edge.points.map(([x, y]) => [x, y, FACE_Z + 0.012]), [edge]);

  useFrame(({ clock }, delta) => {
    const tl = timeline.current;
    const visible = edge.stages[currentStage(tl, clock.elapsedTime, 0.35, reduced)] && !tl.exiting;
    opacity.current += ((visible ? 0.6 : 0) - opacity.current) * easeFactor(5, delta, reduced);
    ref.current.material.opacity = opacity.current;
    ref.current.visible = opacity.current > 0.01;
  });

  return <Line ref={ref} points={points} vertexColors={[PURPLE, CYAN]} lineWidth={1.6} transparent opacity={0} />;
}

function pointAt(route, fraction, out) {
  const distance = fraction * route.total;
  let i = 1;
  while (i < route.lengths.length - 1 && route.lengths[i] < distance) i++;
  const span = route.lengths[i] - route.lengths[i - 1] || 1;
  return out.lerpVectors(route.points[i - 1], route.points[i], (distance - route.lengths[i - 1]) / span);
}

// Glowing requests travelling through the system (hidden for reduced motion)
function Particles({ routes, timeline, reduced }) {
  const meshRef = useRef();
  const opacity = useRef(0);
  const lastRoutes = useRef([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    const tl = timeline.current;
    const list = routes[tl.stage] || [];
    if (list.length) lastRoutes.current = list;

    const settled = clock.elapsedTime - tl.changedAt > 0.8;
    const active = list.length > 0 && settled && !tl.exiting && !reduced;
    opacity.current += ((active ? 1 : 0) - opacity.current) * easeFactor(4, delta, false);
    mesh.material.opacity = opacity.current;
    mesh.visible = opacity.current > 0.01 && lastRoutes.current.length > 0;
    if (!mesh.visible) return;

    const current = lastRoutes.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const route = current[i % current.length];
      const speed = 0.32 + (i % 4) * 0.06;
      const fraction = (clock.elapsedTime * speed + i * 0.161) % 1;
      pointAt(route, fraction, dummy.position);
      dummy.scale.setScalar(Math.pow(Math.sin(fraction * Math.PI), 0.6));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]} visible={false} renderOrder={5}>
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshBasicMaterial
        color="#67e8f9"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

// Everything for one project. Re-mounted (via key) when the project changes,
// which also resets its timeline.
function StoryContent({ story, stage, exiting, reduced }) {
  const layout = useMemo(() => buildLayout(story), [story]);
  const clock = useThree((state) => state.clock);
  const timeline = useRef({ stage, prevStage: stage, changedAt: -Infinity, exiting });

  useEffect(() => () => layout.dispose(), [layout]);

  useEffect(() => {
    const tl = timeline.current;
    timeline.current =
      tl.stage === stage
        ? { ...tl, exiting }
        : { stage, prevStage: tl.stage, changedAt: clock.elapsedTime, exiting };
  }, [stage, exiting, clock]);

  return (
    <>
      {layout.pieces.map((piece) => (
        <MorphPiece key={piece.id} piece={piece} timeline={timeline} initialStage={stage} reduced={reduced} />
      ))}
      {layout.blocks.map((block) => (
        <NodeBlock key={block.id} block={block} timeline={timeline} initialStage={stage} reduced={reduced} />
      ))}
      {layout.edges.map((edge) => (
        <EdgeLine key={edge.id} edge={edge} timeline={timeline} reduced={reduced} />
      ))}
      <Particles routes={layout.routes} timeline={timeline} reduced={reduced} />
    </>
  );
}

export default function CardScene({ story, stage, exiting, reduced }) {
  return (
    <>
      <CameraRig stage={stage} reduced={reduced} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 5]} intensity={1.2} />
      <CardRig stage={stage} reduced={reduced}>
        <CardBase />
        <StoryContent key={story.id} story={story} stage={stage} exiting={exiting} reduced={reduced} />
      </CardRig>
    </>
  );
}
