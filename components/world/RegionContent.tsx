"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/content/projects";
import { stack } from "@/content/stack";
import { interests } from "@/content/interests";
import { now } from "@/content/now";


export function RegionContent({
  kind,
  onMarkQuest,
}: {
  kind:
    | "origin"
    | "notebook"
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
      className="pointer-events-auto fixed right-2 top-1/2 z-20 w-[min(94vw,480px)] max-h-[78vh] -translate-y-1/2 overflow-hidden border border-bone/15 shadow-[0_30px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl backdrop-saturate-200 sm:right-4 md:right-6 lg:w-[min(92vw,520px)] xl:right-8 xl:w-[min(92vw,540px)] xl:max-h-[72vh]"
      style={{
        background:
          "linear-gradient(to bottom right, rgba(255,255,255,0.10), rgba(255,255,255,0.04), transparent), rgba(4,6,14,0.85)",
      }}
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
        className="overflow-y-auto px-5 py-6 sm:px-6 sm:py-7 md:px-8"
        style={{ maxHeight: "calc(78vh - 42px)" }}
      >
        <RegionContentInner kind={kind} onMarkQuest={onMarkQuest} />
      </div>
    </div>
  );
}

export function RegionContentInner({
  kind,
  onMarkQuest,
}: {
  kind: "origin" | "notebook" | "missions" | "armory" | "cove" | "deck" | "summit";
  onMarkQuest: (id: string) => void;
}) {
  return (
    <>
      {kind === "origin" && <OriginContent />}
      {kind === "notebook" && <NotebookContent onRead={() => onMarkQuest("R1:read")} />}
      {kind === "missions" && <MissionsContent onInspect={() => onMarkQuest("R2:inspect")} />}
      {kind === "armory" && <ArmoryContent />}
      {kind === "cove" && <CoveContent onTuneAll={() => onMarkQuest("R4:tune")} />}
      {kind === "deck" && <DeckContent />}
      {kind === "summit" && <SummitContent onLink={() => onMarkQuest("R6:link")} />}
    </>
  );
}

