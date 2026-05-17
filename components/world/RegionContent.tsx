"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/content/projects";
import { stack } from "@/content/stack";
import { interests } from "@/content/interests";
import { now } from "@/content/now";

const principles = [
  "ship something every year worth defending in a room of strangers.",
  "first principles. nothing inherited without inspection.",
  "taste compounds. brute force does not.",
  "the suit doesn't make the maker — the iteration cycle does.",
  "if it can't be explained, it isn't understood yet.",
  "make things quiet. let them speak loud.",
];

export function RegionContent({
  kind,
  onMarkQuest,
}: {
  kind:
    | "origin"
    | "doctrine"
    | "missions"
    | "armory"
    | "cove"
    | "deck"
    | "summit";
  onMarkQuest: (id: string) => void;
}) {
  return (
    <div
      data-region-content
      className="pointer-events-auto fixed right-4 top-1/2 z-20 w-[min(92vw,540px)] max-h-[72vh] -translate-y-1/2 overflow-hidden border-2 border-amber-300/30 bg-[#04060e]/96 shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_40px_rgba(255,213,74,0.08)] md:right-8"
    >
      {/* Corner brackets */}
      <span className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-l-2 border-t-2 border-amber-300/80" />
      <span className="pointer-events-none absolute -top-px -right-px h-3 w-3 border-r-2 border-t-2 border-amber-300/80" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-l-2 border-b-2 border-amber-300/80" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-r-2 border-b-2 border-amber-300/80" />

      {/* Panel header */}
      <div className="flex items-center justify-between border-b-2 border-amber-300/25 bg-amber-300/[0.06] px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#ffd54a]" />
          region brief · scroll inside
        </span>
        <span className="text-amber-300/60">[ live ]</span>
      </div>

      <div
        data-region-content-scroll
        className="overflow-y-auto px-6 py-7 md:px-8"
        style={{ maxHeight: "calc(72vh - 42px)" }}
      >
        {kind === "origin" && <OriginContent />}
        {kind === "doctrine" && <DoctrineContent onRead={() => onMarkQuest("R1:read")} />}
        {kind === "missions" && <MissionsContent onInspect={() => onMarkQuest("R2:inspect")} />}
        {kind === "armory" && <ArmoryContent />}
        {kind === "cove" && <CoveContent onTuneAll={() => onMarkQuest("R4:tune")} />}
        {kind === "deck" && <DeckContent />}
        {kind === "summit" && <SummitContent onLink={() => onMarkQuest("R6:link")} />}
      </div>
    </div>
  );
}

/* ============== ORIGIN ============== */
function OriginContent() {
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          ▸ operator profile · samar narangi
        </div>
        <h3
          className="mt-3 font-light text-3xl uppercase tracking-tight text-bone"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          engineer of strange quiet machines.
        </h3>
      </div>

      <div className="space-y-4 font-serif text-lg leading-[1.7] text-bone">
        <p>
          I build strange things on purpose and try to keep them <em className="text-amber-300">quiet</em> on the surface. Most of my time goes into the awkward middle between research and product — taking an idea that technically works and shaping it so a real person can use it without a manual.
        </p>
        <p>
          I lean toward problems where the hard part is <span className="rounded bg-amber-300/25 px-1.5 text-bone">taste</span>, not throughput. I'd rather ship one undeniable thing in a year than ten forgettable ones in six months.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        {[
          ["based", "Hyderabad, IN"],
          ["lane", "voice · mobile · web · ai"],
          ["since", "2017"],
          ["fuel", "coffee + reps"],
        ].map(([k, v]) => (
          <div key={k} className="border border-bone/15 bg-bone/[0.03] px-3 py-2">
            <div className="text-[9px] uppercase tracking-[0.3em] text-bone/60">{k}</div>
            <div className="mt-1 text-bone">{v}</div>
          </div>
        ))}
      </div>

      <div className="border border-amber-300/40 bg-amber-300/[0.08] px-3 py-2 font-mono text-xs">
        <div className="text-[9px] uppercase tracking-[0.3em] text-amber-300">[ try ]</div>
        <div className="mt-1 text-bone">drag the planet · click any glowing pin</div>
      </div>
    </div>
  );
}

