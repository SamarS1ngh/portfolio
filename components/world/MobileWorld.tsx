"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { regions } from "@/components/world/regions";
import { RegionContentInner } from "@/components/world/RegionContent";

const Stack3D = dynamic(
  () => import("@/components/world/Stack3D").then((m) => m.Stack3D),
  { ssr: false },
);

export function MobileWorld() {
  const { scrollYProgress } = useScroll();
  const progressRef = useRef(0);
  const idleRef = useRef(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Sync continuous scroll → progressRef (drives 3D camera)
  // and snap active region for tint colour.
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      progressRef.current = v;
      const idx = Math.min(regions.length - 1, Math.floor(v * regions.length));
      setActiveIdx((prev) => (prev === idx ? prev : idx));
    });
    return () => unsub();
  }, [scrollYProgress]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const r = regions[activeIdx];

  return (
    <>
      {/* === FIXED BACKDROP — calm 3D world behind content === */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#02050f]">
        {/* Starfield */}
        <div
          className="absolute inset-0 opacity-50"
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
              radial-gradient(1px 1px at 5% 50%, #fff 0, transparent 1px)
            `,
          }}
        />

        {/* Region tint — crossfades on scroll */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: `radial-gradient(ellipse at center, ${r.tint} 0%, transparent 70%)`,
          }}
          transition={{ duration: 1.4 }}
        />

        {/* 3D scene — very low opacity, non-interactive */}
        {!reducedMotion && (
          <div className="absolute inset-0 opacity-[0.18]">
            <Stack3D
              progressRef={progressRef}
              onPinClick={() => {}}
              activePin={null}
              idleRef={idleRef}
            />
          </div>
        )}

        {/* Subtle vignette to keep text readable over the busy bg */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,5,15,0.55) 0%, rgba(2,5,15,0.20) 30%, rgba(2,5,15,0.20) 70%, rgba(2,5,15,0.55) 100%)",
          }}
        />
      </div>

      {/* === CONTENT === */}
      <main className="relative z-10 min-h-screen text-bone">
        {/* Top bar — sticky */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-bone/10 bg-[#02050f]/85 px-5 py-3 backdrop-blur-md">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/80">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            samar.dev
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
            {r.glyph} {r.code}
          </span>
        </header>

        {/* Hero */}
        <section className="px-5 pt-10 pb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
            ▸ operator profile · samar singh
          </div>
          <h1
            className="mt-3 font-light text-3xl uppercase tracking-tight text-bone"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            full-stack · mobile · ai.
          </h1>
          <p className="mt-4 font-sans text-[15px] leading-relaxed text-bone">
            Based in Hyderabad. Building websites, mobile apps, and AI-powered products since 2024.
          </p>
          <nav className="mt-6 grid grid-cols-2 gap-2">
            {regions.map((reg) => (
              <a
                key={reg.code}
                href={`#${reg.code}`}
                className="flex items-center gap-2 border border-bone/15 bg-bone/[0.04] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-bone backdrop-blur-sm hover:border-amber-300/40 hover:bg-amber-300/[0.10] hover:text-amber-300"
              >
                <span className="text-amber-300">{reg.glyph}</span>
                <span className="truncate">{reg.region}</span>
              </a>
            ))}
          </nav>
        </section>

        {/* Sections */}
        {regions.map((reg) => (
          <section
            key={reg.code}
            id={reg.code}
            className="border-t border-bone/10 px-5 py-10"
          >
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
              <span>{reg.glyph}</span>
              <span>{reg.code} · {reg.region}</span>
            </div>
            <div className="mb-6 font-mono text-[10px] uppercase tracking-widest text-bone/60">
              {reg.biome}
            </div>
            <RegionContentInner kind={reg.contentKind} onMarkQuest={() => {}} />
          </section>
        ))}

        {/* Footer */}
        <footer className="border-t border-bone/15 px-5 py-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60">
          © 2026 · samar singh · node HYD-001
        </footer>
      </main>
    </>
  );
}