/* ============== ORIGIN ============== */
function OriginContent() {
  const lane = [
    "android / ios",
    "react native",
    "next.js",
    "nodejs",
    "full-stack saas",
    "ai automation",
    "n8n",
    "mcp server",
    "agentic ai",
    "machine learning",
    "RAG / pgvector",
  ];
  const fuel = [
    "anime", "music", "video games", "sleep", "travelling", "chess", "manga", "manhwa",
    "gym", "diet coke", "late night walks", "cooking", "sketch", "meditation",
  ];
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          ▸ operator profile · samar singh
        </div>
        <h3
          className="mt-3 font-light text-3xl uppercase tracking-tight text-bone"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          full-stack · mobile · ai.
        </h3>
      </div>

      <div className="space-y-4 font-sans text-[15px] leading-relaxed text-bone">
        <p>
          I build websites, mobile apps, and AI-powered products. Most of my time goes into the messy middle — taking an idea that technically works and shaping it so a regular person can actually use it without a manual.
        </p>
        <p>
          I&apos;d rather ship one thing that&apos;s really good than ten things that are okay. The hard part is usually <span className="rounded bg-amber-300/25 px-1.5 text-bone">taste</span>, not speed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          ["based", "Hyderabad, IN"],
          ["since", "2024"],
        ].map(([k, v]) => (
          <div key={k} className="border border-bone/20 bg-bone/[0.04] px-3 py-2.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70">{k}</div>
            <div className="mt-1 font-sans text-[15px] font-medium text-bone">{v}</div>
          </div>
        ))}
      </div>

      {/* LANE — angular amber chips · work-mode */}
      <div className="border-l-2 border-amber-300/60 pl-3">
        <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-300">
          <span>▸ lane</span>
          <span className="text-amber-300/40">·</span>
          <span className="text-amber-300/60">what I build</span>
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          {lane.map((l) => (
            <span
              key={l}
              className="border border-amber-300/40 bg-amber-300/[0.10] px-2 py-1 uppercase tracking-wider text-amber-100"
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* FUEL — rounded emerald pills · off-duty */}
      <div className="border-l-2 border-emerald-300/60 pl-3">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300">
          <span>◯ fuel</span>
          <span className="text-emerald-300/50">·</span>
          <span className="text-emerald-300/80">what keeps me going</span>
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[12px]">
          {fuel.map((f) => (
            <span
              key={f}
              className="rounded-full border border-emerald-300/50 bg-emerald-300/[0.15] px-3 py-1 text-emerald-50"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="border border-amber-300/40 bg-amber-300/[0.08] px-3 py-2 font-mono text-xs">
        <div className="text-[9px] uppercase tracking-[0.3em] text-amber-300">[ try ]</div>
        <div className="mt-1 text-bone">drag the planet · click any glowing pin</div>
      </div>
    </div>
  );
}

/* ============== NOTEBOOK (now + lab) ============== */
function NotebookContent({ onRead }: { onRead: () => void }) {
  return (
    <div onMouseEnter={onRead} className="space-y-8">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          ▸ field notes · ~/bench.log
        </div>
        <h3
          className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          what's on the bench.
        </h3>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-bone">
          A live log of what I'm working on right now. What I'm building, what I'm trying, what didn't work.
        </p>
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          last sync · {now.updated}
        </div>
      </div>

      {/* FOCUS */}
      <div className="border border-amber-300/40 bg-amber-300/[0.10] px-4 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">this week</div>
        <div className="mt-1.5 font-sans text-[16px] leading-relaxed text-bone">{now.focus}</div>
      </div>

      {/* BUILDING */}
      <Section title="building right now">
        {now.building.map((b) => (
          <Row key={b.title} title={b.title} note={b.note} badge={b.status} badgeTone="amber" />
        ))}
      </Section>

      {/* TRYING OUT */}
      <Section title="trying out" subtitle="side experiments">
        {now.experiments.map((e) => (
          <Row key={e.title} title={e.title} note={e.note} badge="exp" badgeTone="sky" />
        ))}
      </Section>

      {/* DIDN'T WORK */}
      <Section title="didn't work" subtitle="things I tried and dropped">
        {now.deadEnds.map((d) => (
          <Row key={d.title} title={d.title} note={d.note} badge="x" badgeTone="rose" />
        ))}
      </Section>

      {/* COMING NEXT */}
      <Section title="coming next">
        <ul className="space-y-2">
          {now.onDeck.map((d) => (
            <li key={d} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-bone">
              <span className="mt-1 shrink-0 text-amber-300">▸</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-bone/25 pl-4">
      <div className="mb-3 flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.3em]">
        <span className="text-bone">▸ {title}</span>
        {subtitle && (
          <>
            <span className="text-bone/40">·</span>
            <span className="text-bone/70">{subtitle}</span>
          </>
        )}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Row({
  title,
  note,
  badge,
  badgeTone,
}: {
  title: string;
  note: string;
  badge: string;
  badgeTone: "amber" | "sky" | "rose";
}) {
  const toneClasses: Record<typeof badgeTone, string> = {
    amber: "border-amber-300/50 text-amber-200 bg-amber-300/[0.10]",
    sky: "border-sky-300/50 text-sky-200 bg-sky-300/[0.10]",
    rose: "border-rose-400/50 text-rose-200 bg-rose-400/[0.10]",
  };
  return (
    <div className="border border-bone/15 bg-bone/[0.04] px-3.5 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="font-sans text-[15px] font-medium leading-snug text-bone">
          {title}
        </div>
        <span
          className={`mt-0.5 shrink-0 border px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.25em] ${toneClasses[badgeTone]}`}
        >
          {badge}
        </span>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-bone/85">{note}</p>
    </div>
  );
}

/* ============== MISSIONS ============== */
function MissionsContent({ onInspect }: { onInspect: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          ▸ projects · {projects.length} in the list
        </div>
        <h3
          className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Things I've built.
        </h3>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-bone">
          Click any card to read the full story — what the problem was, the calls I made, what shipped.
        </p>

        {/* tap affordance cue · loud + pulsing */}
        <div className="mt-4 flex items-center gap-2 rounded border-2 border-amber-300/55 bg-amber-300/[0.10] px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.28em] text-amber-100">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_8px_#ffd54a] animate-pulse" />
          tap any card below
          <span className="ml-auto animate-pulse text-amber-200" aria-hidden>
            ↓
          </span>
        </div>
      </div>

      <ul className="space-y-3">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/work/${p.slug}`}
              onClick={onInspect}
              className="group relative block overflow-hidden border-2 border-bone/15 bg-bone/[0.04] p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300/60 hover:bg-amber-300/[0.06] hover:shadow-[0_8px_24px_-8px_rgba(255,213,107,0.35)]"
            >
              {/* hover sweep · subtle shine to signal interactivity */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-500 group-hover:translate-x-full"
              />

              {/* persistent tap arrow · top-right corner */}
              <span
                aria-hidden
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded border border-amber-300/40 bg-amber-300/[0.10] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-amber-200 transition group-hover:border-amber-300/80 group-hover:bg-amber-300/25 group-hover:text-amber-100"
              >
                tap ↗
              </span>

              <div className="flex items-center justify-between pr-16 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60">
                <span>#{String(i + 1).padStart(2, "0")} · {p.year}</span>
                <span className="text-amber-300/80">{p.status}</span>
              </div>
              <div
                className="mt-2 font-light text-xl uppercase tracking-wider text-bone group-hover:text-amber-300"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {p.name}
              </div>
              <p className="mt-1.5 font-sans text-[14px] leading-relaxed text-bone">{p.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-1 font-mono text-[10px] uppercase tracking-widest">
                {p.tags.map((t) => (
                  <span key={t} className="border border-bone/20 bg-bone/[0.06] px-1.5 py-0.5 text-bone">{t}</span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-end gap-1 font-mono text-[10px] uppercase tracking-widest text-amber-300/80 group-hover:text-amber-300">
                <span>read the story</span>
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
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
  const groups: { key: keyof typeof stack; label: string; sub: string; glyph: string; color: string }[] = [
    { key: "languages", label: "languages", sub: "what I write code in", glyph: "⌥", color: "border-rose-400/40 bg-rose-400/[0.06]" },
    { key: "frontend", label: "frontend", sub: "what users see and click", glyph: "◐", color: "border-amber-300/40 bg-amber-300/[0.06]" },
    { key: "backend", label: "backend", sub: "the server side", glyph: "◑", color: "border-emerald-400/40 bg-emerald-400/[0.06]" },
    { key: "ai", label: "AI", sub: "anything model-based", glyph: "✦", color: "border-violet-400/40 bg-violet-400/[0.06]" },
    { key: "infra", label: "infrastructure", sub: "where it runs", glyph: "⊞", color: "border-sky-400/40 bg-sky-400/[0.06]" },
    { key: "tools", label: "tools", sub: "daily drivers", glyph: "⚙", color: "border-bone/20 bg-bone/[0.06]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          ▸ toolkit · what I reach for
        </div>
        <h3
          className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          The toolkit.
        </h3>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-bone">
          Tools I actually use on the daily. Grouped by job, not by hype.
        </p>
      </div>

      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.key} className={`border ${g.color} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone">{g.label}</div>
                <div className="mt-0.5 font-sans text-[13px] text-bone/75">{g.sub}</div>
              </div>
              <span className="font-display text-lg text-bone/80">{g.glyph}</span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5 font-mono text-[12px]">
              {stack[g.key].map((item) => (
                <li key={item} className="border border-bone/25 bg-black/40 px-2 py-1 text-bone">
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

  const tabs: { key: keyof typeof interests; label: string; color: string }[] = [
    { key: "anime", label: "anime", color: "border-rose-400/50 bg-rose-400/15 text-rose-200" },
    { key: "manga", label: "manga · manhwa", color: "border-amber-300/50 bg-amber-300/15 text-amber-200" },
    { key: "games", label: "games", color: "border-violet-400/50 bg-violet-400/15 text-violet-200" },
    { key: "music", label: "music", color: "border-emerald-400/50 bg-emerald-400/15 text-emerald-200" },
    { key: "shows", label: "shows", color: "border-sky-400/50 bg-sky-400/15 text-sky-200" },
  ];

  const items = interests[tab];

  const onTab = (k: keyof typeof interests) => {
    setTab(k);
    setTuned((s) => {
      const nx = new Set(s);
      nx.add(k);
      if (nx.size === 5) onTuneAll();
      return nx;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          ▸ off-clock · what I'm into
        </div>
        <h3
          className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          When I'm not coding.
        </h3>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-bone">
          Tap a tab to see what I'm into in that lane.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onTab(t.key)}
              className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-all ${
                isActive
                  ? t.color
                  : "border-bone/20 bg-bone/[0.04] text-bone/75 hover:border-bone/50 hover:text-bone"
              }`}
            >
              <span>{t.label}</span>
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
          className="space-y-2.5"
        >
          {items.map((it, i) => (
            <li key={it.title} className="border border-bone/15 bg-bone/[0.04] px-3.5 py-2.5">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-bone/60">
                <span>#{String(i + 1).padStart(2, "0")}</span>
                <span className="text-amber-300/80">{it.tag}</span>
              </div>
              <div className="mt-1.5 font-sans text-[15px] font-medium text-bone">
                {it.title}
              </div>
              {it.note && (
                <p className="mt-1 font-sans text-[14px] leading-relaxed text-bone/85">
                  {it.note}
                </p>
              )}
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

/* ============== DECK — quick glance ============== */
function DeckContent() {
  const shipped = projects.filter((p) => p.status === "shipped").length;
  const active = projects.filter((p) => p.status === "active" || p.status === "shipping").length;
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          ▸ status · quick glance · updated {now.updated}
        </div>
        <h3
          className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          The short version.
        </h3>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-bone">
          One-glance snapshot. Where I am, what I&apos;m on, what I&apos;m open to.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        {[
          ["projects shipped", String(shipped)],
          ["currently active", String(active)],
          ["based in", now.location.split(",")[0]],
        ].map(([k, v]) => (
          <div key={k} className="border border-bone/20 bg-bone/[0.04] px-3 py-2.5">
            <div className="text-[9px] uppercase tracking-[0.3em] text-bone/60">{k}</div>
            <div className="mt-1 font-sans text-[15px] font-medium text-bone">{v}</div>
          </div>
        ))}
      </div>

      {/* This week */}
      <div className="border border-amber-300/40 bg-amber-300/[0.10] px-4 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">this week</div>
        <div className="mt-1.5 font-sans text-[16px] leading-relaxed text-bone">{now.focus}</div>
      </div>

      {/* What I'm open to */}
      <div className="border-l-2 border-emerald-300/60 pl-4">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300">
          ▸ open to · what I&apos;ll say yes to
        </div>
        <ul className="space-y-2 font-sans text-[14px] leading-relaxed text-bone">
          <li className="flex gap-2.5"><span className="text-emerald-300">▸</span><span>Full-time roles that ship things real users touch.</span></li>
          <li className="flex gap-2.5"><span className="text-emerald-300">▸</span><span>Contract work — web, mobile, or AI builds with a clear endpoint.</span></li>
          <li className="flex gap-2.5"><span className="text-emerald-300">▸</span><span>Cofounder conversations if the idea is small enough to ship and big enough to matter.</span></li>
        </ul>
      </div>

      <div className="border border-bone/20 bg-bone/[0.04] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/85">
        node · {now.location} · last update {now.updated}
      </div>
    </div>
  );
}

/* ============== SUMMIT — contact ============== */
function SummitContent({ onLink }: { onLink: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          ▸ contact · reach out
        </div>
        <h3
          className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Say hi.
        </h3>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-bone">
          Best way is email. I read everything and reply to most. Right now I&apos;m open to full-time roles, contract work, and the occasional cofounder chat.
        </p>
      </div>

      <a
        href="mailto:singhsamar2002@gmail.com"
        onClick={onLink}
        className="group block w-full border-2 border-amber-300/60 bg-amber-300/[0.10] px-5 py-4 text-center font-sans text-[20px] text-bone hover:bg-amber-300/20 hover:text-amber-300"
      >
        <span className="underline decoration-amber-300/40 underline-offset-4 group-hover:decoration-amber-300">
          singhsamar2002@gmail.com
        </span>
        <span className="ml-2 font-mono text-sm text-amber-300">↗</span>
      </a>

      <div className="space-y-2">
        {[
          { label: "github", value: "@SamarS1ngh", href: "https://github.com/SamarS1ngh" },
          { label: "linkedin", value: "samarsingh14", href: "https://www.linkedin.com/in/samarsingh14/" },
          { label: "x / twitter", value: "@Samar_S1ngh", href: "https://x.com/Samar_S1ngh" },
          { label: "instagram", value: "@samar_sin_", href: "https://www.instagram.com/samar_sin_/" },
          { label: "resume", value: "download PDF", href: "/resume.pdf" },
        ].map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="group flex items-center justify-between border border-bone/20 bg-bone/[0.04] px-3.5 py-2.5 transition-colors hover:border-amber-300/60 hover:bg-amber-300/[0.10]"
          >
            <span className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70">{c.label}</span>
              <span className="mt-0.5 font-sans text-[15px] text-bone group-hover:text-amber-300">{c.value}</span>
            </span>
            <span className="text-bone/60 transition-transform group-hover:translate-x-1 group-hover:text-amber-300">↗</span>
          </a>
        ))}
      </div>

      <div className="border-t border-bone/20 pt-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-bone/80">
        © 2026 · node HYD-001
      </div>
    </div>
  );
}
