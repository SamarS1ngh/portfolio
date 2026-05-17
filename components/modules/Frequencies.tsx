"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { interests } from "@/content/interests";
import { Blobs } from "@/components/ui/Blobs";

type Channel = keyof typeof interests;

const channels: { key: Channel; label: string; sub: string; tint: string; chip: string; freq: string }[] = [
  { key: "anime", label: "stories", sub: "long-form serial fiction", tint: "from-hot via-ember to-sun", chip: "bg-hot", freq: "FM 91.4" },
  { key: "games", label: "worlds", sub: "interactive systems", tint: "from-violet via-sky to-teal", chip: "bg-violet", freq: "FM 92.6" },
  { key: "art", label: "vision", sub: "people who draw the future first", tint: "from-sun via-ember to-hot", chip: "bg-sun", freq: "FM 93.7" },
  { key: "science", label: "ideas", sub: "what the world is made of", tint: "from-teal via-sky to-violet", chip: "bg-teal", freq: "FM 94.9" },
];

export function Frequencies() {
  const [active, setActive] = useState<Channel>("anime");
  const meta = channels.find((c) => c.key === active)!;
  const items = interests[active];

  return (
    <section
      id="frequencies"
      className="relative w-full overflow-hidden mesh-magenta py-28 md:py-36"
    >
      <Blobs
        blobs={[
          { color: "#ff006e", top: "10%", left: "10%", size: 280, anim: "med", blur: 80 },
          { color: "#8338ec", top: "60%", right: "10%", size: 260, anim: "slow", blur: 80 },
        ]}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <span className="tape">∿ frequencies</span>
            <h2 className="mt-6 font-display text-4xl font-light uppercase tracking-tight text-bone md:text-6xl">
              what I tune into<br />
              <span className="text-sun">off the clock.</span>
            </h2>
          </div>

          <div className="hidden text-right font-mono text-[10px] uppercase tracking-widest text-bone/70 md:block">
            <div>4 channels · always tuning</div>
            <div>click any band ↘</div>
          </div>
        </div>

        {/* Channel selector — big colored sticker buttons */}
        <div className="mb-8 grid gap-3 md:grid-cols-4">
          {channels.map((c) => {
            const isActive = c.key === active;
            return (
              <motion.button
                key={c.key}
                onClick={() => setActive(c.key)}
                whileHover={{ y: -4, rotate: isActive ? 0 : -1 }}
                whileTap={{ scale: 0.96 }}
                className={`relative overflow-hidden rounded-2xl p-5 text-left shadow-sticker transition-all ${
                  isActive
                    ? `bg-gradient-to-br ${c.tint} text-white`
                    : "bg-white/10 text-bone hover:bg-white/15"
                } backdrop-blur-md`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                      {c.freq}
                    </div>
                    <div className="mt-1 font-display text-2xl font-medium uppercase tracking-wider">
                      {c.label}
                    </div>
                    <div className="mt-1 font-serif text-sm italic opacity-90">
                      {c.sub}
                    </div>
                  </div>
                  <div className="font-display text-2xl">
                    {isActive ? "◉" : "○"}
                  </div>
                </div>

                {/* Animated bars */}
                <div className="mt-4 flex items-end gap-0.5">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-current opacity-60"
                      style={{
                        height: `${6 + ((i * 5) % 16)}px`,
                        transition: "height 0.5s",
                      }}
                    />
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Items grid w/ flip */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid gap-3 md:grid-cols-3"
          >
            {items.map((it, i) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 16, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: (i % 2 === 0 ? -1 : 1) * 0.6 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ rotate: 0, y: -4, scale: 1.02 }}
                className="rounded-2xl bg-bone p-5 text-ink shadow-sticker"
              >
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink/60">
                  <span>#{String(i + 1).padStart(2, "0")}</span>
                  <span className={`rounded-full text-white ${meta.chip} px-2 py-0.5`}>{it.tag}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-medium uppercase leading-tight tracking-wider">
                  {it.title}
                </h3>
                <p className="mt-2 font-serif text-base italic leading-snug text-ink/80">
                  {it.note}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
