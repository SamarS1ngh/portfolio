"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { projects } from "@/content/projects";
import { stack } from "@/content/stack";

const TOTAL = 7;
const SCENE_GAP = 14;
const CAM_LEAD = 6;

const SCENE_X: number[] = [0, 4, -4, 3, -3, 5, 0];
const SCENE_Y: number[] = [0, 2, -2, 3, -3, 1.5, 0];
const SCENE_Z = (i: number) => -i * SCENE_GAP;

export function Stack3D({
  progressRef,
  onPinClick,
  activePin,
  idleRef,
}: {
  progressRef: React.MutableRefObject<number>;
  onPinClick: (slug: string) => void;
  activePin: string | null;
  idleRef?: React.MutableRefObject<boolean>;
}) {
  return (
    <Canvas
      camera={{ fov: 55, position: [0, 0, CAM_LEAD], near: 0.1, far: 200 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <FogSetup />
      <ambientLight intensity={0.32} />
      <pointLight position={[5, 4, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-4, -3, 2]} intensity={0.55} color="#7da3ff" />
      <Stage progressRef={progressRef} onPinClick={onPinClick} activePin={activePin} idleRef={idleRef} />
      <EffectComposer>
        <Bloom intensity={0.25} luminanceThreshold={0.85} luminanceSmoothing={0.7} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

function FogSetup() {
  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.Fog("#02050f", CAM_LEAD + 2, CAM_LEAD + SCENE_GAP * 1.4);
    return () => { scene.fog = null; };
  }, [scene]);
  return null;
}

export function localProgress(global: number, idx: number): number {
  const slot = 1 / TOTAL;
  const start = idx * slot;
  const end = (idx + 1) * slot;
  return Math.max(0, Math.min(1, (global - start) / (end - start)));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function Stage({
  progressRef,
  onPinClick,
  activePin,
  idleRef,
}: {
  progressRef: React.MutableRefObject<number>;
  onPinClick: (slug: string) => void;
  activePin: string | null;
  idleRef?: React.MutableRefObject<boolean>;
}) {
  const sceneRefs = useRef<Array<THREE.Group | null>>([]);
  const { camera } = useThree();

  useFrame(() => {
    const p = progressRef.current;
    const idx = Math.min(Math.floor(p * TOTAL), TOTAL - 1);
    const nextIdx = Math.min(idx + 1, TOTAL - 1);
    const localP = (p * TOTAL) % 1;

    // idle drift: when no scroll for 6s+, camera orbits slightly around its target
    const t = performance.now() / 1000;
    const idle = idleRef?.current ? 1 : 0;
    const driftX = Math.sin(t * 0.13) * 0.6 * idle;
    const driftY = Math.cos(t * 0.11) * 0.35 * idle;

    const ax = lerp(SCENE_X[idx], SCENE_X[nextIdx], localP) + driftX;
    const ay = lerp(SCENE_Y[idx], SCENE_Y[nextIdx], localP) + driftY;
    const az = lerp(SCENE_Z(idx) + CAM_LEAD, SCENE_Z(nextIdx) + CAM_LEAD, localP);

    camera.position.x += (ax - camera.position.x) * 0.1;
    camera.position.y += (ay - camera.position.y) * 0.1;
    camera.position.z += (az - camera.position.z) * 0.1;

    // Camera look-ahead: 0.3 of a segment past the camera, computed in continuous global progress
    // so it doesn't snap at idx boundaries (old `localP + 0.3` capped at 1 caused a jump).
    const lookGlobal = p * TOTAL + 0.3;
    const lookIdx = Math.min(Math.max(0, Math.floor(lookGlobal)), TOTAL - 1);
    const lookNextIdx = Math.min(lookIdx + 1, TOTAL - 1);
    const lookLocal = Math.max(0, Math.min(1, lookGlobal - lookIdx));
    const lx = lerp(SCENE_X[lookIdx], SCENE_X[lookNextIdx], lookLocal);
    const ly = lerp(SCENE_Y[lookIdx], SCENE_Y[lookNextIdx], lookLocal);
    const lz = lerp(SCENE_Z(lookIdx), SCENE_Z(lookNextIdx), lookLocal);
    camera.lookAt(lx, ly, lz);

    camera.rotation.z = Math.sin(p * Math.PI * 1.5) * 0.04;

    sceneRefs.current.forEach((g, i) => {
      if (!g) return;
      const dx = SCENE_X[i] - camera.position.x;
      const dy = SCENE_Y[i] - camera.position.y;
      const dz = SCENE_Z(i) - camera.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const visible = dist < SCENE_GAP * 1.6;
      g.visible = visible;
      if (!visible) return;

      const closenessToLead = 1 - Math.min(1, Math.abs(dist - CAM_LEAD) / (SCENE_GAP * 0.85));
      const opacity = Math.max(0, closenessToLead);

      g.traverse((obj: any) => {
        if (obj.material) {
          const apply = (m: any) => {
            m.transparent = true;
            const base = m.userData?.baseOpacity ?? 1;
            m.opacity = base * opacity;
          };
          if (Array.isArray(obj.material)) obj.material.forEach(apply);
          else apply(obj.material);
        }
      });
    });
  });

  const setRef = (i: number) => (el: THREE.Group | null) => {
    sceneRefs.current[i] = el;
  };

  return (
    <>
      <group ref={setRef(0)} position={[SCENE_X[0], SCENE_Y[0], SCENE_Z(0)]}>
        <PlanetScene onPinClick={onPinClick} activePin={activePin} progressRef={progressRef} />
      </group>
      <group ref={setRef(1)} position={[SCENE_X[1], SCENE_Y[1], SCENE_Z(1)]}>
        <NeuralNetScene progressRef={progressRef} />
      </group>
      <group ref={setRef(2)} position={[SCENE_X[2], SCENE_Y[2], SCENE_Z(2)]}>
        <SchematicScene progressRef={progressRef} />
      </group>
      <group ref={setRef(3)} position={[SCENE_X[3], SCENE_Y[3], SCENE_Z(3)]}>
        <PeriodicScene progressRef={progressRef} />
      </group>
      <group ref={setRef(4)} position={[SCENE_X[4], SCENE_Y[4], SCENE_Z(4)]}>
        <ConstellationScene progressRef={progressRef} />
      </group>
      <group ref={setRef(5)} position={[SCENE_X[5], SCENE_Y[5], SCENE_Z(5)]}>
        <OscilloscopeScene progressRef={progressRef} />
      </group>
      <group ref={setRef(6)} position={[SCENE_X[6], SCENE_Y[6], SCENE_Z(6)]}>
        <BeaconScene progressRef={progressRef} />
      </group>

      <DustField />
      <DistantPlanets />
    </>
  );
}

function DistantPlanets() {
  const ref = useRef<THREE.Group>(null);
  // scatter alien decorative planets across the path's z-range, off-axis
  const planets = useMemo(
    () => [
      { pos: [-14, 5, -22] as [number, number, number],  size: 1.6, color: "#c98558", ring: false },
      { pos: [12, -4, -42] as [number, number, number],  size: 2.0, color: "#5e7bd9", ring: true  },
      { pos: [-12, 6, -68] as [number, number, number],  size: 1.4, color: "#b54c8f", ring: false },
      { pos: [13, -5, -90] as [number, number, number],  size: 2.5, color: "#d9a04d", ring: true  },
    ],
    []
  );

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      c.rotation.y += dt * 0.02 * (i % 2 === 0 ? 1 : -1);
    });
  });

  return (
    <group ref={ref}>
      {planets.map((p, i) => (
        <group key={i} position={p.pos}>
          <mesh>
            <sphereGeometry args={[p.size, 32, 32]} />
            <meshStandardMaterial
              color={p.color}
              roughness={0.95}
              metalness={0.02}
              emissive={p.color}
              emissiveIntensity={0.015}
            />
          </mesh>
          {/* soft atmosphere */}
          <mesh scale={1.08}>
            <sphereGeometry args={[p.size, 24, 24]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.06} side={THREE.BackSide} />
          </mesh>
          {p.ring && (
            <mesh rotation={[Math.PI / 2 + 0.4, 0, 0]}>
              <ringGeometry args={[p.size * 1.4, p.size * 2.0, 96]} />
              <meshBasicMaterial color={p.color} transparent opacity={0.18} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function DustField() {
  const ref = useRef<THREE.Points>(null);
  const N = 400;
  const positions = useMemo(() => {
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = -Math.random() * SCENE_GAP * TOTAL;
    }
    return arr;
  }, []);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const z = arr[i * 3 + 2];
      const dz = z - camera.position.z;
      if (dz > 5) arr[i * 3 + 2] = camera.position.z - SCENE_GAP * TOTAL * 0.5;
      if (dz < -SCENE_GAP * TOTAL) arr[i * 3 + 2] = camera.position.z + 5;
    }
    (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={N} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#7da3ff" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ===== SCENES ===== */

function PlanetScene({
  onPinClick, activePin, progressRef,
}: {
  onPinClick: (slug: string) => void; activePin: string | null;
  progressRef: React.MutableRefObject<number>;
}) {
  const planet = useRef<THREE.Group>(null);
  const drag = useRef({ on: false, lx: 0, ly: 0, vx: 0, vy: 0, manual: false, signaled: false });

  useFrame((_, dt) => {
    if (!planet.current) return;
    const lp = localProgress(progressRef.current, 0);
    const d = drag.current;
    if (d.on) return;
    if (d.manual) {
      planet.current.rotation.y += dt * 0.05 + d.vx;
      planet.current.rotation.x += d.vy;
      d.vx *= 0.94; d.vy *= 0.94;
    } else {
      planet.current.rotation.y = lp * Math.PI * 1.4;
      planet.current.rotation.x = Math.sin(lp * Math.PI) * 0.4;
    }
  });

  return (
    <group>
      <group ref={planet}
        onPointerDown={(e: any) => {
          e.stopPropagation();
          drag.current.on = true;
          drag.current.manual = true;
          drag.current.lx = e.clientX; drag.current.ly = e.clientY;
          if (!drag.current.signaled) {
            drag.current.signaled = true;
            try { window.dispatchEvent(new CustomEvent("world:planet-rotated")); } catch {}
          }
        }}
        onPointerMove={(e: any) => {
          const d = drag.current;
          if (!d.on || !planet.current) return;
          const dx = (e.clientX - d.lx) * 0.005;
          const dy = (e.clientY - d.ly) * 0.005;
          planet.current.rotation.y += dx;
          planet.current.rotation.x += dy;
          d.vx = dx; d.vy = dy;
          d.lx = e.clientX; d.ly = e.clientY;
        }}
        onPointerUp={() => (drag.current.on = false)}
        onPointerLeave={() => (drag.current.on = false)}
      >
        {/* base sphere · semi-transparent so the hologram reads */}
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            color="#1b2d6b"
            metalness={0.1}
            roughness={0.8}
            emissive="#10204c"
            emissiveIntensity={0.55}
            transparent
            opacity={0.3}
          />
        </mesh>
        {/* hologram grid · aqua */}
        <mesh scale={1.003}>
          <sphereGeometry args={[1, 36, 22]} />
          <meshBasicMaterial color="#5fc6e0" wireframe transparent opacity={0.15} />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => {
          const th = (i * 1.234) % (Math.PI * 2);
          const ph = Math.acos(((i % 7) / 6) * 2 - 1);
          const r = 1.005;
          return (
            <mesh key={i}
              position={[r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)]}
              scale={0.06}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color="#6b8bff" emissive="#0a1a3a" emissiveIntensity={0.6} />
            </mesh>
          );
        })}
      </group>
      <Atmosphere />
      <OrbitRings count={projects.length} />
      {projects.map((p, i) => (
        <Pin key={p.slug} idx={i} count={projects.length} slug={p.slug}
          active={activePin === p.slug} onClick={() => onPinClick(p.slug)} progressRef={progressRef} />
      ))}
    </group>
  );
}

function Atmosphere() {
  return (
    <mesh scale={1.06}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#5fc6e0" transparent opacity={0.07} side={THREE.BackSide} />
    </mesh>
  );
}

function OrbitRings({ count }: { count: number }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const radius = 1.7 + (i % 3) * 0.25;
        const tilt = ((i % 4) - 2) * 0.25;
        return (
          <mesh key={i} rotation={[Math.PI / 2 + tilt, 0, 0]}>
            <ringGeometry args={[radius - 0.003, radius + 0.003, 96]} />
            <meshBasicMaterial color="#5fc6e0" transparent opacity={0.18} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

function Pin({ idx, count, slug, active, onClick, progressRef }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const { camera } = useThree();
  const radius = 1.7 + (idx % 3) * 0.25;
  const tilt = ((idx % 4) - 2) * 0.25;
  const speed = 0.06 + (idx % 3) * 0.02;
  const phase = (idx / count) * Math.PI * 2;

  useFrame(() => {
    if (!ref.current) return;
    const lp = localProgress(progressRef.current, 0);
    const t = performance.now() / 1000;
    const a = phase + t * speed * (idx % 2 === 0 ? 1 : -1) + lp * Math.PI;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    ref.current.position.set(x, z * Math.sin(tilt), z * Math.cos(tilt));
    ref.current.lookAt(camera.position);
  });

  return (
    <mesh ref={ref}
      onClick={(e: any) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e: any) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
      scale={active ? 1.7 : hover ? 1.4 : 1}
    >
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={active ? "#ffd54a" : "#fcd34d"} />
    </mesh>
  );
}

function NeuralNetScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const N = 32;
  const nodes = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < N; i++) {
      const ph = Math.acos(2 * (i / (N - 1)) - 1);
      const th = i * 2.39996;
      const r = 1.4;
      arr.push([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)]);
    }
    return arr;
  }, []);

  const edgePairs = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
        if (dx * dx + dy * dy + dz * dz < 0.85) out.push([i, j]);
      }
    }
    return out;
  }, [nodes]);

  const allEdges = useMemo(() => new Float32Array(edgePairs.length * 6), [edgePairs]);
  const lineGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(allEdges, 3));
    return geom;
  }, [allEdges]);

  useFrame((_, dt) => {
    if (g.current) {
      g.current.rotation.y += dt * 0.18;
      g.current.rotation.x += dt * 0.06;
    }
    const lp = localProgress(progressRef.current, 1);
    const cutoff = Math.floor(lp * edgePairs.length);
    let idx = 0;
    for (let e = 0; e < edgePairs.length; e++) {
      if (e < cutoff) {
        const [i, j] = edgePairs[e];
        const a = nodes[i], b = nodes[j];
        allEdges[idx++] = a[0]; allEdges[idx++] = a[1]; allEdges[idx++] = a[2];
        allEdges[idx++] = b[0]; allEdges[idx++] = b[1]; allEdges[idx++] = b[2];
      } else { idx += 6; }
    }
    for (let k = cutoff * 6; k < allEdges.length; k++) allEdges[k] = 0;
    lineGeom.setDrawRange(0, cutoff * 2);
    (lineGeom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <group ref={g}>
      {nodes.map((n, i) => <ScrubNode key={i} pos={n} idx={i} count={N} progressRef={progressRef} />)}
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial color="#7da3ff" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

function ScrubNode({ pos, idx, count, progressRef }: { pos: [number, number, number]; idx: number; count: number; progressRef: React.MutableRefObject<number>; }) {
  const ref = useRef<THREE.Mesh>(null);
  const baseScale = 0.04 + (idx % 3) * 0.015;
  useFrame(() => {
    if (!ref.current) return;
    const lp = localProgress(progressRef.current, 1);
    const threshold = idx / count;
    // Always visible at half size; lp drives growth so the scene reads as alive on entry.
    const grow = lp < threshold ? 0 : Math.min(1, (lp - threshold) * 6);
    ref.current.scale.setScalar(baseScale * (0.5 + 0.5 * grow));
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color={idx % 5 === 0 ? "#ffd54a" : "#7da3ff"} />
    </mesh>
  );
}

function SchematicScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const inner2 = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const lp = localProgress(progressRef.current, 2);
    if (g.current) {
      g.current.rotation.y += dt * 0.2;
      g.current.rotation.x = Math.sin(performance.now() / 3000) * 0.2;
    }
    if (inner.current) {
      inner.current.rotation.x = lp * Math.PI * 2;
      inner.current.rotation.y = lp * Math.PI;
      // Keep base size so the scene reads as "already there" when the camera arrives.
      inner.current.scale.setScalar(0.85 + lp * 0.15);
    }
    if (inner2.current) {
      inner2.current.rotation.z = -lp * Math.PI * 1.6;
      inner2.current.scale.setScalar(0.6 + lp * 0.4);
    }
  });
  return (
    <group ref={g}>
      <mesh>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshBasicMaterial wireframe color="#7da3ff" transparent opacity={0.45} />
      </mesh>
      <mesh ref={inner}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial wireframe color="#fcd34d" transparent opacity={0.55} />
      </mesh>
      <mesh ref={inner2}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshBasicMaterial wireframe color="#ff6b6b" transparent opacity={0.75} />
      </mesh>
      {[[-1.1,-1.1,-1.1],[1.1,-1.1,-1.1],[-1.1,1.1,-1.1],[1.1,1.1,-1.1],[-1.1,-1.1,1.1],[1.1,-1.1,1.1],[-1.1,1.1,1.1],[1.1,1.1,1.1]].map((p, i) => (
        <mesh key={i} position={p as any} scale={0.06}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#ffd54a" />
        </mesh>
      ))}
    </group>
  );
}

function PeriodicScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const tilesRef = useRef<Array<THREE.Mesh | null>>([]);
  const all = useMemo(() => {
    const items: { label: string; color: string }[] = [];
    const palette: Record<string, string> = {
      languages: "#7da3ff", frontend: "#fcd34d", backend: "#10b981",
      ai: "#a78bfa", infra: "#fb7185", tools: "#94a3b8",
    };
    (Object.keys(stack) as Array<keyof typeof stack>).forEach((k) => {
      stack[k].forEach((item) => items.push({ label: item, color: palette[k] }));
    });
    return items.slice(0, 28);
  }, []);
  const cols = 7;
  const rows = Math.ceil(all.length / cols);
  useFrame(() => {
    const lp = localProgress(progressRef.current, 3);
    if (g.current) g.current.rotation.y = Math.sin(performance.now() / 3500) * 0.4;
    tilesRef.current.forEach((m, i) => {
      if (!m) return;
      const threshold = i / all.length;
      const grow = lp < threshold ? 0 : Math.min(1, (lp - threshold) * 5);
      // Half-size baseline so the rack reads as present when the camera arrives.
      m.rotation.y = (1 - grow) * Math.PI;
      m.scale.setScalar(0.5 + 0.5 * grow);
    });
  });
  return (
    <group ref={g}>
      {all.map((it, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = (c - (cols - 1) / 2) * 0.35;
        const y = ((rows - 1) / 2 - r) * 0.35;
        return (
          <mesh key={i} position={[x, y, 0]} ref={(el) => { tilesRef.current[i] = el; }}>
            <boxGeometry args={[0.3, 0.3, 0.05]} />
            <meshStandardMaterial color={it.color} metalness={0.2} roughness={0.6} emissive={it.color} emissiveIntensity={0.25} />
          </mesh>
        );
      })}
    </group>
  );
}

function ConstellationScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Points>(null);
  const N = 600;
  const positionsRef = useMemo(() => new Float32Array(N * 3), []);
  const colorsRef = useMemo(() => new Float32Array(N * 3), []);
  const seeds = useMemo(() => {
    const arr: { cluster: number; cx: number; cy: number; r: number; a: number; z: number }[] = [];
    const cxs = [-1.4, 1.4, -1.2, 1.2];
    const cys = [0.9, 0.7, -0.9, -0.7];
    for (let i = 0; i < N; i++) {
      const cluster = i % 4;
      arr.push({ cluster, cx: cxs[cluster], cy: cys[cluster], r: Math.random() * 0.6, a: Math.random() * Math.PI * 2, z: (Math.random() - 0.5) * 0.6 });
    }
    return arr;
  }, []);
  useFrame((_, dt) => {
    const lp = localProgress(progressRef.current, 4);
    const palette = [new THREE.Color("#ff6b9d"), new THREE.Color("#7da3ff"), new THREE.Color("#fcd34d"), new THREE.Color("#10b981")];
    for (let i = 0; i < N; i++) {
      const s = seeds[i];
      const clusterReveal = (s.cluster + 1) / 4;
      const grow = Math.min(1, Math.max(0, (lp - (clusterReveal - 0.25)) * 4));
      // Half-spread baseline so all four clusters read as present on entry; lp opens them up.
      const spread = 0.5 + 0.5 * grow;
      const r = s.r * spread;
      positionsRef[i * 3 + 0] = s.cx + Math.cos(s.a) * r;
      positionsRef[i * 3 + 1] = s.cy + Math.sin(s.a) * r;
      positionsRef[i * 3 + 2] = s.z * spread;
      const c = palette[s.cluster];
      colorsRef[i * 3 + 0] = c.r; colorsRef[i * 3 + 1] = c.g; colorsRef[i * 3 + 2] = c.b;
    }
    if (ref.current) {
      (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (ref.current.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      ref.current.rotation.z += dt * 0.04;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positionsRef, 3]} count={N} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colorsRef, 3]} count={N} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.95} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function OscilloscopeScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const lineRef = useRef<THREE.Line>(null);
  const N = 200;
  const positions = useMemo(() => new Float32Array(N * 3), []);
  useFrame(() => {
    if (!lineRef.current) return;
    const lp = localProgress(progressRef.current, 5);
    const t = performance.now() / 1000;
    const drawCount = Math.max(2, Math.floor(N * lp));
    for (let i = 0; i < N; i++) {
      const xn = i / (N - 1);
      const x = (xn - 0.5) * 4;
      const y = Math.sin(i * 0.12 + t * 2.4) * 0.4 + Math.sin(i * 0.04 + t * 1.1) * 0.6;
      const visible = i < drawCount;
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = visible ? y : 0;
      positions[i * 3 + 2] = 0;
    }
    const geom = lineRef.current.geometry as THREE.BufferGeometry;
    geom.setDrawRange(0, drawCount);
    (geom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });
  return (
    <group>
      <line ref={lineRef as any}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={N} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#10b981" linewidth={2} />
      </line>
      {Array.from({ length: 9 }).map((_, i) => {
        const y = (i - 4) * 0.25;
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array([-2, y, -0.01, 2, y, -0.01]), 3]} count={2} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color="#10b981" transparent opacity={0.12} />
          </line>
        );
      })}
      {Array.from({ length: 17 }).map((_, i) => {
        const x = (i - 8) * 0.25;
        return (
          <line key={`v${i}`}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array([x, -1, -0.01, x, 1, -0.01]), 3]} count={2} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color="#10b981" transparent opacity={0.08} />
          </line>
        );
      })}
    </group>
  );
}

function BeaconScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = performance.now() / 1000;
    const lp = localProgress(progressRef.current, 6);
    const charge = Math.min(1, lp * 1.5);
    if (ref.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.1;
      ref.current.scale.setScalar(pulse * charge);
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1.5 + ((t * 0.7) % 2));
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - ((t * 0.7) % 2) / 2) * charge;
    }
    if (ring2Ref.current) {
      ring2Ref.current.scale.setScalar(2.0 + ((t * 0.5 + 0.6) % 2));
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - ((t * 0.5 + 0.6) % 2) / 2) * charge * 0.6;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ff6b9d" emissive="#ff006e" emissiveIntensity={1.6} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.6, 0.62, 96]} />
        <meshBasicMaterial color="#ff6b9d" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[0.6, 0.62, 96]} />
        <meshBasicMaterial color="#ffd54a" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
