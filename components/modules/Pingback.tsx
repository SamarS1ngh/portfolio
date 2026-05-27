"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Blobs } from "@/components/ui/Blobs";

const TARGET_LEN = 4;

export function Pingback() {
  const [code, setCode] = useState("");
  const [linked, setLinked] = useState(false);

  const handleChange = (v: string) => {
    const cleaned = v.replace(/\s/g, "").slice(0, TARGET_LEN);
    setCode(cleaned);
    if (cleaned.length === TARGET_LEN) {
      setTimeout(() => setLinked(true), 350);
    } else {
      setLinked(false);
    }
  };

  return (
    <section
      id="pingback"
      className="relative w-full overflow-hidden mesh-ocean py-28 md:py-36"
    >
      <Blobs
        blobs={[
          { color: "#ff006e", top: "10%", left: "60%", size: 280, anim: "med", blur: 80 },
          { color: "#06d6a0", top: "60%", left: "10%", size: 240, anim: "slow", blur: 80 },
          { color: "#ffbe0b", top: "30%", left: "30%", size: 180, anim: "fast", blur: 60 },
        ]}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12">
          <span className="tape">⌖ pingback</span>
          <h2 className="mt-6 font-display text-5xl font-light uppercase tracking-tight text-bone md:text-7xl">
            wanna build something<br />
            <span className="text-hot">worth defending?</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Handshake gate */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: -0.8 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-bone p-7 text-ink shadow-sticker md:col-span-7 md:p-10"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-hot">
              ⌖ handshake required
            </div>
            <p className="mt-3 font-serif text-xl italic leading-snug text-ink/85 md:text-2xl">
              Type any 4 characters. It's a soft anti-bot gate, not a puzzle.
              Once you do, the email reveals + I get a note you came through.
            </p>

            <div className="mt-8">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/60">
                key — {TARGET_LEN} chars
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2">
                  {Array.from({ length: TARGET_LEN }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex h-16 w-14 items-center justify-center rounded-2xl border-2 font-display text-3xl font-medium uppercase transition-all md:h-20 md:w-16 md:text-4xl ${
                        i < code.length
                          ? "border-hot bg-hot text-white shadow-glow"
                          : i === code.length
                          ? "border-hot/60 bg-hot/10 text-hot"
                          : "border-ink/15 bg-ink/[0.03] text-ink/40"
                      }`}
                    >
                      {code[i]?.toUpperCase() ?? (i === code.length ? "_" : "")}
                    </div>
                  ))}
                </div>
                <input
                  autoFocus={false}
                  value={code}
                  maxLength={TARGET_LEN}
                  onChange={(e) => handleChange(e.target.value)}
                  aria-label="handshake"
                  className="ml-2 w-32 rounded-full border-2 border-ink/15 bg-white px-4 py-2 font-mono text-sm uppercase text-ink outline-none placeholder:text-ink/30 focus:border-hot"
                  placeholder="type"
                />
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink/50">
                <span>
                  progress · <span className="text-hot">{code.length}</span>/{TARGET_LEN}
                </span>
                <button
                  onClick={() => {
                    setCode("");
                    setLinked(false);
                  }}
                  className="underline-offset-2 hover:text-hot hover:underline"
                >
                  reset
                </button>
              </div>
            </div>

            <AnimatePresence>
              {linked && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 rounded-2xl bg-mint p-5 text-ink shadow-sticker"
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ink/70">
                    ◉ link established · channel open
                  </div>
                  <a
                    href="mailto:hello@samar.dev"
                    className="group mt-2 inline-flex items-baseline gap-3 font-serif text-3xl italic text-ink hover:text-hot md:text-4xl"
                  >
                    <span className="underline decoration-2 underline-offset-4 transition-colors">
                      hello@samar.dev
                    </span>
                    <span className="font-mono text-base not-italic text-hot">↗</span>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Side stack */}
          <div className="space-y-4 md:col-span-5">
            <motion.a
              href="https://github.com/samarnarangi"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 12, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: 1.2 }}
              viewport={{ once: true }}
              whileHover={{ rotate: 0, y: -4 }}
              className="block rounded-3xl bg-ink p-6 text-bone shadow-sticker"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-bone/60">
                ▸ github
              </div>
              <div className="mt-2 font-display text-2xl">@samarnarangi</div>
              <div className="mt-1 font-mono text-xs text-bone/60">code lives here ↗</div>
            </motion.a>

            <motion.a
              href="https://x.com/samarnarangi"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 12, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              whileHover={{ rotate: 0, y: -4 }}
              className="block rounded-3xl bg-sky p-6 text-white shadow-sticker"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/80">
                ▸ x / twitter
              </div>
              <div className="mt-2 font-display text-2xl">@samarnarangi</div>
              <div className="mt-1 font-mono text-xs text-white/80">half-thoughts daily ↗</div>
            </motion.a>

            <motion.a
              href="https://linkedin.com/in/samarnarangi"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 12, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ rotate: 0, y: -4 }}
              className="block rounded-3xl bg-violet p-6 text-white shadow-sticker"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/80">
                ▸ linkedin
              </div>
              <div className="mt-2 font-display text-2xl">samarnarangi</div>
              <div className="mt-1 font-mono text-xs text-white/80">resume ↗</div>
            </motion.a>

            <motion.a
              href="/resume.pdf"
              initial={{ opacity: 0, y: 12, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: -1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              whileHover={{ rotate: 0, y: -4 }}
              className="block rounded-3xl bg-sun p-6 text-ink shadow-sticker"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                ▸ resume.pdf
              </div>
              <div className="mt-2 font-display text-2xl">download ↘</div>
              <div className="mt-1 font-mono text-xs text-ink/60">one-pager</div>
            </motion.a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 flex flex-col items-start justify-between gap-3 border-t border-white/15 pt-6 font-mono text-[10px] uppercase tracking-widest text-bone/60 md:flex-row">
          <span>© 2026 samar singh · hyderabad / internet</span>
          <span>made with next · framer-motion · a lot of coffee</span>
          <span className="text-hot">end of feed_</span>
        </footer>
      </div>
    </section>
  );
}
