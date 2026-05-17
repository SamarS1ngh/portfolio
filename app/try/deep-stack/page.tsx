"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/content/projects";

const Stack3D = dynamic(() => import("./Stack3D").then((m) => m.Stack3D), { ssr: false });

type Quest = { id: string; label: string; auto?: boolean };

type Region = {
  code: string;
  region: string; // open-world name
  title: string; // facet
  jp: string;
  headline: string;
  serif: string;
  biome: string; // short bio descriptor
  tint: string; // rgba — atmospheric color for this region
  glyph: string; // map icon char
  ann: { label: string; value: string }[];
  formula: string;
  side: string;
  interact: string; // contextual prompt
  quests: Quest[];
  enterEvent: string;
};

const regions: Region[] = [
  {
    code: "R0", region: "ORIGIN STATION", title: "identity", jp: "起源",
    headline: "samar narangi",
    serif: "engineer of strange quiet machines.",
    biome: "the hub · where you spawn",
    tint: "rgba(20,40,90,0.45)",
    glyph: "◉",
    ann: [
      { label: "node", value: "HYD-001" },
      { label: "lat/lon", value: "17.385°N / 78.487°E" },
      { label: "uptime", value: "9 yr" },
      { label: "θ̇", value: "drag → ω" },
    ],
    formula: "r⃗(t) = R·[cos(θ + ωt), sin(θ + ωt)]",
    side: "▸ origin · operator profile",
    interact: "drag the planet · click a pin",
    quests: [
      { id: "R0:rotate", label: "rotate the planet (drag it)" },
      { id: "R0:pin", label: "engage a mission (click any pin)" },
    ],
    enterEvent: "entering region · ORIGIN STATION",
  },
  {
    code: "R1", region: "ARCHIVE GROVE", title: "doctrine", jp: "学習",
    headline: "learning machines learning.",
    serif: "rules I build by, encoded as edges between ideas.",
    biome: "the library · where ideas connect",
    tint: "rgba(80,40,120,0.42)",
    glyph: "✦",
    ann: [
      { label: "nodes", value: "n = 32" },
      { label: "edges", value: "d² < 0.85" },
      { label: "loss", value: "↓ y/y" },
      { label: "φ", value: "1.61803" },
    ],
    formula: "L(θ) = Σᵢ ||y - f(x;θ)||² + λ·R(θ)",
    side: "▸ doctrine · neural lattice",
    interact: "scroll to spin the lattice",
    quests: [
      { id: "R1:read", label: "watch the lattice converge", auto: true },
    ],
    enterEvent: "entering region · ARCHIVE GROVE",
  },
  {
    code: "R2", region: "FABRICATION YARDS", title: "work", jp: "工房",
    headline: "six things worth telling.",
    serif: "voice agents, mobile ML, indie OS modules, contract platforms.",
    biome: "the shipyard · where things get made",
    tint: "rgba(120,50,30,0.40)",
    glyph: "⊞",
    ann: [
      { label: "missions", value: `n = ${projects.length}` },
      { label: "shipped", value: "live · contract · personal" },
      { label: "stack", value: "ts · py · kt · rs" },
      { label: "ω", value: "0.20 rad/s" },
    ],
    formula: "ship(t) = ∫ taste · iteration dt",
    side: "▸ work · gyroscopic schematic",
    interact: "scroll to unfold the gyros",
    quests: [
      { id: "R2:gyro", label: "spin all three gyro rings", auto: true },
    ],
    enterEvent: "entering region · FABRICATION YARDS",
  },
  {
    code: "R3", region: "ARMORY VAULT", title: "toolkit", jp: "武器庫",
    headline: "what i reach for.",
    serif: "languages, runtimes, libraries — arranged like elements.",
    biome: "the rack · pick your weapon",
    tint: "rgba(40,90,60,0.42)",
    glyph: "⌂",
    ann: [
      { label: "elements", value: "Z = 28" },
      { label: "lanes", value: "6" },
      { label: "primary", value: "ts · py · kt · rs" },
      { label: "Σ", value: "compounds well" },
    ],
    formula: "K = {lang ∪ rt ∪ lib} · indexed",
    side: "▸ toolkit · element rack",
    interact: "scroll to materialize the rack",
    quests: [
      { id: "R3:flip", label: "watch every tile flip into place", auto: true },
    ],
    enterEvent: "entering region · ARMORY VAULT",
  },
  {
    code: "R4", region: "STARLIGHT COVE", title: "interests", jp: "星海",
    headline: "off the clock.",
    serif: "stories, worlds, vision, ideas — clusters of curiosity.",
    biome: "the reef · drift through clusters",
    tint: "rgba(140,40,90,0.42)",
    glyph: "☆",
    ann: [
      { label: "clusters", value: "k = 4" },
      { label: "particles", value: "n ≈ 600" },
      { label: "energy", value: "ΣE additive" },
      { label: "ε₀", value: "free time" },
    ],
    formula: "ρ(x) = Σⱼ wⱼ · N(x | μⱼ, Σⱼ)",
    side: "▸ interests · constellation",
    interact: "scroll to spawn cluster after cluster",
    quests: [
      { id: "R4:bloom", label: "spawn all four clusters", auto: true },
    ],
    enterEvent: "entering region · STARLIGHT COVE",
  },
  {
    code: "R5", region: "OBSERVATORY DECK", title: "status", jp: "観測台",
    headline: "currently building.",
    serif: "jarvis memory · nocap beta · eeo ledger primitives.",
    biome: "the watchtower · what's live right now",
    tint: "rgba(20,90,80,0.42)",
    glyph: "≋",
    ann: [
      { label: "signal", value: "f = 24.0 Hz" },
      { label: "A(t)", value: "0.4 + 0.6 sin t" },
      { label: "noise", value: "≈ 0" },
      { label: "Δ", value: "daily" },
    ],
    formula: "y(t) = A·sin(ωt + φ) + B·sin(ω't)",
    side: "▸ status · live oscilloscope",
    interact: "scroll to draw the signal",
    quests: [
      { id: "R5:trace", label: "trace the full waveform", auto: true },
    ],
    enterEvent: "entering region · OBSERVATORY DECK",
  },
  {
    code: "R6", region: "BEACON SUMMIT", title: "open", jp: "灯台",
    headline: "ping me back.",
    serif: "hello@samar.dev · channel open · transmitting.",
    biome: "the lighthouse · send the signal",
    tint: "rgba(160,20,80,0.42)",
    glyph: "▲",
    ann: [
      { label: "beacon", value: "f = 3 Hz" },
      { label: "carrier", value: "email · gh · x" },
      { label: "latency", value: "human time" },
      { label: "α", value: "1.0 open" },
    ],
    formula: "S(r,t) = (P/4πr²)·sin(2πft)",
    side: "▸ open · transmit",
    interact: "scroll to charge the beacon",
    quests: [
      { id: "R6:charge", label: "fully charge the beacon", auto: true },
      { id: "R6:link", label: "open the comms link (click email)" },
    ],
    enterEvent: "entering region · BEACON SUMMIT",
  },
];

