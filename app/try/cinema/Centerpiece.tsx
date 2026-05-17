"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Kind = "sphere" | "torus" | "particles" | "ring";

export function Centerpiece({ kind }: { kind: Kind }) {
  return (
    <Canvas
      camera={{ fov: 50, position: [0, 0, 4] }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 5]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={0.5} color="#88aaff" />
      {kind === "sphere" && <Sphere />}
      {kind === "torus" && <TorusStack />}
      {kind === "particles" && <Particles />}
      {kind === "ring" && <Ring />}
    </Canvas>
  );
}

function Sphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.12;
      ref.current.rotation.x += dt * 0.04;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.1, 64, 64]} />
      <meshStandardMaterial color="#e8e8ee" metalness={0.4} roughness={0.35} />
    </mesh>
  );
}

function TorusStack() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) {
      g.current.rotation.x += dt * 0.18;
      g.current.rotation.y += dt * 0.1;
    }
  });
  return (
    <group ref={g}>
      <mesh>
        <torusKnotGeometry args={[0.8, 0.18, 200, 24]} />
        <meshStandardMaterial color="#f5f5f7" metalness={0.6} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const n = 800;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 1.4 + Math.random() * 0.8;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3 + 0] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      arr[i * 3 + 2] = r * Math.cos(ph);
    }
    return arr;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.08;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#ffffff" transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Ring() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) {
      g.current.rotation.z += dt * 0.06;
      g.current.rotation.x = Math.sin(performance.now() / 4000) * 0.3;
    }
  });
  return (
    <group ref={g}>
      <mesh>
        <torusGeometry args={[1.2, 0.012, 8, 200]} />
        <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[1.0, 0.008, 8, 200]} />
        <meshStandardMaterial color="#cccccc" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2.6, 0]}>
        <torusGeometry args={[0.8, 0.006, 8, 200]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}
