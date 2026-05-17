"use client";

import { motion } from "framer-motion";
import { now } from "@/content/now";

export function Status() {
  return (
    <section
      id="status"
      className="relative w-full overflow-hidden bg-ink py-28 md:py-36"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, #fb5607 0%, transparent 35%), radial-gradient(circle at 50% 100%, #ff006e 0%, transparent 35%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="tape">◐ status · now</span>
            <h2 className="mt-6 font-display text-4xl font-light uppercase tracking-tight text-bone md:text-6xl">
              currently<br />
              <span className="text-sun">building.</span>
            </h2>
          </div>

          <div className="hidden text-right font-mono text-[10px] uppercase tracking-widest text-bone/70 md:block">
            <div>updated · {now.updated}</div>
            <div>node · {now.location}</div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Building list */}
          <motion.div
            initial={{ opacity: 0, y: 16, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: -0.6 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-sun p-7 text-ink shadow-sticker md:col-span-8"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
              ▸ on the bench
            </div>
            <ul className="mt-4 space-y-4">
              {now.building.map((line, i) => (
                <li key={i} className="flex gap-4 font-serif text-xl leading-snug text-ink md:text-2xl">
                  <span className="font-mono text-base font-bold text-hot">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Reading */}
          <motion.div
            initial={{ opacity: 0, y: 16, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: 1.2 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-hot p-6 text-white shadow-sticker md:col-span-4"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/80">
              ▸ reading
            </div>
            <ul className="mt-3 space-y-2 font-serif text-lg italic">
              {now.reading.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </motion.div>

          {/* Listening */}
          <motion.div
            initial={{ opacity: 0, y: 16, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: -0.8 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl bg-violet p-6 text-white shadow-sticker md:col-span-5"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/80">
              ▸ listening
            </div>
            <ul className="mt-3 space-y-2 font-serif text-lg italic">
              {now.listening.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </motion.div>

          {/* Vibe sticker */}
          <motion.div
            initial={{ opacity: 0, y: 16, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: 1.5 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-mint p-6 text-ink shadow-sticker md:col-span-7"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
              ▸ vibe right now
            </div>
            <p className="mt-3 font-serif text-2xl italic leading-snug text-ink">
              quiet rooms, three monitors, one terminal open, a problem that's
              <em className="font-bold text-hot"> just out of reach </em>
              but getting closer every revision.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
