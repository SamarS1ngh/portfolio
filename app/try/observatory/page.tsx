"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/content/projects";

const Planet = dynamic(() => import("./Planet").then((m) => m.Planet), { ssr: false });

export default function ObservatoryPrototype() {
  const [active, setActive] = useState<string | null>(null);
  const selected = projects.find((p) => p.slug === active) ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02050f] text-bone">
      {/* Starfield */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 22%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 78% 14%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 33% 67%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 86% 78%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 50% 35%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 22% 88%, #fff 0, transparent 1px),
            radial-gradient(2px 2px at 65% 50%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 95% 45%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 5% 50%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 40% 12%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 60% 88%, #fff 0, transparent 1px),
            radial-gradient(2px 2px at 25% 40%, #ffd76b 0, transparent 1px)
          `,
        }}
      />

      {/* Atmospheric gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(20,40,90,0.5) 0%, transparent 60%)",
        }}
      />

      {/* Top HUD */}
      <header className="relative z-30 flex items-center justify-between border-b border-white/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60 backdrop-blur-sm md:px-12">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d]" />
          observatory · node HYD-001
        </span>
        <span className="hidden md:inline">drag the planet · click a pin to engage</span>
        <Link href="/try" className="hover:text-bone">← back</Link>
      </header>

      {/* Hero scene */}
      <section className="relative z-10 grid min-h-[80vh] grid-rows-[1fr_auto]">
        <div className="relative flex items-center justify-center px-6 py-10">
          {/* 3D planet w/ orbiting pins (all interactive in one canvas) */}
          <div className="relative h-[min(70vh,560px)] w-[min(70vh,560px)]">
            <Planet onPinClick={(slug) => setActive(slug)} active={active} />
          </div>
        </div>

        <div className="relative px-6 pb-10 text-center md:px-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50">
            ▸ operator profile
          </div>
          <h1 className="mt-3 font-display text-3xl font-light uppercase tracking-tight text-bone md:text-5xl lg:text-6xl">
            SAMAR SINGH
          </h1>
          <p className="mt-2 font-serif text-lg italic text-bone/80 md:text-xl">
            engineer of strange quiet machines.
          </p>
        </div>
      </section>

      {/* Mission detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            key={selected.slug}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-4 top-1/2 z-40 w-[360px] max-w-[92vw] -translate-y-1/2 border border-amber-300/40 bg-black/80 p-6 shadow-2xl backdrop-blur-xl md:right-8"
          >
            <div className="flex items-center justify-between border-b border-amber-300/30 pb-2 font-mono text-[10px] uppercase tracking-widest text-amber-300/80">
              <span>mission · {selected.slug}</span>
              <button onClick={() => setActive(null)} className="hover:text-bone">close ✕</button>
            </div>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-bone/60">
              [{selected.year}] · {selected.role}
            </div>
            <h3 className="mt-2 font-display text-3xl font-light uppercase tracking-wider text-bone">
              {selected.name}
            </h3>
            <p className="mt-3 font-serif text-base italic text-bone/85">
              {selected.tagline}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-widest">
              {selected.tags.map((t) => (
                <span key={t} className="border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-amber-200">
                  {t}
                </span>
              ))}
            </div>
            <Link
              href={`/work/${selected.slug}`}
              className="mt-6 block border border-amber-300 bg-amber-300/10 px-4 py-3 text-center font-display text-xs uppercase tracking-widest text-amber-200 hover:bg-amber-300/20"
            >
              ◐ engage full briefing
            </Link>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Bottom strip */}
      <footer className="relative z-30 border-t border-white/10 px-6 py-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 backdrop-blur-sm md:px-12">
        prototype · observatory · drag planet · click pins · {projects.length} missions
      </footer>
    </main>
  );
}
