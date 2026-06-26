"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { projects } from "@/content/projects";

const layers = [
  {
    z: 0,
    code: "L.00",
    title: "IDENTITY",
    head: "samar singh",
    sub: "engineer of strange quiet machines.",
    side: "node HYD-001 · 2026",
  },
  {
    z: 1,
    code: "L.01",
    title: "DOCTRINE",
    head: "ship undeniable things.",
    sub: "one rule. one cadence. annually.",
    side: "rule · 01 / 06",
  },
  {
    z: 2,
    code: "L.02",
    title: "WORK",
    head: "six in the log.",
    sub: "voice agents, mobile ML, indie OS.",
    side: `missions · ${projects.length}`,
  },
  {
    z: 3,
    code: "L.03",
    title: "TOOLKIT",
    head: "what i reach for.",
    sub: "typescript · python · kotlin · rust",
    side: "32 items · 6 lanes",
  },
  {
    z: 4,
    code: "L.04",
    title: "STATUS",
    head: "currently building.",
    sub: "jarvis memory · rentroll demo",
    side: "live · 2026.06",
  },
  {
    z: 5,
    code: "L.05",
    title: "OPEN",
    head: "hello@samar.dev",
    sub: "ping me. i read everything.",
    side: "eof_",
  },
];

export default function SpatialPrototype() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });

  return (
    <div ref={ref} className="relative bg-[#07070a] text-bone" style={{ height: `${layers.length * 100}vh` }}>
      {/* Fixed perspective viewport */}
      <div className="sticky top-0 h-screen overflow-hidden" style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        {/* Grid floor */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(167,139,250,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.10) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            transform: "rotateX(60deg) translateY(35%) translateZ(0px)",
            transformOrigin: "50% 50%",
            maskImage: "radial-gradient(ellipse at 50% 30%, #000 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, #000 30%, transparent 80%)",
          }}
        />

        {/* HUD */}
        <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-white/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60 backdrop-blur-sm md:px-12">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]" />
            spatial · z-depth navigator
          </span>
          <Depth y={scrollYProgress} />
          <Link href="/try" className="hover:text-bone">← back</Link>
        </header>

        <footer className="absolute left-0 right-0 bottom-0 z-30 flex items-center justify-between border-t border-white/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50 backdrop-blur-sm md:px-12">
          <span>scroll · fly forward through layers</span>
          <span className="hidden md:inline">{layers.length} layers indexed</span>
          <span>↑↓</span>
        </footer>

        {/* Layers in z-space */}
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {layers.map((l) => (
            <Layer key={l.z} layer={l} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Layer({ layer, progress }: { layer: (typeof layers)[number]; progress: MotionValue<number> }) {
  // each layer occupies 1/N of scroll
  const total = layers.length;
  const slot = 1 / total;
  const center = (layer.z + 0.5) * slot;
  // map scroll progress → relative position to layer center → translateZ
  const z = useTransform(progress, (v) => {
    const offset = v - center;
    return offset * 4000; // pixels of z movement, positive = layer behind viewer
  });
  const opacity = useTransform(progress, (v) => {
    const d = Math.abs(v - center) / slot;
    return Math.max(0, 1 - d * 0.7);
  });
  const scale = useTransform(progress, (v) => {
    const d = v - center;
    return 1 + d * 0.4;
  });

  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        z,
        opacity,
        scale,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
      }}
    >
      <div className="grid grid-cols-[auto_minmax(0,560px)_auto] items-center gap-6 md:gap-10">
        {/* Left meta */}
        <div className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300/80 md:block">
          {layer.code}
        </div>

        {/* Main panel */}
        <div className="rounded-2xl border border-white/15 bg-black/65 px-6 py-8 backdrop-blur-2xl shadow-[0_30px_90px_rgba(167,139,250,0.18)] md:px-10 md:py-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300">
            ▸ {layer.code} · {layer.title}
          </div>
          <h2 className="mt-4 font-light text-3xl uppercase tracking-tight text-bone md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            {layer.head}
          </h2>
          <p className="mt-3 font-serif text-base italic text-bone/85 md:text-xl">
            {layer.sub}
          </p>
        </div>

        {/* Right meta */}
        <div className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 md:block">
          {layer.side}
        </div>
      </div>
    </motion.div>
  );
}

function Depth({ y }: { y: MotionValue<number> }) {
  const v = useTransform(y, [0, 1], [0, 100]);
  return (
    <span className="hidden md:flex items-center gap-2">
      <span className="text-bone/40">depth ·</span>
      <motion.span className="text-violet-300">
        {useTransform(v, (n) => `${Math.round(n)}%`)}
      </motion.span>
    </span>
  );
}
