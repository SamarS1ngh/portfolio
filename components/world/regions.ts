import { projects } from "@/content/projects";

export type Quest = { id: string; label: string; auto?: boolean };

export type Region = {
  code: string;
  region: string;
  codename: string;       // procedural-sounding planet callsign
  classification: string; // biome/star-system classifier
  title: string;
  jp: string;
  headline: string;
  serif: string;
  biome: string;
  tint: string;
  glyph: string;
  ann: { label: string; value: string }[];
  formula: string;
  side: string;
  interact: string;
  quests: Quest[];
  enterEvent: string;
  contentKind: "origin" | "notebook" | "missions" | "armory" | "cove" | "deck" | "summit";
};

export const regions: Region[] = [
  {
    code: "R0", region: "Samar Singh - Origins", codename: "EKKO-7", classification: "INHABITED · TEMPERATE", title: "identity", jp: "起源",
    headline: "samar singh",
    serif: "engineer of strange quiet machines.",
    biome: "where you start · a quick intro",
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
      { id: "R0:pin", label: "open a project (click any pin)" },
    ],
    enterEvent: "entering · ORIGIN",
    contentKind: "origin",
  },
  {
    code: "R1", region: "BENCH LOG", codename: "ZAGI-V", classification: "ANOMALY · KORVAX-OUTPOST", title: "field notes", jp: "現場",
    headline: "what's on the bench.",
    serif: "live log · current work, weekend experiments, dead ends.",
    biome: "what's running this week",
    tint: "rgba(80,40,120,0.42)",
    glyph: "✦",
    ann: [
      { label: "building", value: "n = 3" },
      { label: "experiments", value: "n = 3" },
      { label: "dead ends", value: "n = 2" },
      { label: "sync", value: "live" },
    ],
    formula: "log(t) ⊃ {focus, build, exp, deadends, deck}",
    side: "▸ field notes · bench log",
    interact: "scroll to read the log",
    quests: [{ id: "R1:read", label: "read the bench log" }],
    enterEvent: "entering · BENCH LOG",
    contentKind: "notebook",
  },
  {
    code: "R2", region: "PROJECTS", codename: "VYR-3", classification: "FORGE-WORLD · IRRADIATED", title: "work", jp: "工房",
    headline: "six things worth telling.",
    serif: "voice agents, mobile ML, indie OS modules, contract platforms.",
    biome: "things I've shipped",
    tint: "rgba(120,50,30,0.40)",
    glyph: "⊞",
    ann: [
      { label: "projects", value: `n = ${projects.length}` },
      { label: "shipped", value: "live · contract · personal" },
      { label: "stack", value: "ts · py · kt · rs" },
      { label: "ω", value: "0.20 rad/s" },
    ],
    formula: "ship(t) = ∫ taste · iteration dt",
    side: "▸ work · gyroscopic schematic",
    interact: "open a project to see the brief",
    quests: [{ id: "R2:inspect", label: "open any project brief" }],
    enterEvent: "entering · PROJECTS",
    contentKind: "missions",
  },
  {
    code: "R3", region: "SKILLS", codename: "PARA-IX", classification: "DEPOT · LOW-SECURITY", title: "toolkit", jp: "武器庫",
    headline: "what i reach for.",
    serif: "languages, runtimes, libraries — arranged like elements.",
    biome: "tools I reach for",
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
    interact: "browse the rack",
    quests: [{ id: "R3:browse", label: "browse all six lanes", auto: true }],
    enterEvent: "entering · SKILLS",
    contentKind: "armory",
  },
  {
    code: "R4", region: "OFF THE CLOCK", codename: "AURI-2", classification: "STELLAR-NURSERY · LUSH", title: "interests", jp: "星海",
    headline: "off the clock.",
    serif: "stories, worlds, vision, ideas — clusters of curiosity.",
    biome: "what I'm into outside of work",
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
    interact: "tune any channel",
    quests: [{ id: "R4:tune", label: "tune all five channels" }],
    enterEvent: "entering · OFF THE CLOCK",
    contentKind: "cove",
  },
  {
    code: "R5", region: "RIGHT NOW", codename: "MIRA-IV", classification: "GAS-GIANT · OBSERVABLE", title: "status", jp: "観測台",
    headline: "currently building.",
    serif: "jarvis memory · rentroll demo · live.",
    biome: "currently building",
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
    interact: "see what i'm building this week",
    quests: [{ id: "R5:read", label: "read the bench list", auto: true }],
    enterEvent: "entering · RIGHT NOW",
    contentKind: "deck",
  },
  {
    code: "R6", region: "SEND A SIGNAL", codename: "OREN-PRIME", classification: "BEACON-RELAY · UPLINK", title: "open", jp: "灯台",
    headline: "ping me back.",
    serif: "hello@samar.dev · channel open · transmitting.",
    biome: "how to reach me",
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
    interact: "send a signal",
    quests: [
      { id: "R6:link", label: "open the comms link (click email)" },
    ],
    enterEvent: "entering · SEND A SIGNAL",
    contentKind: "summit",
  },
];
