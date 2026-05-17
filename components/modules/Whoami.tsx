"use client";

import { motion } from "framer-motion";
import { Blobs } from "@/components/ui/Blobs";

const facts = [
  { k: "based", v: "Hyderabad, IN" },
  { k: "since", v: "writing code 2017" },
  { k: "lane", v: "voice · mobile · web" },
  { k: "fuel", v: "coffee + reps" },
  { k: "aspires", v: "to ship one undeniable thing / year" },
  { k: "off-clock", v: "stories, late games, line art" },
];

export function Whoami() {
  return (
    <section
      id="whoami"
      className="relative w-full overflow-hidden mesh-dusk py-28 md:py-36"
    >
      <Blobs
        blobs={[
          { color: "#8338ec", top: "10%", right: "5%", size: 260, anim: "slow", blur: 80 },
          { color: "#06d6a0", top: "60%", left: "5%", size: 240, anim: "med", blur: 80 },
        ]}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="tape">▸ whoami</span>
            <h2 className="mt-6 font-display text-4xl font-light uppercase tracking-tight text-bone md:text-6xl">
              who I am<br />
              <span className="text-mint">on a good day.</span>
            </h2>
          </div>

          <div className="hidden text-right font-mono text-[10px] uppercase tracking-widest text-bone/70 md:block">
            <div>file · whoami.bio</div>
            <div>read · 4 min</div>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          {/* LEFT — bio */}
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.5 }}
              className="space-y-6 font-serif text-xl leading-[1.6] text-bone md:text-2xl"
            >
              <p>
                I build <em className="text-sun">strange things on purpose</em> and try to keep them
                quiet on the surface. Most of my time goes into the awkward middle between
                research and product — taking an idea that technically works and shaping it
                so a real person can use it without a manual.
              </p>
              <p>
                I lean toward problems where the hard part is <span className="rounded-md bg-hot/30 px-1.5 text-bone">taste</span>,
                not throughput. I'd rather ship one undeniable thing in a year than ten
                forgettable ones in six months.
              </p>
              <p>
                Late-night iteration is my home time-zone. I keep a soft spot for tinkerers,
                lone makers, and the people who build the cool thing in the basement before
                anyone else notices.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10 inline-block rounded-2xl bg-bone p-6 text-ink shadow-sticker md:max-w-md"
              style={{ transform: "rotate(-1.5deg)" }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-hot">
                ✱ note to self
              </div>
              <p className="mt-2 font-serif text-xl italic">
                "the suit doesn't make the maker. the iteration cycle does."
              </p>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink/50">
                — pinned · 2026
              </div>
            </motion.div>
          </div>

          {/* RIGHT — sticker facts grid */}
          <div className="md:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              {facts.map((f, i) => (
                <motion.div
                  key={f.k}
                  initial={{ opacity: 0, y: 8, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ rotate: 0, scale: 1.04 }}
                  className={`rounded-2xl p-4 shadow-sticker ${
                    i === 0
                      ? "bg-hot text-white"
                      : i === 1
                      ? "bg-sun text-ink"
                      : i === 2
                      ? "bg-violet text-white"
                      : i === 3
                      ? "bg-mint text-ink"
                      : i === 4
                      ? "bg-ink text-bone"
                      : "bg-bone text-ink"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                    {f.k}
                  </div>
                  <div className="mt-2 font-display text-base font-medium leading-tight">
                    {f.v}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
