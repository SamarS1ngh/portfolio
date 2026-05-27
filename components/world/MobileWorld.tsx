"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll } from "framer-motion";
import { regions, type Region } from "@/components/world/regions";
import { projects } from "@/content/projects";
import { stack } from "@/content/stack";
import { interests } from "@/content/interests";
import { now } from "@/content/now";

const Stack3D = dynamic(
  () => import("@/components/world/Stack3D").then((m) => m.Stack3D),
  { ssr: false },
);

// Plain-language nav · maps to sci-fi region codes
const NAV: { code: string; label: string }[] = [
  { code: "R0", label: "about" },
  { code: "R2", label: "work" },
  { code: "R3", label: "skills" },
  { code: "R4", label: "interests" },
  { code: "R6", label: "contact" },
];

// Plain-language overrides for each region · used when plainMode = true
type PlainCopy = { region: string; headline: string; biome: string };
const PLAIN: Record<string, PlainCopy> = {
  R0: { region: "ABOUT",     headline: "samar singh",          biome: "a quick intro" },
  R1: { region: "BENCH LOG", headline: "what's on the bench.", biome: "what I'm working on this week" },
  R2: { region: "WORK",      headline: "selected projects.",   biome: "things I've shipped" },
  R3: { region: "SKILLS",    headline: "what I reach for.",    biome: "tools I use" },
  R4: { region: "INTERESTS", headline: "off the clock.",       biome: "what I'm into outside of work" },
  R5: { region: "NOW",       headline: "currently building.",  biome: "live status · this month" },
  R6: { region: "CONTACT",   headline: "ping me back.",        biome: "get in touch" },
};

const PLAIN_KEY = "mobile.plainMode";


