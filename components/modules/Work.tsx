"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/content/projects";

const cardColors = [
  { bg: "bg-hot", fg: "text-white", chip: "bg-white/20" },
  { bg: "bg-sun", fg: "text-ink", chip: "bg-ink/15" },
  { bg: "bg-sky", fg: "text-white", chip: "bg-white/20" },
  { bg: "bg-mint", fg: "text-ink", chip: "bg-ink/15" },
  { bg: "bg-violet", fg: "text-white", chip: "bg-white/20" },
  { bg: "bg-bone", fg: "text-ink", chip: "bg-ink/10" },
];

const rotates = [-2, 1.5, -1, 2, -1.5, 1];

export function Work() {
  return (
    <section
      id="work"
      className="relative w-full overflow-hidden bg-ink py-28 md:py-36"
    >
      {/* Subtle bg blobs */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, #ff006e 0%, transparent 40%), radial-gradient(circle at 80% 70%, #3a86ff 0%, transparent 40%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <span className="tape">▦ work</span>
            <h2 className="mt-6 font-display text-4xl font-light uppercase tracking-tight text-bone md:text-6xl">
              six things<br />
              <span className="text-hot">worth telling.</span>
            </h2>
          </div>

          <div className="hidden text-right font-mono text-[10px] uppercase tracking-widest text-bone/70 md:block">
            <div>missions · {projects.length}</div>
            <div>click any card ↗</div>
          </div>
        </div>

        {/* Card grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const c = cardColors[i % cardColors.length];
            const r = rotates[i % rotates.length];
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: r }}
                viewport={{ once: true, margin: "-10%" }}
                whileHover={{ rotate: 0, scale: 1.02, y: -6 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 22 }}
                className={`relative rounded-3xl ${c.bg} ${c.fg} shadow-sticker hover:shadow-stickerHover`}
              >
                <Link href={`/work/${p.slug}`} className="block p-7">
                  <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-widest opacity-80">
                    <span>#{String(i + 1).padStart(2, "0")} · {p.year}</span>
                    <span className={`rounded-full ${c.chip} px-2 py-0.5`}>{p.status}</span>
                  </div>

                  <div className="mt-8 font-display text-3xl font-medium leading-[0.95] md:text-4xl">
                    {p.name}
                  </div>

                  <p className="mt-3 font-serif text-lg italic leading-snug opacity-95">
                    {p.tagline}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-widest">
                    {p.tags.map((t) => (
                      <span key={t} className={`rounded-full ${c.chip} px-2 py-1`}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-current/15 pt-4 font-mono text-[10px] uppercase tracking-widest">
                    <span className="opacity-70">{p.role}</span>
                    <span className="font-display text-sm font-medium">open ↗</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Marquee divider */}
        <div className="mt-16 overflow-hidden border-y border-white/10 py-3 marquee">
          <div className="marquee-track gap-12 font-display text-2xl font-light uppercase tracking-widest text-bone/40">
            {Array.from({ length: 2 }).map((_, dup) => (
              <span key={dup} className="flex gap-12">
                {projects.map((p) => (
                  <span key={`${dup}-${p.slug}`} className="flex items-center gap-12">
                    <span>{p.name}</span>
                    <span className="text-hot">◆</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
