"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StickerCard } from "@/components/ui/StickerCard";
import { Blobs } from "@/components/ui/Blobs";

const channels = [
  { label: "currently · jarvis memory + nocap beta", title: "now" },
  { label: "6 things on the bench", title: "work ↗" },
  { label: "tap-tap-typed in 7y", title: "stack" },
  { label: "tune any frequency", title: "freq" },
];

export function Splash() {
  const [moved, setMoved] = useState(false);

  return (
    <section
      id="splash"
      className="relative flex min-h-screen w-full items-center overflow-hidden mesh-sunset mesh-anim"
    >
      <Blobs
        blobs={[
          { color: "#ff006e", top: "10%", left: "60%", size: 320, anim: "med", blur: 80 },
          { color: "#3a86ff", top: "60%", left: "5%", size: 280, anim: "slow", blur: 80 },
          { color: "#ffbe0b", top: "50%", left: "70%", size: 200, anim: "fast", blur: 60 },
        ]}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 md:px-10 md:pt-32">
        <div className="grid items-center gap-10 md:grid-cols-12">
          {/* LEFT — name + tagline */}
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <span className="tape">— index · 2026 · hyd</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-6 font-display text-[58px] font-light uppercase leading-[0.92] tracking-tight text-bone heavy-shadow md:text-[110px] lg:text-[140px]"
            >
              SAMAR<br />
              SINGH
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-6 max-w-lg font-serif text-2xl italic text-bone/95 md:text-3xl"
            >
              builds <em className="text-sun">strange</em> things<br />
              and keeps them <em className="text-mint">quiet</em>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="#work"
                className="group flex items-center gap-2 rounded-full bg-bone px-5 py-3 font-display text-sm font-medium uppercase tracking-widest text-ink hover:bg-sun"
              >
                see the work <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#pingback"
                className="group flex items-center gap-2 rounded-full border-2 border-bone/40 px-5 py-3 font-display text-sm font-medium uppercase tracking-widest text-bone hover:bg-white/10"
              >
                ping me
              </a>
              <span className="hidden font-mono text-xs uppercase tracking-widest text-bone/70 md:inline">
                or ⌘K to query
              </span>
            </motion.div>
          </div>

          {/* RIGHT — sticker stack */}
          <div className="relative md:col-span-5 md:h-[460px]">
            <StickerCard
              draggable
              rotate={-6}
              className="absolute left-2 top-4 w-56 rounded-2xl bg-bone p-5 text-ink md:left-8"
              onDragEnd={() => setMoved(true)}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-hot">
                ◐ status
              </div>
              <div className="mt-2 font-display text-xl font-medium text-ink">
                shipping<br />jarvis + nocap
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink/50">
                live · {new Date().toISOString().slice(0, 10)}
              </div>
            </StickerCard>

            <StickerCard
              draggable
              rotate={4}
              className="absolute left-32 top-32 w-56 rounded-2xl bg-ink p-5 text-bone md:left-48"
              onDragEnd={() => setMoved(true)}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-sun">
                ✱ now
              </div>
              <div className="mt-2 font-serif text-xl italic text-bone">
                rewiring memory<br />for voice agents.
              </div>
              <div className="mt-3 flex gap-1 font-mono text-[10px] uppercase tracking-widest">
                <span className="rounded-full bg-hot px-2 py-0.5">ai</span>
                <span className="rounded-full bg-sky px-2 py-0.5">infra</span>
              </div>
            </StickerCard>

            <StickerCard
              draggable
              rotate={-2}
              className="absolute right-2 top-44 w-48 rounded-2xl bg-hot p-5 text-white md:right-4"
              onDragEnd={() => setMoved(true)}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/70">
                ⌖ ping
              </div>
              <div className="mt-2 font-display text-base font-medium leading-tight">
                hello@samar.dev
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-white/70">
                drag me. flick me.
              </div>
            </StickerCard>

            <StickerCard
              draggable
              rotate={6}
              className="absolute bottom-0 left-4 w-52 rounded-2xl bg-sun p-5 text-ink md:left-20"
              onDragEnd={() => setMoved(true)}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                ▦ work
              </div>
              <div className="mt-2 font-display text-xl font-medium text-ink">
                6 missions<br />2 in motion
              </div>
            </StickerCard>

            {/* Hint */}
            {!moved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-bone/80"
              >
                ↑ drag the stickers — try it
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom scroll cue */}
        <div className="mt-16 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-bone/80 md:mt-24">
          <span>scroll · explore · play</span>
          <div className="flex gap-1">
            {channels.map((c, i) => (
              <span
                key={i}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm"
                title={c.label}
              >
                {c.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
