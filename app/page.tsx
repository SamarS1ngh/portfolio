"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { projects } from "@/content/projects";
import { regions } from "@/components/world/regions";
import { RegionContent } from "@/components/world/RegionContent";
import { CommandPalette } from "@/components/world/CommandPalette";
import { CursorTrail } from "@/components/world/CursorTrail";
import { loadSaved, saveState, readUrlRegion, writeUrlRegion } from "@/lib/persist";

const Stack3D = dynamic(() => import("@/components/world/Stack3D").then((m) => m.Stack3D), { ssr: false });
const MobileWorld = dynamic(() => import("@/components/world/MobileWorld").then((m) => m.MobileWorld), { ssr: false });

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

type LogEntry = { id: number; t: string; text: string; kind: "info" | "ok" | "warn" | "cmd" };
let entryCounter = 0;

// scroll height per region — gives breathing room for story
const REGION_HEIGHT_VH = 180;

export default function World() {
  // Switch to mobile layout below 1024px — single-axis scroll, no 3D, simpler nav.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (isMobile === null) return null; // wait for hydration to avoid flashing the wrong layout
  if (isMobile) return <MobileWorld />;

  return <DesktopWorld />;
}

function DesktopWorld() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });

  // Continuous fractional region position (0..regions.length).
  // Used to drive per-region opacity crossfades without state-flip snap.
  const fProgress = useTransform(scrollYProgress, (v) => v * regions.length);

  const [chamberIdx, setChamberIdx] = useState(0);
  const [scrub, setScrub] = useState(0);
  const [activePin, setActivePin] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [discovered, setDiscovered] = useState<number | null>(null);
  const [showContent, setShowContent] = useState(true);
  const [konamiUnlocked, setKonamiUnlocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const progressRef = useRef(0);
  const lastIdxRef = useRef(0);
  const idleRef = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const konamiBuf = useRef<string[]>([]);
  const hydratedRef = useRef(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    const total = regions.length;
    const idx = Math.min(total - 1, Math.floor(v * total));
    const local = (v * total) % 1;
    setScrub(local);

    // poke idle
    idleRef.current = false;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => { idleRef.current = true; }, 6000);

    if (idx !== lastIdxRef.current) {
      lastIdxRef.current = idx;
      setChamberIdx(idx);
      writeUrlRegion(idx);
      setVisited((vs) => {
        if (vs.has(idx)) {
          pushLog(regions[idx].enterEvent, "info");
          return vs;
        }
        setDiscovered(idx);
        pushLog(`discovered · ${regions[idx].region}`, "ok");
        return new Set([...vs, idx]);
      });
    }
  });

  const pushLog = useCallback((text: string, kind: LogEntry["kind"] = "info") => {
    setLog((s) => [...s.slice(-40), { id: ++entryCounter, t: nowT(), text, kind }]);
  }, []);

  const completeQuest = useCallback((id: string) => {
    setCompletedQuests((s) => {
      if (s.has(id)) return s;
      pushLog(`◉ quest cleared · ${id}`, "ok");
      const nx = new Set(s);
      nx.add(id);
      return nx;
    });
  }, [pushLog]);

  useEffect(() => {
    if (scrub > 0.55) {
      const q = regions[chamberIdx].quests.find((q) => q.auto);
      if (q) completeQuest(q.id);
    }
  }, [scrub, chamberIdx, completeQuest]);

  useEffect(() => {
    const onRot = () => completeQuest("R0:rotate");
    window.addEventListener("world:planet-rotated", onRot);
    return () => window.removeEventListener("world:planet-rotated", onRot);
  }, [completeQuest]);

  // Smooth-scroll programmatic travel
  const jumpTo = useCallback((idx: number) => {
    const target = Math.max(0, Math.min(regions.length - 1, idx));
    const totalScroll = (scrollRef.current?.scrollHeight ?? 0) - window.innerHeight;
    const y = ((target + 0.15) / regions.length) * totalScroll;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  // Keys: travel only (scroll handled by browser)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight": e.preventDefault(); jumpTo(lastIdxRef.current + 1); break;
        case "ArrowLeft": e.preventDefault(); jumpTo(lastIdxRef.current - 1); break;
        case "Home": e.preventDefault(); jumpTo(0); break;
        case "End": e.preventDefault(); jumpTo(regions.length - 1); break;
        case "i": case "I": e.preventDefault(); setShowContent((s) => !s); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jumpTo]);

  useEffect(() => {
    if (chamberIdx !== 0) setActivePin(null);
  }, [chamberIdx]);

  useEffect(() => {
    if (discovered === null) return;
    const t = setTimeout(() => setDiscovered(null), 2200);
    return () => clearTimeout(t);
  }, [discovered]);

  // === HYDRATE: localStorage + URL + reduced-motion + initial log ===
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    // Initial log (client-only, prevents SSR time mismatch)
    setLog([
      { id: ++entryCounter, t: nowT(), text: "world online · spawn at ORIGIN STATION", kind: "ok" },
      { id: ++entryCounter, t: nowT(), text: "scroll continuously · ⌘K for commands", kind: "info" },
    ]);

    const saved = loadSaved();
    setVisited(new Set(saved.visited));
    setCompletedQuests(new Set(saved.quests));
    setKonamiUnlocked(saved.konami);

    // Reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onMq);

    // URL → initial region
    const urlIdx = readUrlRegion();
    if (urlIdx !== null && urlIdx >= 0 && urlIdx < regions.length && urlIdx !== 0) {
      const totalScroll = (scrollRef.current?.scrollHeight ?? 0) - window.innerHeight;
      const y = ((urlIdx + 0.15) / regions.length) * totalScroll;
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" }));
    }

    return () => mq.removeEventListener("change", onMq);
  }, []);

  // === PERSIST on change ===
  useEffect(() => {
    saveState({
      visited: Array.from(visited),
      quests: Array.from(completedQuests),
      konami: konamiUnlocked,
    });
  }, [visited, completedQuests, konamiUnlocked]);

  // === KONAMI listener ===
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const buf = konamiBuf.current;
      buf.push(e.key);
      if (buf.length > KONAMI.length) buf.shift();
      if (buf.length === KONAMI.length && buf.every((k, i) => k === KONAMI[i])) {
        konamiBuf.current = [];
        if (!konamiUnlocked) {
          setKonamiUnlocked(true);
          pushLog("◉ secret unlocked · operator mode engaged", "ok");
          // mark all quests complete + visit all regions as easter egg
          setCompletedQuests((s) => {
            const all = new Set(s);
            regions.forEach((r) => r.quests.forEach((q) => all.add(q.id)));
            return all;
          });
          setVisited(new Set(regions.map((_, i) => i)));
        } else {
          pushLog("◉ konami re-fired · already unlocked", "warn");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [konamiUnlocked, pushLog]);

  const clearLog = useCallback(() => {
    setLog([{ id: ++entryCounter, t: nowT(), text: "log cleared", kind: "info" }]);
  }, []);

  const r = regions[chamberIdx];
  const selectedPin = projects.find((p) => p.slug === activePin) ?? null;
  const overallPct = ((chamberIdx + scrub) / regions.length) * 100;

  // Story beats within a region: 0..1 scrub → reveal phase
  // Sequential: headline first (0..0.20), then content (0.22..0.92). No overlap → no bleed-through.
  const showHeadline = scrub < 0.22 || !showContent;
  // last region · content holds at full through scroll end (no tail fade)
  const isLastChamber = chamberIdx === regions.length - 1;
  const contentOpacity = showContent
    ? smoothstep(0.22, 0.34, scrub) *
      (isLastChamber ? 1 : 1 - smoothstep(0.92, 1.0, scrub))
    : 0;
  const outroHint = scrub > 0.88 && chamberIdx < regions.length - 1;
  const introHint = scrub < 0.05 && chamberIdx > 0;

  return (
    <>
      {/* CURSOR TRAIL — desktop only, respects reduced-motion */}
      {!reducedMotion && <CursorTrail />}

      {/* COMMAND PALETTE — ⌘K */}
      <CommandPalette
        onTravel={jumpTo}
        onToggleInfo={() => setShowContent((s) => !s)}
        onClearLog={clearLog}
        showInfo={showContent}
      />

      {/* Long scrollable spacer driving scroll progress */}
      <div ref={scrollRef} style={{ height: `${regions.length * REGION_HEIGHT_VH}vh` }} aria-hidden />

      {/* Fixed viewport — world view, stays in place while body scrolls */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#02050f] text-bone">
        {/* Starfield */}
        <div
          className="absolute inset-0 opacity-70"
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
              radial-gradient(1px 1px at 5% 50%, #fff 0, transparent 1px),
              radial-gradient(1px 1px at 40% 12%, #fff 0, transparent 1px),
              radial-gradient(1px 1px at 60% 88%, #fff 0, transparent 1px),
              radial-gradient(2px 2px at 25% 40%, #ffd76b 0, transparent 1px)
            `,
          }}
        />

        {/* Region tint — stacked per region, scroll-linked crossfade */}
        {regions.map((reg, i) => (
          <RegionLayer
            key={reg.code + "-tint"}
            i={i}
            f={fProgress}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at center, ${reg.tint} 0%, transparent 65%)` }}
            />
          </RegionLayer>
        ))}

        {/* NMS-style warm horizon haze — stacked per region */}
        {regions.map((reg, i) => (
          <RegionLayer
            key={reg.code + "-haze"}
            i={i}
            f={fProgress}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[35vh] z-[6]"
          >
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 120% 60% at 50% 100%, ${reg.tint.replace(/[\d.]+\)/, "0.15)")} 0%, transparent 70%),
                  linear-gradient(180deg, transparent 0%, rgba(255,140,50,0.02) 80%, rgba(255,160,60,0.04) 100%)
                `,
              }}
            />
          </RegionLayer>
        ))}

        {/* 3D canvas */}
        <div className="pointer-events-auto absolute inset-0">
          {reducedMotion ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone/40 mb-3">
                  reduced motion · 3D disabled
                </div>
                <div className="text-7xl text-amber-300 opacity-60">{r.glyph}</div>
                <div className="mt-4 font-mono text-xs uppercase tracking-widest text-bone/60">
                  {r.region}
                </div>
              </div>
            </div>
          ) : (
            <Stack3D
              progressRef={progressRef}
              onPinClick={(s) => {
                setActivePin(s);
                pushLog(`mission target acquired · ${s}`, "ok");
                completeQuest("R0:pin");
              }}
              activePin={activePin}
              idleRef={idleRef}
            />
          )}
        </div>

        {/* Scan grid */}
        <div
          className="absolute inset-0 z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 0 30px, rgba(125,163,255,0.4) 30px 31px, transparent 31px 60px)",
          }}
        />

        <HudCorners />

        {/* TOP BAR */}
        <header className="pointer-events-auto absolute left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-bone/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70 backdrop-blur-sm md:px-12">
          <span className="flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            samar.dev · z-NAV
          </span>
          <span className="hidden lg:flex items-center gap-3">
            <span className="text-bone/40">region</span>
            <span className="text-amber-300">{r.glyph}</span>
            <span className="text-bone">{r.region}</span>
            <span className="text-bone/30">·</span>
            <span>{(chamberIdx + 1).toString().padStart(2, "0")}/{regions.length.toString().padStart(2, "0")}</span>
            <span className="text-bone/30">·</span>
            <span>arc · <span className="text-bone/80">{(scrub * 100).toFixed(0).padStart(3, "0")}%</span></span>
          </span>
          <div className="flex items-center gap-2">
            {konamiUnlocked && (
              <span className="border border-amber-300/60 bg-amber-300/15 px-2 py-1 text-amber-300">
                ★ operator
              </span>
            )}
            <button
              onClick={() => setShowContent((s) => !s)}
              className="rounded border border-bone/20 bg-bone/[0.04] px-2 py-1 text-bone/70 hover:bg-bone/10 hover:text-bone"
            >
              [ I ] {showContent ? "hide info" : "show info"}
            </button>
            <kbd className="rounded border border-bone/20 bg-bone/[0.04] px-2 py-1 text-bone/60 hidden md:inline-block">⌘K</kbd>
          </div>
        </header>

        {/* Global progress */}
        <div className="absolute left-0 right-0 top-[40px] z-30 h-px bg-bone/5">
          <div
            className="h-full bg-amber-300/70 transition-[width] duration-150 ease-out"
            style={{ width: `${overallPct}%`, boxShadow: "0 0 6px rgba(255,213,74,0.6)" }}
          />
        </div>

        {/* MINI-MAP — top center */}
        <aside className="pointer-events-auto absolute left-1/2 top-14 z-30 hidden -translate-x-1/2 xl:block">
          <div className="rounded border border-bone/15 bg-black/60 p-2 backdrop-blur-md">
            <div className="mb-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-bone/50">
              <span>world map · {visited.size}/{regions.length}</span>
              <span>{r.region}</span>
            </div>
            <svg viewBox="0 0 240 60" className="w-[240px]">
              <line x1="20" y1="30" x2="220" y2="30" stroke="#3b4267" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="20" y1="30" x2={20 + (overallPct / 100) * 200} y2="30" stroke="#ffd54a" strokeWidth="1.4" />
              {regions.map((reg, i) => {
                const cx = 20 + (i / (regions.length - 1)) * 200;
                const isActive = i === chamberIdx;
                const isVisited = visited.has(i);
                return (
                  <g key={reg.code}>
                    <circle
                      cx={cx} cy={30}
                      r={isActive ? 6 : 3.5}
                      fill={isActive ? "#ffd54a" : isVisited ? "#34d399" : "transparent"}
                      stroke={isActive ? "#ffd54a" : isVisited ? "#34d399" : "#6b7693"}
                      strokeWidth="1.2"
                      className="cursor-pointer"
                      style={{ filter: isActive ? "drop-shadow(0 0 6px #ffd54a)" : "none" }}
                      onClick={() => jumpTo(i)}
                    />
                    <text x={cx} y={48} textAnchor="middle" fill={isActive ? "#ffd54a" : "#6b7693"} fontSize="6.5" fontFamily="monospace" letterSpacing="1.4">
                      {reg.code}
                    </text>
                    <text x={cx} y={18} textAnchor="middle" fill={isActive ? "#ffd54a" : isVisited ? "#34d399" : "#6b7693"} fontSize="9">
                      {reg.glyph}
                    </text>
                  </g>
                );
              })}
            </svg>
            </div>
        </aside>

        {/* QUEST LOG — stacked per-region, scroll-linked crossfade */}
        <aside className="absolute left-6 top-[170px] z-30 hidden xl:block w-[240px] 2xl:top-[180px] 2xl:w-[260px]">
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/40">
            quests · this region
          </div>
          <div className="relative w-[260px]">
            {regions.map((reg, i) => (
              <RegionLayer
                key={reg.code + "-quests"}
                i={i}
                f={fProgress}
                className="absolute inset-x-0 top-0"
              >
                <div className="rounded border border-bone/15 bg-black/60 p-3 backdrop-blur-md w-[260px]">
                  <ul className="space-y-1.5">
                    {reg.quests.map((q) => {
                      const done = completedQuests.has(q.id);
                      return (
                        <li key={q.id} className="flex items-start gap-2 font-mono text-[10px] leading-snug">
                          <span className={`mt-px shrink-0 ${done ? "text-emerald-300" : "text-bone/40"}`}>
                            {done ? "◉" : "○"}
                          </span>
                          <span className={done ? "text-bone/50 line-through" : "text-bone/90"}>
                            {q.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-3 border-t border-bone/10 pt-2 font-mono text-[9px] uppercase tracking-widest text-bone/40">
                    <span className="text-emerald-300">{reg.quests.filter((q) => completedQuests.has(q.id)).length}</span>/{reg.quests.length} cleared
                  </div>
                </div>
              </RegionLayer>
            ))}
          </div>
        </aside>

        {/* COORDS */}
        <aside className="absolute left-6 top-12 z-30 hidden xl:block 2xl:top-16">
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/40">
            coords · live
          </div>
          <div className="rounded border border-bone/15 bg-black/60 p-2 font-mono text-[10px] backdrop-blur-md">
            <Axis label="x" value={camValue(chamberIdx, scrub, "x")} />
            <Axis label="y" value={camValue(chamberIdx, scrub, "y")} />
            <Axis label="z" value={camValue(chamberIdx, scrub, "z")} />
            <Axis label="t" value={scrub} unit="" />
          </div>
        </aside>

        {/* FAST-TRAVEL */}
        <aside className="pointer-events-auto absolute left-6 bottom-20 z-30 hidden xl:block 2xl:bottom-24">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#ffd54a] animate-pulse" />
            fast-travel · tap to jump
          </div>
          <ul className="space-y-0 rounded border-2 border-amber-300/40 bg-black/60 p-1.5 backdrop-blur-md shadow-[0_0_20px_-6px_rgba(255,213,107,0.4)] 2xl:space-y-0.5 2xl:p-2">
            {regions.map((reg, i) => {
              const isCur = chamberIdx === i;
              const isVis = visited.has(i);
              return (
                <li key={reg.code}>
                  <button
                    onClick={() => jumpTo(i)}
                    className={`group flex w-full items-center gap-1.5 rounded-sm border border-transparent px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest transition-all hover:translate-x-0.5 hover:border-amber-300/50 hover:bg-amber-300/[0.08] 2xl:gap-2 2xl:py-1 2xl:text-[10px] ${
                      isCur
                        ? "border-amber-300/55 bg-amber-300/[0.10] text-amber-200"
                        : isVis
                        ? "text-emerald-300 hover:text-amber-200"
                        : "text-bone/75 hover:text-amber-200"
                    }`}
                  >
                    <span className="w-3 text-center">{reg.glyph}</span>
                    <span className="w-6">{reg.code}</span>
                    <span className="flex-1 text-left">{reg.region}</span>
                    {isCur ? (
                      <span className="text-amber-300">●</span>
                    ) : (
                      <span className="text-bone/30 transition group-hover:text-amber-300">
                        ↗
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* === STORY HEADLINE — stacked per-region, scroll-linked === */}
        {regions.map((reg, i) => (
          <HeadlineLayer
            key={reg.code + "-head"}
            i={i}
            f={fProgress}
            infoVisible={showContent}
            className="region-headline absolute left-0 right-0 top-1/2 z-10 hidden -translate-y-1/2 px-6 text-center lg:block lg:px-12"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-300">
              — chapter {i + 1} / {regions.length} —
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-bone/60">
              {reg.biome}
            </div>
            <h2
              className="mt-5 font-light uppercase tracking-tight text-bone"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: "clamp(1.6rem, 3.6vw, 5rem)",
                lineHeight: 1.02,
              }}
            >
              {reg.region}
            </h2>
            <p
              className="mt-3 font-sans leading-relaxed text-bone"
              style={{
                fontSize: "clamp(0.95rem, 1.05vw, 1.2rem)",
              }}
            >
              {reg.serif}
            </p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-amber-300/80 animate-pulse">
              ▾ keep scrolling · the story unfolds ▾
            </p>
          </HeadlineLayer>
        ))}

        {/* === REGION CONTENT — only active + adjacent stacked (crossfade) === */}
        {showContent && regions.map((reg, i) => {
          // skip non-adjacent regions — keeps stack to max 3 panels so wheel events reach the right one
          if (Math.abs(i - chamberIdx) > 1) return null;
          const isActive = i === chamberIdx;
          // Pin mission-detail occupies the same right-side slot; hide R0 content when a pin is open
          if (isActive && chamberIdx === 0 && activePin) return null;
          return (
            <RegionLayer
              key={reg.code + "-content"}
              i={i}
              f={fProgress}
              interactive={isActive}
              className="absolute inset-0 z-20"
            >
              {/* Non-active: hard-disable pointer events on all descendants so wheel/click pass through to active panel */}
              <div className={isActive ? "contents" : "[&_*]:!pointer-events-none"}>
                <RegionContent kind={reg.contentKind} onMarkQuest={completeQuest} />
              </div>
            </RegionLayer>
          );
        })}

        {/* === OUTRO HINT (0.88 → 1.0) === */}
        <AnimatePresence>
          {outroHint && (
            <motion.div
              key={r.code + "-outro"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute left-1/2 bottom-40 z-30 -translate-x-1/2 text-center"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300 animate-pulse">
                ▾ approaching · {regions[chamberIdx + 1].region} ▾
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === INTRO HINT (0..0.05, only on later regions) === */}
        <AnimatePresence>
          {introHint && (
            <motion.div
              key={r.code + "-intro"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-32 z-30 -translate-x-1/2 text-center"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
                ▲ scroll up · back to {regions[chamberIdx - 1].region} ▲
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MISSION DETAIL panel (L0 pin) */}
        <AnimatePresence>
          {chamberIdx === 0 && selectedPin && (
            <motion.aside
              key={selectedPin.slug}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="pointer-events-auto fixed right-4 top-1/2 z-40 w-[min(92vw,540px)] -translate-y-1/2 border-2 border-amber-300/60 bg-[#04060e]/97 p-6 shadow-2xl md:right-8"
            >
              <div className="flex items-center justify-between border-b border-amber-300/30 pb-2 font-mono text-[10px] uppercase tracking-widest text-amber-300/80">
                <span>mission · {selectedPin.slug}</span>
                <button onClick={() => setActivePin(null)} className="hover:text-bone">close ✕</button>
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-bone/60">
                [{selectedPin.year}] · {selectedPin.role}
              </div>
              <h3 className="mt-2 font-light text-3xl uppercase tracking-wider text-bone" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {selectedPin.name}
              </h3>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-bone/95">{selectedPin.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-widest">
                {selectedPin.tags.map((t) => (
                  <span key={t} className="border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-amber-200">{t}</span>
                ))}
              </div>
              <Link
                href={`/work/${selectedPin.slug}`}
                className="mt-6 block border border-amber-300 bg-amber-300/10 px-4 py-3 text-center font-display text-xs uppercase tracking-widest text-amber-200 hover:bg-amber-300/20"
              >
                ◐ engage full briefing
              </Link>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* NMS-style DISCOVERY TOAST */}
        <AnimatePresence>
          {discovered !== null && (
            <motion.div
              key={`disc-${discovered}`}
              initial={{ y: -16, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute left-1/2 top-20 z-[180] -translate-x-1/2"
            >
              <div className="relative">
                {/* Top banner */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap border border-amber-300/60 bg-black/85 px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.4em] text-amber-300 backdrop-blur-md">
                  ▶ DISCOVERY MADE
                </div>
                {/* Hex-clipped main panel */}
                <div
                  className="flex items-center gap-4 border-2 border-amber-300/60 bg-black/80 px-6 py-3 shadow-[0_0_30px_rgba(255,213,74,0.25)] backdrop-blur-md"
                  style={{
                    clipPath: "polygon(14px 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0 50%)",
                  }}
                >
                  <svg viewBox="0 0 32 32" className="h-10 w-10 shrink-0">
                    <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="#ffd54a" strokeWidth="1.4" />
                    <text x="16" y="22" textAnchor="middle" fill="#ffd54a" fontSize="16" fontFamily="serif">
                      {regions[discovered].glyph}
                    </text>
                  </svg>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-300/80">
                      planet · {regions[discovered].codename}
                    </span>
                    <span className="font-mono text-sm uppercase tracking-[0.25em] text-bone">
                      {regions[discovered].region}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/60">
                      {regions[discovered].classification}
                    </span>
                  </div>
                </div>
                {/* Footer */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap border border-amber-300/30 bg-black/70 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.4em] text-amber-300/70 backdrop-blur-md">
                  + 1 entry · upload unlocked
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* (vignette pulse removed — scroll-linked crossfade handles transitions smoothly) */}
      </div>
    </>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Per-region alpha as a continuous function of global region-float position.
// Each region peaks at d ∈ [0.18, 0.82], fades in/out over 0.18 of overlap on each side.
// First region pins to 1 on the lead-in; last region pins to 1 on the tail.
function regionAlpha(i: number, f: number, isLast = false) {
  const d = f - i;
  if (i === 0 && d < 0.18) return 1;
  if (isLast && d > 0.82) return 1;
  if (d < -0.18 || d > 1.18) return 0;
  if (d < 0.18) return smoothstep(-0.18, 0.18, d);
  if (d > 0.82) return 1 - smoothstep(0.82, 1.18, d);
  return 1;
}

function RegionLayer({
  i,
  f,
  children,
  className = "",
}: {
  i: number;
  f: MotionValue<number>;
  children: React.ReactNode;
  className?: string;
  // `interactive` retained as prop for call-site clarity but wrapper is always pointer-events:none
  // so it never blocks the 3D canvas underneath. Inner content opts in via its own pointer-events-auto.
  interactive?: boolean;
}) {
  const isLast = i === regions.length - 1;
  const alpha = useTransform(f, (val) => regionAlpha(i, val, isLast));
  return (
    <motion.div
      style={{ opacity: alpha, pointerEvents: "none" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Headline only visible early in its region (entry beat). When info hidden, headline holds the whole region.
function HeadlineLayer({
  i,
  f,
  infoVisible,
  children,
  className = "",
}: {
  i: number;
  f: MotionValue<number>;
  infoVisible: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const isLast = i === regions.length - 1;
  const alpha = useTransform(f, (val) => {
    if (!infoVisible) return regionAlpha(i, val, isLast);
    const d = val - i;
    // first region · headline already visible at scroll start (no fade-in)
    const lead = i === 0 ? 1 : smoothstep(-0.12, 0.06, d);
    // last region · headline holds visible deep into the region (no early tail fade)
    const tail = isLast ? 1 : 1 - smoothstep(0.18, 0.32, d);
    return lead * tail;
  });
  return (
    <motion.div style={{ opacity: alpha, pointerEvents: "none" }} className={className}>
      {children}
    </motion.div>
  );
}

function actLabel(s: number) {
  if (s < 0.22) return "i · opening";
  if (s < 0.6) return "ii · middle";
  if (s < 0.88) return "iii · close";
  return "iv · cross";
}

function HudCorners() {
  return (
    <>
      {/* Outer thin frame */}
      <span className="pointer-events-none absolute inset-x-0 top-[44px] z-20 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
      <span className="pointer-events-none absolute inset-x-0 bottom-[8px] z-20 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
      <span className="pointer-events-none absolute inset-y-[44px] left-[8px] z-20 w-px bg-gradient-to-b from-transparent via-amber-300/25 to-transparent" />
      <span className="pointer-events-none absolute inset-y-[44px] right-[8px] z-20 w-px bg-gradient-to-b from-transparent via-amber-300/25 to-transparent" />

      {/* Inner frame · ~24px inset */}
      <span className="pointer-events-none absolute left-6 right-6 top-[56px] z-20 h-px bg-amber-300/10" />
      <span className="pointer-events-none absolute left-6 right-6 bottom-5 z-20 h-px bg-amber-300/10" />

      {/* Corner brackets · double-stroke L-shapes */}
      <CornerBracket pos="tl" />
      <CornerBracket pos="tr" />
      <CornerBracket pos="bl" />
      <CornerBracket pos="br" />

      {/* Edge ticks · ruler-style notches */}
      <EdgeTicks side="top" />
      <EdgeTicks side="bottom" />
      <EdgeTicks side="left" />
      <EdgeTicks side="right" />

      {/* Top-left ornament · JARVIS-style identifier block */}
      <div className="pointer-events-none absolute left-3 top-[50px] z-20 flex flex-col gap-px font-mono text-[8px] uppercase tracking-[0.35em] text-amber-300/55">
        <span>sys · z-nav</span>
        <span className="text-amber-300/30">∎ ∎ ∎ ∎ ∎</span>
      </div>

      {/* Top-right ornament · system stat hex */}
      <svg viewBox="0 0 40 36" className="pointer-events-none absolute right-3 top-[50px] z-20 h-7 w-8 opacity-70">
        <polygon points="20,2 36,11 36,25 20,34 4,25 4,11" fill="none" stroke="#ffd54a" strokeWidth="0.8" strokeOpacity="0.55" />
        <polygon points="20,8 30,14 30,22 20,28 10,22 10,14" fill="none" stroke="#ffd54a" strokeWidth="0.6" strokeOpacity="0.35" />
        <circle cx="20" cy="18" r="1.6" fill="#ffd54a" fillOpacity="0.7">
          <animate attributeName="fillOpacity" values="0.3;0.85;0.3" dur="2.4s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Bottom-left ornament · status block */}
      <div className="pointer-events-none absolute left-3 bottom-3 z-20 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.35em] text-amber-300/55">
        <span className="inline-block h-1 w-1 rounded-full bg-amber-300 shadow-[0_0_4px_#ffd54a]" />
        <span>frame · stable</span>
      </div>

      {/* Bottom-right ornament · scan readout */}
      <div className="pointer-events-none absolute right-3 bottom-3 z-20 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.35em] text-amber-300/55">
        <span>scan · 0x7af3</span>
        <span className="inline-block h-1 w-3 bg-amber-300/40" />
      </div>

      {/* Mid-left rail · vertical scan line */}
      <span className="pointer-events-none absolute left-[8px] top-1/2 z-20 -translate-y-1/2 flex flex-col items-center gap-1.5">
        <span className="block h-6 w-px bg-amber-300/40" />
        <span className="block h-1.5 w-1.5 rotate-45 border border-amber-300/60 bg-black/40" />
        <span className="block h-6 w-px bg-amber-300/40" />
      </span>

      {/* Mid-right rail · vertical scan line */}
      <span className="pointer-events-none absolute right-[8px] top-1/2 z-20 -translate-y-1/2 flex flex-col items-center gap-1.5">
        <span className="block h-6 w-px bg-amber-300/40" />
        <span className="block h-1.5 w-1.5 rotate-45 border border-amber-300/60 bg-black/40" />
        <span className="block h-6 w-px bg-amber-300/40" />
      </span>

      {/* Sweep · slow vertical scan band */}
      <span
        className="pointer-events-none absolute left-0 right-0 z-[18] h-12 opacity-[0.08]"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(255,213,74,0.4), transparent)",
          animation: "hudSweep 9s linear infinite",
        }}
      />
      <style jsx global>{`
        @keyframes hudSweep {
          0%   { top: -10%; }
          100% { top: 110%; }
        }
      `}</style>
    </>
  );
}

function CornerBracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const v = pos[0] === "t" ? "top-[48px]" : "bottom-[12px]";
  const h = pos[1] === "l" ? "left-[12px]" : "right-[12px]";
  const bv = pos[0] === "t" ? "border-t" : "border-b";
  const bh = pos[1] === "l" ? "border-l" : "border-r";
  const ov = pos[0] === "t" ? "top-[44px]" : "bottom-[8px]";
  const oh = pos[1] === "l" ? "left-[8px]" : "right-[8px]";
  return (
    <>
      {/* outer L */}
      <span className={`pointer-events-none absolute z-20 h-5 w-5 ${ov} ${oh} ${bv} ${bh} border-amber-300/70`} />
      {/* inner L · offset for double-stroke look */}
      <span className={`pointer-events-none absolute z-20 h-2.5 w-2.5 ${v} ${h} ${bv} ${bh} border-amber-300/40`} />
    </>
  );
}

function EdgeTicks({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  const ticks = Array.from({ length: 12 }, (_, i) => i);
  const isV = side === "left" || side === "right";
  const baseClass = isV
    ? `pointer-events-none absolute z-20 ${side === "left" ? "left-[8px]" : "right-[8px]"} top-[60px] bottom-5 flex flex-col justify-between`
    : `pointer-events-none absolute z-20 ${side === "top" ? "top-[44px]" : "bottom-[8px]"} left-12 right-12 flex justify-between`;
  return (
    <div className={baseClass}>
      {ticks.map((t) => (
        <span
          key={t}
          className={isV ? "h-px w-1.5 bg-amber-300/30" : "h-1.5 w-px bg-amber-300/30"}
          style={{ opacity: t % 3 === 0 ? 0.6 : 0.25 }}
        />
      ))}
    </div>
  );
}

function Axis({ label, value, unit = "u" }: { label: string; value: number; unit?: string }) {
  const sign = value >= 0 ? "+" : "";
  const colorMap: Record<string, string> = {
    x: "text-rose-400", y: "text-emerald-400", z: "text-sky-400", t: "text-amber-300",
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 text-right ${colorMap[label] ?? "text-bone"}`}>{label}</span>
      <span className="text-bone/40">·</span>
      <span className="w-16 text-right text-bone">
        {sign}{value.toFixed(2)}{unit && <span className="ml-0.5 text-bone/40">{unit}</span>}
      </span>
    </div>
  );
}

const CAM_X = [0, 1.4, -1.4, 1.0, -1.0, 1.6, 0];
const CAM_Y = [0, 0.3, -0.3, 0.4, -0.4, 0.2, 0];
function camValue(idx: number, scrub: number, axis: "x" | "y" | "z") {
  const next = Math.min(idx + 1, CAM_X.length - 1);
  if (axis === "z") return 6 - scrub * 0.8;
  if (axis === "x") return CAM_X[idx] * (1 - scrub) + CAM_X[next] * scrub;
  return CAM_Y[idx] * (1 - scrub) + CAM_Y[next] * scrub;
}

function nowT() {
  return new Date().toTimeString().slice(0, 8);
}
