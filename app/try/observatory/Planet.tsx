"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { projects } from "@/content/projects";

// Pin orbit config
const orbits = [
  { radius: 1.7, speed: 0.10, tilt: 0.0 },
  { radius: 2.0, speed: -0.08, tilt: 0.6 },
  { radius: 1.85, speed: 0.12, tilt: -0.4 },
  { radius: 2.25, speed: -0.07, tilt: 0.3 },
  { radius: 2.0, speed: 0.09, tilt: -0.7 },
  { radius: 2.45, speed: -0.06, tilt: 0.5 },
];

export function Planet({ onPinClick, active }: { onPinClick: (slug: string) => void; active: string | null }) {
  return (
    <Canvas
      camera={{ fov: 38, position: [0, 0, 7] }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[5, 3, 5]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-4, -2, 3]} intensity={0.5} color="#6b8bff" />
      <Sphere />
      <Atmosphere />
      <OrbitRings />
      {projects.map((p, i) => (
        <Pin key={p.slug} project={p} orbit={orbits[i % orbits.length]} phase={(i / projects.length) * Math.PI * 2} onClick={() => onPinClick(p.slug)} active={active === p.slug} />
      ))}
    </Canvas>
  );
}

function Sphere() {
  const ref = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0, vx: 0, vy: 0 });
  const { gl } = useThree();

  useFrame((_, dt) => {
    if (ref.current) {
      const d = dragRef.current;
      if (!d.dragging) {
        ref.current.rotation.y += dt * 0.05 + d.vx;
        ref.current.rotation.x += d.vy;
        d.vx *= 0.94;
        d.vy *= 0.94;
      }
    }
  });

  const onPointerDown = (e: any) => {
    e.stopPropagation();
    dragRef.current.dragging = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    gl.domElement.style.cursor = "grabbing";
  };

  const onPointerMove = (e: any) => {
    const d = dragRef.current;
    if (!d.dragging || !ref.current) return;
    const dx = (e.clientX - d.lastX) * 0.005;
    const dy = (e.clientY - d.lastY) * 0.005;
    ref.current.rotation.y += dx;
    ref.current.rotation.x += dy;
    d.vx = dx;
    d.vy = dy;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
  };

  const stop = () => {
    dragRef.current.dragging = false;
    gl.domElement.style.cursor = "grab";
  };

  return (
    <group ref={group}>
      <mesh
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerOut={stop}
        onPointerLeave={stop}
      >
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshStandardMaterial
          color="#4a6cd6"
          metalness={0.1}
          roughness={0.85}
          emissive="#0e1a3a"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* land masses approximation — bumps */}
      {Array.from({ length: 20 }).map((_, i) => {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const r = 1.105;
        return (
          <mesh
            key={i}
            position={[r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)]}
            scale={0.05 + Math.random() * 0.04}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color={Math.random() > 0.5 ? "#2a4090" : "#6b8bff"} emissive="#0a1a3a" emissiveIntensity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function Atmosphere() {
  return (
    <mesh scale={1.16}>
      <sphereGeometry args={[1.1, 32, 32]} />
      <meshBasicMaterial color="#6b8bff" transparent opacity={0.1} side={THREE.BackSide} />
    </mesh>
  );
}

function OrbitRings() {
  return (
    <group>
      {orbits.map((o, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + o.tilt, 0, 0]}>
          <ringGeometry args={[o.radius - 0.004, o.radius + 0.004, 96]} />
          <meshBasicMaterial color="#7da3ff" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Pin({ project, orbit, phase, onClick, active }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const { camera } = useThree();

  useFrame(() => {
    if (!ref.current) return;
    const t = performance.now() / 1000;
    const a = phase + t * orbit.speed;
    const x = Math.cos(a) * orbit.radius;
    const z = Math.sin(a) * orbit.radius;
    const tilt = orbit.tilt;
    ref.current.position.set(x, z * Math.sin(tilt), z * Math.cos(tilt));
    ref.current.lookAt(camera.position);
  });

  return (
    <group>
      <mesh
        ref={ref}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
        scale={active ? 1.6 : hover ? 1.3 : 1}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={active ? "#ffd54a" : "#fcd34d"} />
      </mesh>
    </group>
  );
}