type LogEntry = { id: number; t: string; text: string; kind: "info" | "ok" | "warn" | "cmd" };
let entryCounter = 0;

const WHEEL_SCRUB = 0.0015;
const TOUCH_SCRUB = 0.005;
const TRANSITION_COOLDOWN = 350; // brief input throttle, no loading scrim

export default function DeepStack() {
  const [chamberIdx, setChamberIdx] = useState(0);
  const [scrub, setScrub] = useState(0);
  const [activePin, setActivePin] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [discovered, setDiscovered] = useState<number | null>(null); // newly-discovered region badge
  const [log, setLog] = useState<LogEntry[]>([
    { id: ++entryCounter, t: nowT(), text: "DEEP STACK initialized · world online", kind: "ok" },
    { id: ++entryCounter, t: nowT(), text: "you spawned at ORIGIN STATION · scroll to traverse", kind: "info" },
  ]);

  const chamberIdxRef = useRef(0);
  const scrubRef = useRef(0);
  const progressRef = useRef(0);
  const cooldownUntil = useRef(0);
  const touchStartY = useRef(0);
  const draggedPlanet = useRef(false);

  useEffect(() => {
    chamberIdxRef.current = chamberIdx;
    scrubRef.current = scrub;
    progressRef.current = (chamberIdx + scrub) / regions.length;
  }, [chamberIdx, scrub]);

  const pushLog = useCallback((text: string, kind: LogEntry["kind"] = "info") => {
    setLog((s) => [
      ...s.slice(-40),
      { id: ++entryCounter, t: nowT(), text, kind },
    ]);
  }, []);

  const completeQuest = useCallback((id: string) => {
    setCompletedQuests((s) => {
      if (s.has(id)) return s;
      pushLog(`◉ quest complete · ${id}`, "ok");
      const nx = new Set(s);
      nx.add(id);
      return nx;
    });
  }, [pushLog]);

  // Auto-complete passive quests when scrub reaches 1
  useEffect(() => {
    if (scrub > 0.95) {
      const q = regions[chamberIdx].quests.find((q) => q.auto);
      if (q) completeQuest(q.id);
    }
  }, [scrub, chamberIdx, completeQuest]);

  // Planet-rotated quest (R0)
  useEffect(() => {
    const onRot = () => completeQuest("R0:rotate");
    window.addEventListener("world:planet-rotated", onRot);
    return () => window.removeEventListener("world:planet-rotated", onRot);
  }, [completeQuest]);

  const jumpTo = useCallback(
    (idx: number) => {
      const target = Math.max(0, Math.min(regions.length - 1, idx));
      if (target === chamberIdxRef.current) return;
      const isNew = !visited.has(target);
      setChamberIdx(target);
      setScrub(0);
      setActivePin(null);
      setVisited((v) => new Set([...v, target]));
      cooldownUntil.current = performance.now() + TRANSITION_COOLDOWN;
      if (isNew) {
        setDiscovered(target);
        pushLog(`discovered · ${regions[target].region}`, "ok");
      } else {
        pushLog(regions[target].enterEvent, "info");
      }
    },
    [pushLog, visited]
  );

  const handleDelta = useCallback(
    (deltaY: number, source: "wheel" | "touch" | "key") => {
      if (performance.now() < cooldownUntil.current) return;
      const incFactor = source === "touch" ? TOUCH_SCRUB : source === "key" ? 0.2 : WHEEL_SCRUB;
      const inc = deltaY * incFactor;
      const curScrub = scrubRef.current;
      const curIdx = chamberIdxRef.current;
      const next = curScrub + inc;

      if (next >= 1.0001 && curIdx < regions.length - 1) {
        jumpTo(curIdx + 1);
        return;
      }
      if (next <= -0.0001 && curIdx > 0) {
        const target = curIdx - 1;
        const isNew = !visited.has(target);
        setChamberIdx(target);
        setScrub(1);
        setActivePin(null);
        setVisited((v) => new Set([...v, target]));
        cooldownUntil.current = performance.now() + TRANSITION_COOLDOWN;
        if (isNew) {
          setDiscovered(target);
          pushLog(`discovered · ${regions[target].region}`, "ok");
        } else {
          pushLog(regions[target].enterEvent, "info");
        }
        return;
      }
      setScrub(Math.max(0, Math.min(1, next)));
    },
    [jumpTo, pushLog]
  );

  // Wheel
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleDelta(e.deltaY, "wheel");
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [handleDelta]);

  // Keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": case "PageDown": case " ":
          e.preventDefault(); handleDelta(100, "key"); break;
        case "ArrowUp": case "PageUp":
          e.preventDefault(); handleDelta(-100, "key"); break;
        case "ArrowRight": e.preventDefault(); jumpTo(chamberIdxRef.current + 1); break;
        case "ArrowLeft": e.preventDefault(); jumpTo(chamberIdxRef.current - 1); break;
        case "Home": e.preventDefault(); jumpTo(0); break;
        case "End": e.preventDefault(); jumpTo(regions.length - 1); break;
        case "m": case "M":
          e.preventDefault();
          // toggle ... not implemented; could expand minimap
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDelta, jumpTo]);

  // Touch
  useEffect(() => {
    const onStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onMove = (e: TouchEvent) => {
      if (performance.now() < cooldownUntil.current) return;
      const y = e.touches[0].clientY;
      const dy = touchStartY.current - y;
      touchStartY.current = y;
      handleDelta(dy * 2, "touch");
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
    };
  }, [handleDelta]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    if (chamberIdx !== 0) setActivePin(null);
  }, [chamberIdx]);

  // Auto-dismiss discovered badge
  useEffect(() => {
    if (discovered === null) return;
    const t = setTimeout(() => setDiscovered(null), 2200);
    return () => clearTimeout(t);
  }, [discovered]);

  const r = regions[chamberIdx];
  const selectedPin = projects.find((p) => p.slug === activePin) ?? null;
  const overallPct = ((chamberIdx + scrub) / regions.length) * 100;
  const atEnd = scrub >= 0.999;
  const atStart = scrub <= 0.001;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#02050f] text-bone">
      {/* Starfield bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
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
      {/* Region tint atmosphere — transitions per region */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          background: `radial-gradient(ellipse at center, ${r.tint} 0%, transparent 65%)`,
        }}
        transition={{ duration: 1.2 }}
      />

      {/* 3D canvas */}
      <div className="absolute inset-0">
        <Stack3D
          progressRef={progressRef}
          onPinClick={(s) => {
            setActivePin(s);
            pushLog(`mission target acquired · ${s}`, "ok");
            completeQuest("R0:pin");
          }}
          activePin={activePin}
        />
      </div>

      {/* Diagonal scan grid */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, transparent 0 30px, rgba(125,163,255,0.4) 30px 31px, transparent 31px 60px)",
        }}
      />

      <HudCorners />

      {/* === TOP BAR === */}
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-bone/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70 backdrop-blur-sm md:px-12">
        <span className="flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          OPEN-WORLD · z-NAV
          <span className="text-bone/30">·</span>
          <span className="text-emerald-300">v 0.5.0</span>
        </span>

        {/* Compass / region indicator */}
        <span className="hidden md:flex items-center gap-3">
          <span className="text-bone/40">region</span>
          <span className="text-amber-300">{r.glyph}</span>
          <span className="text-bone">{r.region}</span>
          <span className="text-bone/30">·</span>
          <span>{(chamberIdx + 1).toString().padStart(2, "0")}/{regions.length.toString().padStart(2, "0")}</span>
          <span className="text-bone/30">·</span>
          <span>scrub · <span className="text-bone/80">{(scrub * 100).toFixed(0).padStart(3, "0")}%</span></span>
        </span>

        <span className="pointer-events-auto">
          <Link href="/try" className="text-bone/70 hover:text-bone">← exit world</Link>
        </span>
      </header>

      {/* Global progress bar */}
      <div className="pointer-events-none absolute left-0 right-0 top-[40px] z-30 h-px bg-bone/5">
        <div
          className="h-full bg-amber-300/70 transition-[width] duration-200 ease-out"
          style={{ width: `${overallPct}%`, boxShadow: "0 0 6px rgba(255,213,74,0.6)" }}
        />
      </div>

      {/* === MINI-MAP top-right === */}
      <aside className="pointer-events-auto absolute right-6 top-16 z-30 hidden md:block">
        <div className="rounded border border-bone/15 bg-black/60 p-3 backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-bone/50">
            <span>world map</span>
            <span className="text-bone/30">M</span>
          </div>
          <svg viewBox="0 0 240 60" className="w-[260px]">
            {/* connection line */}
            <line x1="20" y1="30" x2="220" y2="30" stroke="#3b4267" strokeWidth="0.6" strokeDasharray="3 3" />
            {/* sub-progress line */}
            <line
              x1="20"
              y1="30"
              x2={20 + (overallPct / 100) * 200}
              y2="30"
              stroke="#ffd54a"
              strokeWidth="1.4"
            />
            {/* nodes */}
            {regions.map((reg, i) => {
              const cx = 20 + (i / (regions.length - 1)) * 200;
              const isActive = i === chamberIdx;
              const isVisited = visited.has(i);
              return (
                <g key={reg.code}>
                  <circle
                    cx={cx}
                    cy={30}
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
          <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-bone/40">
            <span><span className="text-emerald-300">●</span> visited · {visited.size}/{regions.length}</span>
            <span><span className="text-amber-300">●</span> current</span>
          </div>
        </div>
      </aside>

      {/* === QUEST LOG right-side === */}
      <aside className="pointer-events-none absolute right-6 top-[200px] z-30 hidden md:block">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/40">
          quest log · this region
        </div>
        <div className="rounded border border-bone/15 bg-black/60 p-3 backdrop-blur-md w-[260px]">
          <AnimatePresence mode="wait">
            <motion.ul
              key={r.code}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-1.5"
            >
              {r.quests.map((q) => {
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
            </motion.ul>
          </AnimatePresence>
          <div className="mt-3 border-t border-bone/10 pt-2 font-mono text-[9px] uppercase tracking-widest text-bone/40">
            <span className="text-emerald-300">{r.quests.filter((q) => completedQuests.has(q.id)).length}</span>/{r.quests.length} cleared
          </div>
        </div>
      </aside>

      {/* === LEFT — axis + region marker === */}
      <aside className="pointer-events-none absolute left-6 top-16 z-30 hidden md:block">
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

      {/* === FAST-TRAVEL LIST left-bottom === */}
      <aside className="pointer-events-auto absolute left-6 bottom-44 z-30 hidden md:block">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/40">
          fast-travel · click region
        </div>
        <ul className="space-y-0.5 rounded border border-bone/15 bg-black/60 p-2 backdrop-blur-md">
          {regions.map((reg, i) => {
            const isCur = chamberIdx === i;
            const isVis = visited.has(i);
            return (
              <li key={reg.code}>
                <button
                  onClick={() => jumpTo(i)}
                  className={`flex w-full items-center gap-2 px-1.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    isCur ? "text-amber-300" : isVis ? "text-emerald-300" : "text-bone/40 hover:text-bone/80"
                  }`}
                >
                  <span className="w-3 text-center">{reg.glyph}</span>
                  <span className="w-6">{reg.code}</span>
                  <span className="flex-1 text-left">{reg.region}</span>
                  {isCur && <span className="text-amber-300">●</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* === REGION BIOME · LIVE READOUTS bottom-right === */}
      <AnimatePresence mode="wait">
        <motion.aside
          key={r.code + "-ann"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute right-6 bottom-44 z-30 hidden md:block"
        >
          <div className="mb-2 text-right font-mono text-[9px] uppercase tracking-[0.3em] text-bone/40">
            readout
          </div>
          <div className="rounded border border-bone/15 bg-black/60 p-3 backdrop-blur-md w-[260px]">
            <div className="space-y-1.5 text-right">
              {r.ann.map((a) => (
                <div key={a.label} className="font-mono text-[10px] uppercase tracking-widest">
                  <span className="text-bone/40">{a.label}</span>{" "}
                  <span className="text-bone">{a.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-bone/10 pt-2 text-right font-mono text-[10px] text-emerald-300">
              {r.formula}
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* === CENTER · REGION HEADLINE === */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-20 -translate-y-1/2 px-6 text-center md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={r.code}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-300">
              — region {chamberIdx + 1} / {regions.length} —
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-bone/60">
              {r.biome}
            </div>
            <h2
              className="mt-4 font-light text-3xl uppercase tracking-tight text-bone md:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {r.region}
            </h2>
            <p className="mt-3 font-serif text-base italic text-bone/80 md:text-xl">
              {r.serif}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-amber-300/80">
              [ tip ] {r.interact}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* === CHAMBER SCRUB METER === */}
      <div className="pointer-events-none absolute left-1/2 bottom-44 z-30 w-[min(90vw,520px)] -translate-x-1/2">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
          <span className="text-bone/50">
            {atStart && chamberIdx > 0 ? (
              <span className="text-bone/80">↑ scroll up · back to {regions[chamberIdx - 1].region}</span>
            ) : (
              <span>region explored · scroll to play forward</span>
            )}
          </span>
          <span className="text-bone/50">
            {atEnd && chamberIdx < regions.length - 1 ? (
              <span className="text-amber-300">↓ scroll · travel to {regions[chamberIdx + 1].region}</span>
            ) : (
              <span className="text-bone/80">{(scrub * 100).toFixed(0)}% / 100%</span>
            )}
          </span>
        </div>
        <div className="relative h-1 rounded-full border border-bone/15 bg-bone/[0.04]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400 transition-[width] duration-100"
            style={{ width: `${scrub * 100}%`, boxShadow: "0 0 8px rgba(255,213,74,0.5)" }}
          />
          <span className="absolute -right-1 -top-1 h-3 w-px bg-amber-300" />
        </div>
        <div className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-bone/30">
          chamber clock · safe to explore inside
        </div>
      </div>

      {/* === PREV / NEXT BUTTONS === */}
      <div className="pointer-events-auto absolute left-1/2 bottom-32 z-30 flex -translate-x-1/2 items-center gap-3">
        <button
          onClick={() => jumpTo(chamberIdx - 1)}
          disabled={chamberIdx === 0}
          className="rounded-full border border-bone/20 bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-bone/70 backdrop-blur-sm hover:bg-bone/10 disabled:opacity-30"
        >
          ← prev region
        </button>
        <button
          onClick={() => jumpTo(chamberIdx + 1)}
          disabled={chamberIdx === regions.length - 1}
          className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-200 backdrop-blur-sm hover:bg-amber-300/20 disabled:opacity-30"
        >
          travel onward →
        </button>
      </div>

      {/* === TERMINAL LOG === */}
      <TerminalLog log={log} />

      {/* === MISSION DETAIL panel (L0 only) === */}
      <AnimatePresence>
        {chamberIdx === 0 && selectedPin && (
          <motion.aside
            key={selectedPin.slug}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="pointer-events-auto absolute right-4 top-1/2 z-40 w-[360px] max-w-[92vw] -translate-y-1/2 border border-amber-300/40 bg-black/85 p-6 shadow-2xl backdrop-blur-xl md:right-72"
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
            <p className="mt-3 font-serif text-base italic text-bone/85">{selectedPin.tagline}</p>
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

      {/* === DISCOVERED toast (subtle, top-center, like skyrim) === */}
      <AnimatePresence>
        {discovered !== null && (
          <motion.div
            key={`disc-${discovered}`}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-20 z-[180] -translate-x-1/2"
          >
            <div className="flex items-center gap-3 border border-amber-300/30 bg-black/55 px-4 py-1.5 backdrop-blur-md">
              <span className="font-display text-base text-amber-300">{regions[discovered].glyph}</span>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-300/70">discovered</span>
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-bone">{regions[discovered].region}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Subtle vignette pulse on transition (uses cooldown timer) === */}
      <AnimatePresence>
        <motion.div
          key={`pulse-${chamberIdx}`}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 z-[170]"
          style={{
            background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      </AnimatePresence>
    </div>
  );
}

function HudCorners() {
  return (
    <>
      <span className="pointer-events-none absolute left-2 top-12 z-30 h-4 w-4 border-l border-t border-bone/40" />
      <span className="pointer-events-none absolute right-2 top-12 z-30 h-4 w-4 border-r border-t border-bone/40" />
      <span className="pointer-events-none absolute left-2 bottom-10 z-30 h-4 w-4 border-l border-b border-bone/40" />
      <span className="pointer-events-none absolute right-2 bottom-10 z-30 h-4 w-4 border-r border-b border-bone/40" />
    </>
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

function TerminalLog({ log }: { log: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log]);

  const colorOf: Record<LogEntry["kind"], string> = {
    info: "text-bone/70", ok: "text-emerald-300", warn: "text-amber-300", cmd: "text-sky-300",
  };

  return (
    <div className="pointer-events-none absolute left-0 right-0 bottom-0 z-30 border-t border-bone/10 bg-black/60 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-bone/10 px-6 py-1.5 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/50 md:px-12">
        <span className="flex items-center gap-2">
          <span className="text-emerald-300">$</span>
          <span>tail · ~/.world.log · live</span>
        </span>
        <span className="hidden md:inline">↑↓ scrub · ← → travel region · ESC exit</span>
      </div>

      <div ref={ref} className="h-[100px] overflow-y-auto px-6 py-2 font-mono text-[10px] leading-relaxed md:px-12">
        {log.map((entry) => (
          <div key={entry.id} className="flex gap-3">
            <span className="shrink-0 text-bone/30">[{entry.t}]</span>
            <span className="text-bone/40">›</span>
            <span className={colorOf[entry.kind]}>{entry.text}</span>
          </div>
        ))}
        <div className="flex gap-2 text-amber-300">
          <span>$</span>
          <span className="inline-block h-3 w-2 bg-amber-300" style={{ animation: "blink 1.2s steps(2) infinite" }} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

function nowT() {
  return new Date().toTimeString().slice(0, 8);
}
