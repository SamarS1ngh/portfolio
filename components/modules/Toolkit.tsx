"use client";

import { motion } from "framer-motion";
import { stack } from "@/content/stack";

const groups: { key: keyof typeof stack; label: string; emoji: string; tint: string }[] = [
  { key: "languages", label: "languages", emoji: "⌥", tint: "from-hot to-ember" },
  { key: "frontend", label: "frontend", emoji: "◐", tint: "from-violet to-sky" },
  { key: "backend", label: "backend", emoji: "◑", tint: "from-sky to-teal" },
  { key: "ai", label: "ai · ml", emoji: "✦", tint: "from-mint to-teal" },
  { key: "infra", label: "infra", emoji: "⊞", tint: "from-sun to-ember" },
  { key: "tools", label: "tools", emoji: "⚙", tint: "from-hot to-violet" },
];

export function Toolkit() {
  return (
    <section
      id="toolkit"
      className="relative w-full overflow-hidden mesh-cream py-28 md:py-36"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <span className="tape">⚙ toolkit</span>
            <h2 className="mt-6 font-display text-4xl font-light uppercase tracking-tight text-ink md:text-6xl">
              what i reach for<br />
              <span className="text-hot">when it's quiet.</span>
            </h2>
          </div>

          <div className="hidden text-right font-mono text-[10px] uppercase tracking-widest text-ink/60 md:block">
            <div>6 categories · 32 items</div>
            <div>not what's hot · what works</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, gi) => (
            <motion.div
              key={g.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: gi * 0.06 }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${g.tint} p-6 text-white shadow-sticker`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-white/80">
                    {g.label}
                  </div>
                  <div className="mt-1 font-display text-xl font-medium uppercase tracking-wider">
                    {stack[g.key].length} items
                  </div>
                </div>
                <div className="font-display text-4xl opacity-80">{g.emoji}</div>
              </div>

              <ul className="mt-5 flex flex-wrap gap-1.5 font-mono text-xs">
                {stack[g.key].map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm transition-all hover:bg-white/30"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