/* ============== DOCTRINE ============== */
function DoctrineContent({ onRead }: { onRead: () => void }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
        ▸ doctrine · ~/manifesto.txt
      </div>
      <h3 className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        rules I build by.
      </h3>
      <ol
        className="mt-6 space-y-4"
        onMouseEnter={onRead}
      >
        {principles.map((p, i) => (
          <li
            key={i}
            className="flex gap-4 border-l-2 border-amber-300/30 pl-5 hover:border-amber-300"
          >
            <span className="font-mono text-base font-bold text-amber-300">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-serif text-base leading-snug text-bone md:text-lg">
              {p}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ============== MISSIONS ============== */
function MissionsContent({ onInspect }: { onInspect: () => void }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
        ▸ missions · {projects.length} indexed
      </div>
      <h3 className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        six things worth telling.
      </h3>
      <ul className="mt-5 space-y-2">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/work/${p.slug}`}
              onClick={onInspect}
              className="group block h-full border border-bone/15 bg-bone/[0.04] p-4 transition-all hover:border-amber-300/60 hover:bg-amber-300/[0.06]"
            >
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50">
                <span>#{String(i + 1).padStart(2, "0")} · {p.year}</span>
                <span className="text-amber-300/70">{p.status}</span>
              </div>
              <div
                className="mt-2 font-light text-xl uppercase tracking-wider text-bone group-hover:text-amber-300"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {p.name}
              </div>
              <p className="mt-1 font-serif text-sm italic text-bone/95">{p.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-1 font-mono text-[10px] uppercase tracking-widest">
                {p.tags.map((t) => (
                  <span key={t} className="border border-bone/15 bg-bone/[0.04] px-1.5 py-0.5 text-bone">{t}</span>
                ))}
              </div>
              <div className="mt-3 text-right font-mono text-[10px] uppercase tracking-widest text-bone/40 group-hover:text-amber-300">
                open brief ↗
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============== ARMORY ============== */
function ArmoryContent() {
  const groups: { key: keyof typeof stack; label: string; glyph: string; color: string }[] = [
    { key: "languages", label: "languages", glyph: "⌥", color: "border-rose-400/30 bg-rose-400/[0.04]" },
    { key: "frontend", label: "frontend", glyph: "◐", color: "border-amber-300/30 bg-amber-300/[0.04]" },
    { key: "backend", label: "backend", glyph: "◑", color: "border-emerald-400/30 bg-emerald-400/[0.04]" },
    { key: "ai", label: "ai · ml", glyph: "✦", color: "border-violet-400/30 bg-violet-400/[0.04]" },
    { key: "infra", label: "infra", glyph: "⊞", color: "border-sky-400/30 bg-sky-400/[0.04]" },
    { key: "tools", label: "tools", glyph: "⚙", color: "border-bone/15 bg-bone/[0.04]" },
  ];

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
        ▸ armory · what i reach for
      </div>
      <h3 className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        the rack.
      </h3>
      <div className="mt-5 space-y-3">
        {groups.map((g) => (
          <div key={g.key} className={`border ${g.color} p-4`}>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-bone">
              <span>{g.label}</span>
              <span className="font-display text-lg text-bone">{g.glyph}</span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1 font-mono text-xs">
              {stack[g.key].map((item) => (
                <li key={item} className="border border-bone/20 bg-black/40 px-2 py-1 text-bone">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============== COVE ============== */
function CoveContent({ onTuneAll }: { onTuneAll: () => void }) {
  const [tab, setTab] = useState<keyof typeof interests>("anime");
  const [tuned, setTuned] = useState<Set<keyof typeof interests>>(new Set(["anime"]));

  const tabs: { key: keyof typeof interests; label: string; jp: string; color: string }[] = [
    { key: "anime", label: "stories", jp: "物語", color: "border-rose-400/40 bg-rose-400/10 text-rose-200" },
    { key: "games", label: "worlds", jp: "世界", color: "border-violet-400/40 bg-violet-400/10 text-violet-200" },
    { key: "art", label: "vision", jp: "視覚", color: "border-amber-300/40 bg-amber-300/10 text-amber-200" },
    { key: "science", label: "ideas", jp: "知識", color: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" },
  ];

  const items = interests[tab];

  const onTab = (k: keyof typeof interests) => {
    setTab(k);
    setTuned((s) => {
      const nx = new Set(s);
      nx.add(k);
      if (nx.size === 4) onTuneAll();
      return nx;
    });
  };

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
        ▸ frequencies · {tabs.length} channels
      </div>
      <h3 className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        what I tune into off-clock.
      </h3>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onTab(t.key)}
              className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all ${
                isActive
                  ? t.color
                  : "border-bone/15 bg-bone/[0.02] text-bone/60 hover:border-bone/40 hover:text-bone"
              }`}
            >
              <span>{t.label}</span>
              <span className="opacity-60">{t.jp}</span>
              {tuned.has(t.key) && !isActive && <span className="text-emerald-400">✓</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-5 space-y-2"
        >
          {items.map((it, i) => (
            <li key={it.title} className="border border-bone/10 bg-bone/[0.02] p-3">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-bone/50">
                <span>#{String(i + 1).padStart(2, "0")}</span>
                <span className="text-amber-300/70">{it.tag}</span>
              </div>
              <div className="mt-2 font-display text-base uppercase tracking-wider text-bone">
                {it.title}
              </div>
              <p className="mt-1 font-serif text-sm italic leading-snug text-bone">
                {it.note}
              </p>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

/* ============== DECK ============== */
function DeckContent() {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
        ▸ deck · live readouts · updated {now.updated}
      </div>
      <h3 className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        currently building.
      </h3>

      <div className="mt-6 space-y-3">
        <div className="border border-amber-300/40 bg-amber-300/[0.06] p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
            ▸ on the bench
          </div>
          <ul className="mt-4 space-y-3 font-serif text-lg leading-snug text-bone">
            {now.building.map((line, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-sm font-bold text-amber-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-rose-400/40 bg-rose-400/[0.06] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-rose-300">▸ reading</div>
          <ul className="mt-2 space-y-1 font-serif text-base italic text-bone">
            {now.reading.map((b) => <li key={b}>· {b}</li>)}
          </ul>
        </div>
        <div className="border border-violet-400/40 bg-violet-400/[0.06] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300">▸ listening</div>
          <ul className="mt-2 space-y-1 font-serif text-base italic text-bone">
            {now.listening.map((b) => <li key={b}>· {b}</li>)}
          </ul>
        </div>
        <div className="border border-bone/20 bg-bone/[0.04] p-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone">
          node · {now.location} · last update {now.updated}
        </div>
      </div>
    </div>
  );
}

/* ============== SUMMIT ============== */
function SummitContent({ onLink }: { onLink: () => void }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
        ▸ comms · channel open
      </div>
      <h3 className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        ping me back.
      </h3>

      <div className="mt-6 space-y-5">
        <p className="font-serif text-lg leading-[1.7] text-bone">
          Best way to reach me is <em className="text-amber-300">email</em>. I read everything, reply to most. Currently open to interesting full-time roles, contract work, and the occasional cofounder conversation.
        </p>

        <a
          href="mailto:hello@samar.dev"
          onClick={onLink}
          className="group block w-full border-2 border-amber-300/60 bg-amber-300/[0.08] px-5 py-4 text-center font-serif text-2xl italic text-bone hover:bg-amber-300/15 hover:text-amber-300"
        >
          <span className="underline decoration-amber-300/40 underline-offset-4 group-hover:decoration-amber-300">
            hello@samar.dev
          </span>
          <span className="ml-2 font-mono text-sm not-italic text-amber-300">↗</span>
        </a>

        <div className="space-y-2 font-mono text-xs">
          {[
            { label: "github", value: "@samarnarangi", href: "https://github.com/samarnarangi" },
            { label: "x / twitter", value: "@samarnarangi", href: "https://x.com/samarnarangi" },
            { label: "linkedin", value: "samarnarangi", href: "https://linkedin.com/in/samarnarangi" },
            { label: "resume", value: "download.pdf", href: "/resume.pdf" },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex items-center justify-between border border-bone/20 bg-bone/[0.04] px-3 py-2 transition-colors hover:border-amber-300/60 hover:bg-amber-300/[0.08]"
            >
              <span className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.3em] text-bone">{c.label}</span>
                <span className="text-bone group-hover:text-amber-300">{c.value}</span>
              </span>
              <span className="text-bone/60 transition-transform group-hover:translate-x-1 group-hover:text-amber-300">↗</span>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-bone/15 pt-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-bone">
        © 2026 · node HYD-001
      </div>
    </div>
  );
}