export function MobileWorld() {
  const { scrollYProgress } = useScroll();
  const progressRef = useRef(0);
  const idleRef = useRef(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  // default ON · plain language for first-time / non-tech users; toggle to sci-fi
  const [plainMode, setPlainMode] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(PLAIN_KEY) : null;
    if (saved === "0") setPlainMode(false);
    if (saved === "1") setPlainMode(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PLAIN_KEY, plainMode ? "1" : "0");
    }
  }, [plainMode]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      progressRef.current = v;
      const idx = Math.min(regions.length - 1, Math.floor(v * regions.length));
      setActiveIdx((prev) => (prev === idx ? prev : idx));
    });
    return () => unsub();
  }, [scrollYProgress]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const r = regions[activeIdx];

  return (
    <>
      {/* === FIXED BACKDROP === */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#02050f]">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 12% 22%, #fff 0, transparent 1px),
              radial-gradient(1px 1px at 78% 14%, #fff 0, transparent 1px),
              radial-gradient(1px 1px at 33% 67%, #fff 0, transparent 1px),
              radial-gradient(1px 1px at 86% 78%, #fff 0, transparent 1px),
              radial-gradient(1px 1px at 50% 35%, #fff 0, transparent 1px),
              radial-gradient(1px 1px at 22% 88%, #fff 0, transparent 1px),
              radial-gradient(2px 2px at 65% 50%, #fff 0, transparent 1px),
              radial-gradient(1px 1px at 95% 45%, #fff 0, transparent 1px),
              radial-gradient(1px 1px at 5% 50%, #fff 0, transparent 1px)
            `,
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: `radial-gradient(ellipse at center, ${r.tint} 0%, transparent 70%)`,
          }}
          transition={{ duration: 1.4 }}
        />
        {!reducedMotion && (
          <div className="absolute inset-0 opacity-[0.18]">
            <Stack3D
              progressRef={progressRef}
              onPinClick={() => {}}
              activePin={null}
              idleRef={idleRef}
            />
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,5,15,0.55) 0%, rgba(2,5,15,0.20) 30%, rgba(2,5,15,0.20) 70%, rgba(2,5,15,0.55) 100%)",
          }}
        />
      </div>

      {/* === CONTENT === */}
      <main className="relative z-10 min-h-screen text-bone">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-bone/10 bg-[#02050f]/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/80">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              samar.dev
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPlainMode((s) => !s)}
                aria-pressed={plainMode}
                title={plainMode ? "switch to sci-fi mode" : "switch to plain mode"}
                className="rounded border border-bone/20 bg-bone/[0.04] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/75 hover:border-amber-300/45 hover:text-amber-300"
              >
                {plainMode ? "plain" : "sci-fi"} ⇄
              </button>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
                {r.glyph} {r.code}
              </span>
            </div>
          </div>
          {/* Plain-label nav · maps to sci-fi sections */}
          <nav
            aria-label="primary"
            className="flex items-center gap-1 overflow-x-auto border-t border-bone/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em]"
          >
            {NAV.map((n) => {
              const isActive = regions[activeIdx]?.code === n.code;
              return (
                <a
                  key={n.code}
                  href={`#${n.code}`}
                  className={`shrink-0 rounded border px-3 py-1.5 transition ${
                    isActive
                      ? "border-amber-300/60 bg-amber-300/[0.12] text-amber-200"
                      : "border-bone/15 bg-bone/[0.03] text-bone/75 hover:border-amber-300/40 hover:text-amber-300"
                  }`}
                >
                  {n.label}
                </a>
              );
            })}
          </nav>
        </header>

        {/* Hero */}
        <section className="px-5 pt-10 pb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
            ▸ {plainMode ? "hi, I'm samar singh" : "operator profile · samar singh"}
          </div>
          <h1
            className="mt-3 font-light text-3xl uppercase tracking-tight text-bone"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            full-stack · mobile · ai.
          </h1>
          <p className="mt-4 font-sans text-[15px] leading-relaxed text-bone">
            Based in Hyderabad. Building websites, mobile apps, and AI-powered products since 2024.
          </p>
          <nav className="mt-6 grid grid-cols-2 gap-2">
            {regions.map((reg) => (
              <a
                key={reg.code}
                href={`#${reg.code}`}
                className="flex items-center gap-2 border border-bone/15 bg-bone/[0.04] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-bone backdrop-blur-sm hover:border-amber-300/40 hover:bg-amber-300/[0.10] hover:text-amber-300"
              >
                <span className="text-amber-300">{reg.glyph}</span>
                <span className="truncate">{plainMode ? PLAIN[reg.code].region : reg.region}</span>
              </a>
            ))}
          </nav>
        </section>

        {/* Sections — chapter break + intermission band + trimmed heavy content */}
        {regions.map((reg, i) => {
          const copy = plainMode ? PLAIN[reg.code] : { region: reg.region, headline: reg.headline, biome: reg.biome };
          return (
          <div key={reg.code}>
            <section
              id={reg.code}
              className="relative overflow-hidden border-x border-amber-300/15 bg-[#02050f]/70 backdrop-blur-sm"
            >
              {/* Soft tinted backdrop per section */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.40]"
                style={{
                  background: `linear-gradient(180deg, ${reg.tint} 0%, transparent 30%, transparent 70%, ${reg.tint} 100%)`,
                }}
                aria-hidden
              />

              {/* Top scan-rail · corner ticks · code badge */}
              <div className="relative" aria-hidden>
                <div className="h-px bg-gradient-to-r from-amber-300/0 via-amber-300/60 to-amber-300/0" />
                <div className="absolute inset-x-0 -top-px flex justify-between px-4">
                  <span className="h-1.5 w-1.5 -translate-y-1/2 rotate-45 border border-amber-300/60 bg-[#02050f]" />
                  <span className="h-1.5 w-1.5 -translate-y-1/2 rotate-45 border border-amber-300/60 bg-[#02050f]" />
                </div>
                <div className="flex items-center justify-between px-5 pt-3 font-mono text-[9px] uppercase tracking-[0.45em] text-amber-300/75">
                  <span>{reg.code}</span>
                  <span className="text-bone/45">
                    {String(i + 1).padStart(2, "0")} / {String(regions.length).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* CHAPTER BREAK */}
              <div className="relative px-5 pt-8 pb-6 text-center">
                {/* Big hex glyph */}
                <svg viewBox="0 0 64 56" className="mx-auto h-14 w-16">
                  <polygon
                    points="32,3 60,17 60,39 32,53 4,39 4,17"
                    fill="rgba(0,0,0,0.55)"
                    stroke="#ffd54a"
                    strokeWidth="1.4"
                    strokeOpacity="0.75"
                  />
                  <polygon
                    points="32,11 52,21 52,35 32,45 12,35 12,21"
                    fill="none"
                    stroke="#ffd54a"
                    strokeWidth="0.8"
                    strokeOpacity="0.35"
                  />
                  <text x="32" y="36" textAnchor="middle" fill="#ffd54a" fontSize="22" fontFamily="serif">
                    {reg.glyph}
                  </text>
                </svg>

                <h2
                  className="mt-5 font-light text-[30px] leading-[1.05] uppercase tracking-tight text-bone"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {copy.region}
                </h2>
                <p className="mt-3 font-mono text-[13px] leading-relaxed text-bone tracking-normal">
                  {copy.headline}
                </p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/80">
                  · {copy.biome} ·
                </p>
              </div>

              {/* CONTENT */}
              <div className="relative px-5 pb-10 text-left">
                <TrimmedContent kind={reg.contentKind} />
              </div>

              {/* Bottom scan-rail */}
              <div className="relative" aria-hidden>
                <div className="h-px bg-gradient-to-r from-amber-300/0 via-amber-300/40 to-amber-300/0" />
                <div className="absolute inset-x-0 top-0 flex justify-between px-4">
                  <span className="h-1.5 w-1.5 -translate-y-1/2 rotate-45 border border-amber-300/45 bg-[#02050f]" />
                  <span className="h-1.5 w-1.5 -translate-y-1/2 rotate-45 border border-amber-300/45 bg-[#02050f]" />
                </div>
              </div>
            </section>

            {/* INTERMISSION BAND — full-width breather between chapters */}
            {i < regions.length - 1 && (
              <div
                className="relative px-5 py-14"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent 0 14px, rgba(255,213,74,0.04) 14px 15px)",
                }}
                aria-hidden
              >
                <div className="mx-auto flex max-w-md flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-12 bg-amber-300/40" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-amber-300/70">
                      transit
                    </span>
                    <span className="h-px w-12 bg-amber-300/40" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-bone/55">
                    <span className="text-amber-300/80">{reg.glyph}</span>
                    <span className="text-bone/40">→</span>
                    <span className="text-amber-300/80">{regions[i + 1].glyph}</span>
                  </div>
                  <div className="text-center font-mono text-[9px] uppercase tracking-[0.35em] text-bone/45">
                    next · {plainMode ? PLAIN[regions[i + 1].code].region : regions[i + 1].region}
                  </div>
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span className="h-3 w-px bg-amber-300/40" />
                    <span className="h-1.5 w-1.5 rotate-45 border border-amber-300/45 bg-[#02050f]" />
                    <span className="h-3 w-px bg-amber-300/40" />
                  </div>
                </div>
              </div>
            )}
          </div>
          );
        })}

        {/* Footer */}
        <footer className="border-t border-bone/15 px-5 py-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60">
          © 2026 · samar singh · node HYD-001
        </footer>
      </main>
    </>
  );
}

function TrimmedContent({ kind }: { kind: Region["contentKind"] }) {
  if (kind === "origin") return <OriginTrim />;
  if (kind === "notebook") return <NotebookTrim />;
  if (kind === "missions") return <MissionsTrim />;
  if (kind === "armory") return <ArmoryTrim />;
  if (kind === "cove") return <CoveTrim />;
  if (kind === "deck") return <DeckTrim />;
  if (kind === "summit") return <SummitTrim />;
  return null;
}

function OriginTrim() {
  return (
    <div className="space-y-4 font-sans text-[16px] leading-relaxed text-bone">
      <p>
        I build websites, mobile apps, and AI-powered products. Most time goes into the messy middle — taking an idea that technically works and shaping it so a regular person can actually use it.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[["based", "Hyderabad, IN"], ["since", "2024"]].map(([k, v]) => (
          <div key={k} className="border border-bone/20 bg-bone/[0.04] px-3 py-2.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/65">{k}</div>
            <div className="mt-1 font-sans text-[15px] font-medium text-bone">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotebookTrim() {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
          current focus
        </div>
        <p className="font-sans text-[15px] leading-relaxed text-bone">{now.focus}</p>
      </div>
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
          building
        </div>
        <ul className="space-y-2">
          {now.building.slice(0, 3).map((b) => (
            <li key={b.title} className="border-l-2 border-amber-300/50 pl-3">
              <span className="font-sans text-[15px] text-bone">{b.title}</span>
              <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-amber-300/60">
                · {b.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MissionsTrim() {
  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <Link
          key={p.slug}
          href={`/work/${p.slug}`}
          className="block rounded border border-bone/15 bg-bone/[0.03] p-4 backdrop-blur-sm hover:border-amber-300/40 hover:bg-amber-300/[0.06]"
        >
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-bone/40">
            <span>{p.year}</span>
            <span className={statusColor(p.status)}>{p.status}</span>
          </div>
          <div
            className="mt-2 font-light text-xl uppercase tracking-tight text-bone"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {p.name}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-bone/55">
            {p.role}
          </div>
          <p className="mt-2 font-sans text-[14px] leading-snug text-bone line-clamp-2">
            {p.blurb}
          </p>
          <div className="mt-3 flex flex-wrap gap-1 font-mono text-[9px] uppercase tracking-widest">
            {p.tags.slice(0, 3).map((t) => (
              <span key={t} className="border border-bone/15 bg-bone/[0.04] px-1.5 py-0.5 text-bone/65">
                {t}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ArmoryTrim() {
  const lanes: { label: string; items: readonly string[] }[] = [
    { label: "languages", items: stack.languages },
    { label: "frontend", items: stack.frontend.slice(0, 6) },
    { label: "backend", items: stack.backend.slice(0, 6) },
    { label: "ai", items: stack.ai.slice(0, 6) },
    { label: "infra", items: stack.infra.slice(0, 6) },
    { label: "tools", items: stack.tools },
  ];
  return (
    <div className="space-y-5">
      {lanes.map((l) => (
        <div key={l.label}>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-amber-300">
            {l.label}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {l.items.map((it) => (
              <span
                key={it}
                className="rounded border border-bone/25 bg-bone/[0.08] px-2.5 py-1.5 font-mono text-[13px] text-bone"
              >
                {it}
              </span>
            ))}
          </div>
        </div>
      ))}
      <p className="pt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/55">
        full element rack on desktop ↗
      </p>
    </div>
  );
}

function CoveTrim() {
  const rows: { label: string; pick: { title: string } | undefined }[] = [
    { label: "watching", pick: interests.anime[0] },
    { label: "reading",  pick: interests.manga[0] },
    { label: "playing",  pick: interests.games[0] },
    { label: "listening", pick: interests.music[0] },
    { label: "shows",    pick: interests.shows[0] },
  ];
  return (
    <ul className="divide-y divide-bone/10 border border-bone/12 bg-bone/[0.03]">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center justify-between gap-3 px-3 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/65">
            {r.label}
          </span>
          <span className="text-right font-sans text-[15px] text-bone line-clamp-1">
            {r.pick?.title}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DeckTrim() {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
          on deck
        </div>
        <ul className="space-y-2">
          {now.onDeck.map((d) => (
            <li key={d} className="flex gap-2 font-sans text-[15px] leading-relaxed text-bone">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/70" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-bone/10 pt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/45">
        updated · {now.updated}
      </div>
    </div>
  );
}

function SummitTrim() {
  return (
    <div className="space-y-3">
      <a
        href="mailto:hello@samar.dev"
        className="flex items-center gap-3 rounded border border-bone/20 bg-bone/[0.06] px-4 py-3.5 transition hover:border-amber-300/45 hover:bg-amber-300/[0.06]"
      >
        <GmailIcon />
        <span className="flex-1 font-sans text-[15px] text-bone/95">hello@samar.dev</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/45">gmail</span>
      </a>
      <a
        href="/resume.pdf"
        download
        className="flex items-center justify-between rounded border border-bone/20 bg-bone/[0.05] px-4 py-3 font-mono text-[12px] uppercase tracking-widest text-bone/90 hover:border-amber-300/45 hover:text-amber-300"
      >
        <span className="flex items-center gap-2">
          <span className="text-amber-300">↓</span>
          download resume
        </span>
        <span className="font-mono text-[10px] tracking-widest text-bone/45">pdf</span>
      </a>
      <ul className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-widest">
        {[
          { key: "github",   href: "https://github.com/samarnarangi",      label: "github"   },
          { key: "x",        href: "https://x.com/samarnarangi",           label: "x"        },
          { key: "linkedin", href: "https://linkedin.com/in/samarnarangi", label: "linkedin" },
        ].map((l) => (
          <li key={l.key}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded border border-bone/15 bg-bone/[0.04] px-3 py-2 text-bone/85"
            >
              <SocialIcon name={l.key} />
              <span>{l.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GmailIcon() {
  return (
    <svg viewBox="0 0 24 18" aria-hidden className="h-5 w-7 shrink-0">
      <path d="M2 18h3V9.5L0 5.75V16a2 2 0 0 0 2 2Z" fill="#4285F4" />
      <path d="M19 18h3a2 2 0 0 0 2-2V5.75L19 9.5V18Z" fill="#34A853" />
      <path d="M19 2v7.5l5-3.75V3a2 2 0 0 0-2-2 2 2 0 0 0-1.2.4L19 2Z" fill="#FBBC04" />
      <path d="M5 9.5V2l7 5.25L19 2v7.5L12 14.75 5 9.5Z" fill="#EA4335" />
      <path d="M0 3v2.75L5 9.5V2L3.2 1.4A2 2 0 0 0 2 1a2 2 0 0 0-2 2Z" fill="#C5221F" />
    </svg>
  );
}

function SocialIcon({ name }: { name: string }) {
  const c = "h-3.5 w-3.5 shrink-0 fill-current text-bone/85";
  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={c}>
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.26 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56 4.57-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5Z"/>
      </svg>
    );
  }
  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={c}>
        <path d="M18.244 2H21.5l-7.55 8.62L23 22h-6.9l-5.4-7.06L4.5 22H1.24l8.07-9.22L1 2h7.05l4.88 6.45L18.24 2Zm-1.21 18h1.86L7.05 4h-1.99l11.97 16Z"/>
      </svg>
    );
  }
  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={c}>
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.22 0Z"/>
      </svg>
    );
  }
  return null;
}

function statusColor(s: string) {
  switch (s) {
    case "shipping": return "text-amber-300";
    case "active": return "text-emerald-300";
    case "shipped": return "text-sky-300";
    default: return "text-bone/50";
  }
}
