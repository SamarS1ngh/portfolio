"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const Centerpiece = dynamic(() => import("./Centerpiece").then((m) => m.Centerpiece), { ssr: false });

const chapters = [
  {
    code: "CH. 01",
    title: "OPEN",
    head: "Engineer of strange",
    head2: "quiet machines.",
    sub: "an introduction.",
    scene: "sphere" as const,
  },
  {
    code: "CH. 02",
    title: "DOCTRINE",
    head: "Ship one undeniable",
    head2: "thing per year.",
    sub: "the rule i build by.",
    scene: "torus" as const,
  },
  {
    code: "CH. 03",
    title: "WORK",
    head: "Six things",
    head2: "worth telling.",
    sub: "voice agents, mobile ML, indie OS.",
    scene: "particles" as const,
  },
  {
    code: "CH. 04",
    title: "CONTACT",
    head: "Let's build",
    head2: "something defensible.",
    sub: "hello@samar.dev",
    scene: "ring" as const,
  },
];

export default function CinemaPrototype() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const [tc, setTc] = useState("00:00:00");

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const secs = Math.floor(v * chapters.length * 60);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      const f = Math.floor((v * chapters.length * 60 * 24) % 24);
      setTc(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`);
    });
  }, [scrollYProgress]);

  return (
    <div ref={ref} className="relative bg-[#050505] text-bone">
      {/* Fixed letterbox + timecode */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[44px] bg-black" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[44px] bg-black" />
      <div className="pointer-events-none fixed left-6 top-3 z-50 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50 md:left-12">
        S.SINGH · 2026
      </div>
      <div className="pointer-events-none fixed right-6 top-3 z-50 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50 md:right-12">
        TC · {tc}
      </div>
      <div className="pointer-events-none fixed left-6 bottom-3 z-50 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50 md:left-12">
        24 FPS · DCP
      </div>
      <div className="pointer-events-none fixed right-6 bottom-3 z-50 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50 md:right-12">
        <Link href="/try" className="pointer-events-auto hover:text-bone">
          ← back to picker
        </Link>
      </div>

      {/* Scroll progress film strip */}
      <motion.div
        className="pointer-events-none fixed left-0 top-[44px] z-50 h-[2px] bg-bone"
        style={{ width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
      />

      {chapters.map((c, i) => (
        <Chapter key={i} chapter={c} index={i} />
      ))}

      <footer className="flex h-[40vh] items-center justify-center px-6 pb-32 text-center">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">
            ◉ FIN
          </div>
          <p className="mt-4 font-serif text-2xl italic text-bone/70">— end of preview reel —</p>
          <Link
            href="/try"
            className="mt-6 inline-block border border-bone/30 px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-bone/80 hover:bg-bone/10"
          >
            ← back to picker
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Chapter({ chapter, index }: { chapter: (typeof chapters)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32"
    >
      {/* Centerpiece */}
      <div className="pointer-events-none absolute inset-0">
        <Centerpiece kind={chapter.scene} />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-4xl">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone/50">
            — {chapter.code} · {chapter.title} —
          </div>
          <h2 className="mt-8 font-serif text-5xl leading-[0.95] text-bone md:text-7xl lg:text-8xl">
            {chapter.head}
            <br />
            <em className="italic text-bone/95">{chapter.head2}</em>
          </h2>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-bone/50">
            {chapter.sub}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
