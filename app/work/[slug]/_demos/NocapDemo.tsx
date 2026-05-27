"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Category =
  | "work"
  | "family"
  | "social"
  | "promo"
  | "entertainment"
  | "junk";

type Phase = "chaos" | "activate" | "learning" | "adapted";
type Routing = "alert" | "inbox" | "silent";
type Action = "open" | "ignore" | "important" | "mute";

type NotifTemplate = {
  app: string;
  category: Category;
  title: string;
  body: string;
};

type Notification = NotifTemplate & {
  id: string;
  ts: number;
  score: number;
  routing: Routing;
  reasoning: string[];
  state: "entering" | "shown" | "exiting";
  exitAction?: Action;
  // 2D position in latent space (for vector memory viz)
  vx: number;
  vy: number;
  // stable slot index inside this category's grid (0..15 looping)
  slotIdx: number;
};

const TEMPLATES: NotifTemplate[] = [
  { app: "github", category: "work", title: "CI failed on main", body: "build #247 · jest" },
  { app: "slack", category: "work", title: "@samar from product", body: "got 5 min?" },
  { app: "linear", category: "work", title: "SAM-247 reassigned", body: "you → marco" },
  { app: "vercel", category: "work", title: "deploy succeeded", body: "preview · 8s" },
  { app: "github", category: "work", title: "PR review requested", body: "/api · #382" },
  { app: "datadog", category: "work", title: "error rate spike", body: "p99 +220ms" },
  { app: "mom", category: "family", title: "Mom · call me", body: "(missed call)" },
  { app: "whatsapp", category: "family", title: "Bro · pic.png", body: "look at this" },
  { app: "whatsapp", category: "family", title: "family group", body: "aunt's bday today" },
  { app: "mom", category: "family", title: "Mom · 3 msgs", body: "are you eating?" },
  { app: "instagram", category: "social", title: "new reel · priya", body: "watch now" },
  { app: "twitter", category: "social", title: "12 new likes", body: "on your post" },
  { app: "discord", category: "social", title: "@everyone · #general", body: "anyone online?" },
  { app: "whatsapp", category: "social", title: "college · 47 new", body: "memes thread" },
  { app: "linkedin", category: "social", title: "3 viewed profile", body: "this week" },
  { app: "amazon", category: "promo", title: "FLASH SALE 70%", body: "ends in 2h" },
  { app: "swiggy", category: "promo", title: "50% off orders", body: "code: HUNGRY" },
  { app: "uber", category: "promo", title: "$5 ride credit", body: "this weekend" },
  { app: "netflix", category: "promo", title: "BoJack is back", body: "watch now" },
  { app: "myntra", category: "promo", title: "EOSS · 60% off", body: "shop now" },
  { app: "youtube", category: "entertainment", title: "MKBHD · review", body: "2h ago" },
  { app: "spotify", category: "entertainment", title: "discover weekly", body: "30 tracks" },
  { app: "steam", category: "entertainment", title: "Cyberpunk -50%", body: "wishlist" },
  { app: "twitch", category: "entertainment", title: "shroud is live", body: "valorant" },
  { app: "some_app", category: "junk", title: "rate us 5 stars", body: "(2wks usage)" },
  { app: "ola", category: "junk", title: "how was your ride?", body: "tap to rate" },
  { app: "system", category: "junk", title: "storage 78% full", body: "free up?" },
];

type CatMeta = {
  label: string;
  bar: string;
  text: string;
  bg: string;
  border: string;
  hex: string;
  // light-mode tokens for the phone
  lightChip: string;
  lightText: string;
};

const CATEGORY_META: Record<Category, CatMeta> = {
  work: {
    label: "work",
    bar: "bg-cyan-400",
    text: "text-cyan-200",
    bg: "bg-cyan-400/[0.08]",
    border: "border-cyan-400/40",
    hex: "#0891b2",
    lightChip: "bg-cyan-100 text-cyan-700",
    lightText: "text-cyan-700",
  },
  family: {
    label: "family",
    bar: "bg-emerald-400",
    text: "text-emerald-200",
    bg: "bg-emerald-400/[0.08]",
    border: "border-emerald-400/40",
    hex: "#059669",
    lightChip: "bg-emerald-100 text-emerald-700",
    lightText: "text-emerald-700",
  },
  social: {
    label: "social",
    bar: "bg-violet-400",
    text: "text-violet-200",
    bg: "bg-violet-400/[0.08]",
    border: "border-violet-400/40",
    hex: "#7c3aed",
    lightChip: "bg-violet-100 text-violet-700",
    lightText: "text-violet-700",
  },
  promo: {
    label: "promo",
    bar: "bg-amber-300",
    text: "text-amber-200",
    bg: "bg-amber-300/[0.08]",
    border: "border-amber-300/40",
    hex: "#d97706",
    lightChip: "bg-amber-100 text-amber-700",
    lightText: "text-amber-700",
  },
  entertainment: {
    label: "ent",
    bar: "bg-rose-400",
    text: "text-rose-200",
    bg: "bg-rose-400/[0.08]",
    border: "border-rose-400/40",
    hex: "#e11d48",
    lightChip: "bg-rose-100 text-rose-700",
    lightText: "text-rose-700",
  },
  junk: {
    label: "junk",
    bar: "bg-bone/50",
    text: "text-bone/65",
    bg: "bg-bone/[0.04]",
    border: "border-bone/20",
    hex: "#64748b",
    lightChip: "bg-slate-200 text-slate-600",
    lightText: "text-slate-600",
  },
};

const DEFAULT_WEIGHTS: Record<Category, number> = {
  work: 50,
  family: 50,
  social: 50,
  promo: 50,
  entertainment: 50,
  junk: 50,
};

const AUTO_TENDENCY: Record<
  Category,
  { open: number; ignore: number; important: number; mute: number }
> = {
  work: { open: 0.7, ignore: 0.17, important: 0.13, mute: 0 },
  family: { open: 0.55, ignore: 0.05, important: 0.4, mute: 0 },
  social: { open: 0.2, ignore: 0.6, important: 0.05, mute: 0.15 },
  promo: { open: 0.03, ignore: 0.45, important: 0, mute: 0.52 },
  entertainment: { open: 0.25, ignore: 0.55, important: 0, mute: 0.2 },
  junk: { open: 0, ignore: 0.35, important: 0, mute: 0.65 },
};

const ACTION_DELTA: Record<Action, number> = {
  open: +6,
  ignore: -2,
  important: +12,
  mute: -10,
};

const PHASE_LABEL: Record<Phase, string> = {
  chaos: "everything is loud",
  activate: "filter waking up",
  learning: "watching what you do",
  adapted: "knows your attention",
};

const PHASE_TONE: Record<Phase, string> = {
  chaos: "text-rose-200 border-rose-400/50 bg-rose-400/10",
  activate: "text-amber-200 border-amber-300/60 bg-amber-300/10",
  learning: "text-violet-200 border-violet-400/50 bg-violet-400/10",
  adapted: "text-emerald-200 border-emerald-400/50 bg-emerald-400/10",
};

// emission tempo per phase (ms between attempts)
const PHASE_EMIT_DELAY: Record<Phase, number> = {
  chaos: 850,
  activate: 1400,
  learning: 2200,
  adapted: 3600,
};

// stop emitting once stack gets this full
const STACK_CAP = 5;

// centroid coords per category for vector-memory scatter (in unit square)
const CAT_CENTROID: Record<Category, { x: number; y: number }> = {
  work: { x: 0.22, y: 0.28 },
  family: { x: 0.78, y: 0.22 },
  social: { x: 0.55, y: 0.5 },
  promo: { x: 0.78, y: 0.78 },
  entertainment: { x: 0.22, y: 0.78 },
  junk: { x: 0.5, y: 0.88 },
};

function pickTemplate(): NotifTemplate {
  return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
}

function sampleAuto(category: Category): Action {
  const t = AUTO_TENDENCY[category];
  const r = Math.random();
  let acc = 0;
  for (const key of ["open", "important", "ignore", "mute"] as Action[]) {
    acc += t[key];
    if (r < acc) return key;
  }
  return "ignore";
}

function isWorkHours(hour: number) {
  return hour >= 9 && hour < 19;
}
function isNight(hour: number) {
  return hour >= 23 || hour < 7;
}

function calcPriority(
  t: NotifTemplate,
  weights: Record<Category, number>,
  hour: number,
  workSession: boolean
): { score: number; modifiers: string[] } {
  let score = weights[t.category];
  const modifiers: string[] = [];
  if (workSession && t.category === "entertainment") {
    score -= 18;
    modifiers.push("muted · you're working");
  }
  if (workSession && t.category === "promo") {
    score -= 12;
    modifiers.push("deprio'd · work mode");
  }
  if (isNight(hour) && t.category === "work") {
    score -= 30;
    modifiers.push("work quiet · night hours");
  }
  if (t.category === "family") {
    score += 5;
    modifiers.push("family · always boosted");
  }
  if (isWorkHours(hour) && t.category === "work") {
    score += 8;
    modifiers.push("work hours · prioritized");
  }
  return { score: Math.max(0, Math.min(100, Math.round(score))), modifiers };
}

function routeFromScore(score: number): Routing {
  if (score >= 60) return "alert";
  if (score >= 30) return "inbox";
  return "silent";
}

function buildReasoning(
  t: NotifTemplate,
  weights: Record<Category, number>,
  history: Record<Category, number>,
  modifiers: string[]
): string[] {
  const cat = CATEGORY_META[t.category];
  const w = weights[t.category];
  const seen = history[t.category];
  const lines: string[] = [];
  lines.push(`${cat.label} · learned weight ${w} / 100`);
  if (seen > 4) lines.push(`${seen} similar seen · pattern locked`);
  else if (seen > 0) lines.push(`${seen} similar seen · still learning`);
  for (const m of modifiers) lines.push(m);
  return lines.slice(0, 4);
}

function jitterAround({ x, y }: { x: number; y: number }) {
  const r = 0.16;
  return {
    x: Math.max(0.03, Math.min(0.97, x + (Math.random() - 0.5) * r)),
    y: Math.max(0.03, Math.min(0.97, y + (Math.random() - 0.5) * r)),
  };
}

export default function NocapDemo() {
  const [phase, setPhase] = useState<Phase>("chaos");
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(11);
  const [workSession, setWorkSession] = useState(true);
  const [notifsSeen, setNotifsSeen] = useState(0);

  const [weights, setWeights] = useState<Record<Category, number>>({
    ...DEFAULT_WEIGHTS,
  });
  const [historyCount, setHistoryCount] = useState<Record<Category, number>>({
    work: 0,
    family: 0,
    social: 0,
    promo: 0,
    entertainment: 0,
    junk: 0,
  });

  const [stack, setStack] = useState<Notification[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [bucketStats, setBucketStats] = useState<Record<Routing, number>>({
    alert: 0,
    inbox: 0,
    silent: 0,
  });

  const [autoMode, setAutoMode] = useState(true);
  const [lastAction, setLastAction] = useState<{ action: Action; cat: Category } | null>(null);

  // pgvector memory — last 30 notifications
  const [memory, setMemory] = useState<Notification[]>([]);
  // neural "firing" — the most recent emit triggers an animation pulse
  const [firePulse, setFirePulse] = useState(0);
  // learning event — fires on every accept/mute/ignore/important
  const [learnEvent, setLearnEvent] = useState<{
    key: number;
    action: Action;
    cat: Category;
    delta: number;
    vx: number;
    vy: number;
  } | null>(null);
  // centroid drift per category — visible "alignment learning"
  const [clusterShift, setClusterShift] = useState<
    Record<Category, { dx: number; dy: number }>
  >({
    work: { dx: 0, dy: 0 },
    family: { dx: 0, dy: 0 },
    social: { dx: 0, dy: 0 },
    promo: { dx: 0, dy: 0 },
    entertainment: { dx: 0, dy: 0 },
    junk: { dx: 0, dy: 0 },
  });

  const stackRef = useRef(stack);
  stackRef.current = stack;
  const stateRef = useRef({
    weights,
    historyCount,
    hour,
    workSession,
    autoMode,
    phase,
    notifsSeen,
    clusterShift,
  });
  stateRef.current = {
    weights,
    historyCount,
    hour,
    workSession,
    autoMode,
    phase,
    notifsSeen,
    clusterShift,
  };

  const applyAction = useCallback((n: Notification, action: Action) => {
    const delta = ACTION_DELTA[action];
    setWeights((w) => ({
      ...w,
      [n.category]: Math.max(0, Math.min(100, w[n.category] + delta)),
    }));
    setLastAction({ action, cat: n.category });
    // fire learning event for the visualizations to react
    setLearnEvent({
      key: Date.now(),
      action,
      cat: n.category,
      delta,
      vx: n.vx,
      vy: n.vy,
    });
    // drift the category centroid toward this notification's position
    // strength depends on action: important/open pull harder, mute pushes away gently
    const pull = action === "important" ? 0.08 : action === "open" ? 0.05 : action === "mute" ? -0.03 : 0.015;
    setClusterShift((s) => {
      const prev = s[n.category];
      const base = CAT_CENTROID[n.category];
      const eff = { x: base.x + prev.dx, y: base.y + prev.dy };
      const newDx = prev.dx + (n.vx - eff.x) * pull;
      const newDy = prev.dy + (n.vy - eff.y) * pull;
      // cap drift so it stays bounded
      const cap = 0.18;
      return {
        ...s,
        [n.category]: {
          dx: Math.max(-cap, Math.min(cap, newDx)),
          dy: Math.max(-cap, Math.min(cap, newDy)),
        },
      };
    });
    setStack((s) =>
      s.map((x) => (x.id === n.id ? { ...x, state: "exiting", exitAction: action } : x))
    );
    setTimeout(() => {
      setStack((s) => s.filter((x) => x.id !== n.id));
      if (action === "ignore" || action === "mute") setHiddenCount((c) => c + 1);
    }, 380);
  }, []);

  const emit = useCallback(() => {
    const t = pickTemplate();
    const cur = stateRef.current;
    const nextHistory = {
      ...cur.historyCount,
      [t.category]: cur.historyCount[t.category] + 1,
    };
    setHistoryCount(nextHistory);
    const { score, modifiers } = calcPriority(t, cur.weights, cur.hour, cur.workSession);
    const routing = routeFromScore(score);
    setBucketStats((b) => ({ ...b, [routing]: b[routing] + 1 }));
    const reasoning = buildReasoning(t, cur.weights, nextHistory, modifiers);
    // spawn new notification near its fixed centroid · no drift
    const v = jitterAround(CAT_CENTROID[t.category]);
    const slotIdx = nextHistory[t.category] - 1;
    const notif: Notification = {
      ...t,
      id: Math.random().toString(36).slice(2, 8),
      ts: Date.now(),
      score,
      routing,
      reasoning,
      state: "entering",
      vx: v.x,
      vy: v.y,
      slotIdx,
    };
    setStack((s) => [notif, ...s].slice(0, STACK_CAP));
    setMemory((m) => [notif, ...m].slice(0, 30));
    setFirePulse((p) => p + 1);
    setTimeout(() => {
      setStack((s) => s.map((x) => (x.id === notif.id ? { ...x, state: "shown" } : x)));
    }, 50);
    setNotifsSeen((n) => n + 1);
    return notif;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let emitTimer: ReturnType<typeof setTimeout>;
    let autoActTimer: ReturnType<typeof setTimeout> | null = null;
    let lastEmittedId: string | null = null;

    const step = () => {
      if (cancelled) return;
      const cur = stateRef.current;
      const seen = cur.notifsSeen;
      const stackLen = stackRef.current.length;

      // phase progression
      if (seen >= 28 && cur.phase !== "adapted") setPhase("adapted");
      else if (seen >= 7 && cur.phase !== "learning" && cur.phase !== "adapted")
        setPhase("learning");
      else if (seen >= 4 && cur.phase === "chaos") setPhase("activate");

      // emit only if stack has room
      if (stackLen < STACK_CAP) {
        const n = emit();
        lastEmittedId = n.id;

        // schedule auto-action a bit later, only in autoMode
        if (autoActTimer) clearTimeout(autoActTimer);
        autoActTimer = setTimeout(() => {
          if (cancelled) return;
          if (!stateRef.current.autoMode) return;
          const target = stackRef.current.find((x) => x.id === lastEmittedId);
          if (target) applyAction(target, sampleAuto(target.category));
        }, 1800);

        // advance simulated clock
        setHour((h) => {
          let next = h + (seen < 5 ? 1 : 2);
          while (next >= 24) {
            next -= 24;
            setDay((d) => d + 1);
          }
          setWorkSession(isWorkHours(next));
          return next;
        });
      }

      const delay = PHASE_EMIT_DELAY[cur.phase];
      emitTimer = setTimeout(step, delay);
    };

    step();

    return () => {
      cancelled = true;
      clearTimeout(emitTimer);
      if (autoActTimer) clearTimeout(autoActTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userAction = (n: Notification, action: Action) => {
    setAutoMode(false);
    applyAction(n, action);
  };

  const clearAll = () => {
    const cur = stackRef.current;
    cur.forEach((n) => {
      const delta = ACTION_DELTA.ignore;
      setWeights((w) => ({
        ...w,
        [n.category]: Math.max(0, Math.min(100, w[n.category] + delta)),
      }));
    });
    setStack([]);
    setHiddenCount((c) => c + cur.length);
  };

  const reset = () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    setHistoryCount({ work: 0, family: 0, social: 0, promo: 0, entertainment: 0, junk: 0 });
    setStack([]);
    setBucketStats({ alert: 0, inbox: 0, silent: 0 });
    setHiddenCount(0);
    setNotifsSeen(0);
    setDay(1);
    setHour(11);
    setPhase("chaos");
    setAutoMode(true);
    setLastAction(null);
    setMemory([]);
    setLearnEvent(null);
    setClusterShift({
      work: { dx: 0, dy: 0 },
      family: { dx: 0, dy: 0 },
      social: { dx: 0, dy: 0 },
      promo: { dx: 0, dy: 0 },
      entertainment: { dx: 0, dy: 0 },
      junk: { dx: 0, dy: 0 },
    });
  };

  const topNotif = stack[0] ?? null;

  return (
    <div
      id="nocap-demo-root"
      className="relative overflow-hidden rounded-2xl border border-bone/15 bg-gradient-to-b from-slate-900/70 to-slate-950/85 p-4 backdrop-blur-md md:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(125,163,255,0.5) 0 1px, transparent 1px 3px)",
        }}
      />

      {/* HUD */}
      <div className="relative flex flex-wrap items-center gap-3">
        <PhaseChip phase={phase} />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70">
          ▸ attention engine
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          day {String(day).padStart(2, "0")} · {String(hour).padStart(2, "0")}:00
          {workSession && <span className="ml-1 text-cyan-300">· work mode</span>}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-bone/20 bg-bone/[0.05] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/85 transition hover:border-amber-300/50 hover:text-amber-300"
          >
            reset ↻
          </button>
          <button
            type="button"
            onClick={() => setAutoMode((a) => !a)}
            className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] transition ${
              autoMode
                ? "border-violet-400/60 bg-violet-400/15 text-violet-200 hover:bg-violet-400/25"
                : "border-amber-300/70 bg-amber-300/20 text-amber-100 hover:bg-amber-300/30"
            }`}
          >
            {autoMode ? "◐ auto · learning" : "◉ you · in control"}
          </button>
        </div>
      </div>

      {/* story strip */}
      <div className="relative mt-3 border border-bone/15 bg-bone/[0.05] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/85">
        <span className="text-amber-300">▸</span> {PHASE_LABEL[phase]}{" "}
        <span className="text-bone/55">
          · {notifsSeen} seen · {hiddenCount} hushed · stack {stack.length}/{STACK_CAP}
        </span>
      </div>

      {/* top grid: phone fills col 1, scoring + neural/vector go col 2 */}
      <div className="relative mt-4 grid gap-4 lg:grid-cols-[380px,minmax(0,1fr)] lg:items-stretch lg:gap-6">
        <div className="flex justify-center lg:block">
          <Phone
            stack={stack}
            hour={hour}
            day={day}
            hiddenCount={hiddenCount}
            phase={phase}
            onAction={userAction}
            onClearAll={clearAll}
          />
        </div>

        <div className="flex flex-col gap-3">
          <ScoringCard current={topNotif} lastAction={lastAction} autoMode={autoMode} />
          <div className="grid flex-1 gap-3 md:grid-cols-2">
            <NeuralPane
              current={topNotif}
              firePulse={firePulse}
              learnEvent={learnEvent}
              autoMode={autoMode}
              weights={weights}
            />
            <VectorMemoryPane
              memory={memory}
              current={topNotif}
              learnEvent={learnEvent}
              clusterShift={clusterShift}
            />
          </div>
        </div>
      </div>

      {/* below: weights + routing + timeline span the full width */}
      <div className="relative mt-4 flex flex-col gap-3">
        <WeightsPane weights={weights} history={historyCount} />
        <div className="grid gap-3 md:grid-cols-2">
          <RoutingMixCard stats={bucketStats} />
          <TimelineCard phase={phase} day={day} notifsSeen={notifsSeen} />
        </div>
      </div>
    </div>
  );
}

// ─── Phone frame · light mode lockscreen ─────────────────────────────

function Phone({
  stack,
  hour,
  day,
  hiddenCount,
  phase,
  onAction,
  onClearAll,
}: {
  stack: Notification[];
  hour: number;
  day: number;
  hiddenCount: number;
  phase: Phase;
  onAction: (n: Notification, a: Action) => void;
  onClearAll: () => void;
}) {
  const minute = ((hour * 7 + day * 11) % 60);
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const date = `Thu · May ${27 + Math.floor((day - 1) / 1)}`;
  return (
    <div
      className="relative h-full w-full min-h-[420px] max-w-[380px] shrink-0 rounded-[36px] border-[3px] border-slate-900 bg-slate-950 p-1.5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
      style={{ aspectRatio: "auto" }}
    >
      {/* notch */}
      <div
        aria-hidden
        className="absolute left-1/2 top-2 z-10 flex h-4 w-20 -translate-x-1/2 items-center justify-end gap-1.5 rounded-full bg-black px-2"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
      </div>

      {/* screen — light mode */}
      <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-b from-[#f5f5f7] via-[#eef0f3] to-[#e5e7eb]">
        {/* status bar */}
        <div className="flex items-center justify-between px-5 pt-2.5 pb-1 font-mono text-[10px] text-slate-700">
          <span className="font-semibold tracking-tight">{time}</span>
          <div className="flex items-center gap-1.5">
            <SignalDotsLight />
            <span>92%</span>
            <BatteryGlyphLight />
          </div>
        </div>

        {/* compact lockscreen sub-header */}
        <div className="flex items-center justify-between px-4 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">
          <span className="font-semibold tracking-[0.25em] text-slate-700">{date}</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
            nocap · {stack.length}
          </span>
        </div>

        <div className="flex items-center justify-end px-4 pb-1 font-mono text-[9px] uppercase tracking-[0.25em]">
          <button
            type="button"
            onClick={onClearAll}
            disabled={stack.length === 0}
            className="font-medium text-slate-600 transition hover:text-slate-900 disabled:opacity-30"
          >
            clear all
          </button>
        </div>

        {/* stack */}
        <div
          className="space-y-2 overflow-y-auto px-2.5 pb-10 pt-0"
          style={{ height: "calc(100% - 80px)" }}
        >
          {stack.length === 0 && <EmptyState phase={phase} hiddenCount={hiddenCount} />}
          {stack.map((n) => (
            <PhoneCard key={n.id} n={n} onAction={onAction} />
          ))}
          {hiddenCount > 0 && (
            <div className="rounded-lg bg-slate-200/70 px-3 py-1.5 text-center font-mono text-[9.5px] uppercase tracking-[0.25em] text-slate-500">
              + {hiddenCount} hushed by nocap
            </div>
          )}
        </div>

        {/* home indicator */}
        <div className="absolute inset-x-0 bottom-1.5 flex justify-center">
          <div className="h-1 w-24 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

function SignalDotsLight() {
  return (
    <div className="flex items-end gap-[2px]">
      {[2, 3, 4, 5].map((h, i) => (
        <span
          key={i}
          className="w-[2.5px] rounded-sm bg-slate-600"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function BatteryGlyphLight() {
  return (
    <svg width="18" height="9" viewBox="0 0 18 9" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="14" height="8" rx="1.5" stroke="#475569" />
      <rect x="2" y="2" width="11" height="5" rx="0.5" fill="#475569" />
      <rect x="15" y="3" width="2" height="3" rx="0.6" fill="#475569" />
    </svg>
  );
}

function PhoneCard({
  n,
  onAction,
}: {
  n: Notification;
  onAction: (n: Notification, a: Action) => void;
}) {
  const m = CATEGORY_META[n.category];
  const exitTone =
    n.exitAction === "open"
      ? "translate-x-[160%] opacity-0"
      : n.exitAction === "mute"
      ? "-translate-x-[160%] opacity-0"
      : n.exitAction === "important"
      ? "scale-[1.05] opacity-0"
      : "translate-y-2 opacity-0";

  const routingLabel = {
    alert: "ALERT",
    inbox: "INBOX",
    silent: "QUIET",
  }[n.routing];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-8px_rgba(0,0,0,0.18)] transition-all duration-300 ${
        n.state === "entering"
          ? "-translate-y-2 opacity-0"
          : n.state === "exiting"
          ? exitTone
          : "translate-y-0 opacity-100"
      }`}
    >
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${m.lightChip} font-mono text-[11px] font-semibold uppercase`}
        >
          {n.app.slice(0, 2)}
        </div>
        <button type="button" onClick={() => onAction(n, "open")} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
            <span className="font-semibold">{n.app}</span>
            <span className="text-slate-400">·</span>
            <span className={`${m.lightText} font-semibold`}>{m.label}</span>
            <span className="ml-auto rounded bg-slate-100 px-1.5 py-[1px] text-[8.5px] text-slate-600">
              {routingLabel}
            </span>
          </div>
          <div className="mt-0.5 truncate font-sans text-[13px] font-semibold text-slate-900">
            {n.title}
          </div>
          {n.body && (
            <div className="truncate font-sans text-[11.5px] text-slate-500">{n.body}</div>
          )}
        </button>
      </div>

      {/* action bar */}
      <div className="flex items-stretch border-t border-slate-200 text-[9px] uppercase tracking-[0.2em]">
        <button
          type="button"
          onClick={() => onAction(n, "open")}
          className="flex-1 border-r border-slate-200 px-2 py-1.5 font-semibold text-emerald-600 transition hover:bg-emerald-50"
          title="open · +6 weight"
        >
          ▸ open
        </button>
        <button
          type="button"
          onClick={() => onAction(n, "important")}
          className="flex-1 border-r border-slate-200 px-2 py-1.5 font-semibold text-cyan-600 transition hover:bg-cyan-50"
          title="important · +12 weight"
        >
          ★ keep
        </button>
        <button
          type="button"
          onClick={() => onAction(n, "mute")}
          className="flex-1 px-2 py-1.5 font-semibold text-rose-600 transition hover:bg-rose-50"
          title="mute similar · -10 weight"
        >
          ✕ mute
        </button>
      </div>
    </div>
  );
}

function EmptyState({ phase, hiddenCount }: { phase: Phase; hiddenCount: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pt-6 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
        {phase === "adapted" ? "all quiet · only the signal" : "waiting for next event"}
      </div>
      {hiddenCount > 0 && (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-700/80">
          {hiddenCount} hushed this session
        </div>
      )}
    </div>
  );
}

// ─── Brain pane · lighter cards ─────────────────────────────────────

const CARD = "rounded-xl border border-bone/15 bg-bone/[0.04] p-4 backdrop-blur-sm";
const CARD_HEAD =
  "mb-3 flex items-center justify-between border-b border-bone/15 pb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300";

function ScoringCard({
  current,
  lastAction,
  autoMode,
}: {
  current: Notification | null;
  lastAction: { action: Action; cat: Category } | null;
  autoMode: boolean;
}) {
  if (!current) {
    return (
      <div className={`${CARD} min-h-[280px]`}>
        <div className="font-mono text-[11px] text-bone/55">
          [ scoring · waiting on first event ]
        </div>
      </div>
    );
  }
  const m = CATEGORY_META[current.category];
  return (
    <div className={`${CARD} min-h-[280px]`}>
      <div className={CARD_HEAD}>
        <span>[ live scoring · top of stack ]</span>
        <span className={autoMode ? "text-violet-300 animate-pulse" : "text-amber-300"}>
          {autoMode ? "auto · simulated user" : "you · driving"}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${m.border} ${m.bg} ${m.text} font-mono text-[11px] uppercase`}
        >
          {current.app.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70">
            <span>{current.app}</span>
            <span className="text-bone/40">·</span>
            <span className={m.text}>{m.label}</span>
          </div>
          <div className="mt-0.5 truncate font-sans text-[15px] font-medium text-bone">
            {current.title}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em]">
          <span className="text-bone/70">priority</span>
          <span className={m.text}>
            {current.score} / 100 ·{" "}
            <span
              className={
                current.routing === "alert"
                  ? "text-emerald-300"
                  : current.routing === "inbox"
                  ? "text-amber-300"
                  : "text-bone/70"
              }
            >
              {current.routing}
            </span>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-sm bg-bone/[0.08]">
          <div
            className={`h-full ${m.bar}`}
            style={{
              width: `${current.score}%`,
              transition: "width 320ms ease-out",
              boxShadow: `0 0 8px ${m.hex}80`,
            }}
          />
        </div>
      </div>

      <div className="mt-3 rounded-md border border-bone/15 bg-bone/[0.05] p-3">
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70">
          why this score
        </div>
        <ul className="space-y-1 font-mono text-[11px] text-bone">
          {current.reasoning.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-amber-300">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {lastAction && (
        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]">
          <span className="text-bone/55">last move</span>
          <ActionGlyph action={lastAction.action} />
          <span className={CATEGORY_META[lastAction.cat].text}>{CATEGORY_META[lastAction.cat].label}</span>
          <span className="text-bone/55">→ weight</span>
          <span className={ACTION_DELTA[lastAction.action] > 0 ? "text-emerald-300" : "text-rose-300"}>
            {ACTION_DELTA[lastAction.action] > 0 ? "+" : ""}
            {ACTION_DELTA[lastAction.action]}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── NeuralPane · clean network with emit + learn pulses ───────────

function NeuralPane({
  current,
  firePulse,
  learnEvent,
  autoMode,
}: {
  current: Notification | null;
  firePulse: number;
  learnEvent: {
    key: number;
    action: Action;
    cat: Category;
    delta: number;
    vx: number;
    vy: number;
  } | null;
  autoMode: boolean;
  weights?: Record<Category, number>;
}) {
  const W = 320;
  const H = 184;
  const xInput = 72;
  const xHidden = 168;
  const xOutput = 264;

  const inputs = [
    { y: 22, label: "category" },
    { y: 56, label: "app" },
    { y: 90, label: "hour" },
    { y: 124, label: "history" },
    { y: 158, label: "work mode" },
  ];
  const hidden = [{ y: 38 }, { y: 74 }, { y: 110 }, { y: 146 }];
  const outputs: { y: number; label: Routing; color: string }[] = [
    { y: 38, label: "alert", color: "#34d399" },
    { y: 92, label: "inbox", color: "#fbbf24" },
    { y: 146, label: "silent", color: "#94a3b8" },
  ];

  const [activeKey, setActiveKey] = useState(0);
  useEffect(() => {
    setActiveKey((k) => k + 1);
  }, [firePulse]);

  const [learnKey, setLearnKey] = useState(0);
  const [learnFlash, setLearnFlash] = useState<{ cat: Category; delta: number } | null>(null);
  useEffect(() => {
    if (!learnEvent) return;
    setLearnKey((k) => k + 1);
    setLearnFlash({ cat: learnEvent.cat, delta: learnEvent.delta });
    const t = setTimeout(() => setLearnFlash(null), 1100);
    return () => clearTimeout(t);
  }, [learnEvent?.key]);
  const learnColor = learnFlash ? CATEGORY_META[learnFlash.cat].hex : "#a78bfa";

  const outputDistribution = (() => {
    if (!current) return { alert: 0.33, inbox: 0.33, silent: 0.34 };
    const s = current.score;
    if (s >= 60) return { alert: 0.78, inbox: 0.18, silent: 0.04 };
    if (s >= 30) return { alert: 0.08, inbox: 0.78, silent: 0.14 };
    return { alert: 0.03, inbox: 0.17, silent: 0.8 };
  })();

  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <span>[ neural · attention model ]</span>
        {learnFlash ? (
          <span
            className="flex items-center gap-1"
            style={{ color: learnColor }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: learnColor, boxShadow: `0 0 8px ${learnColor}` }}
            />
            backprop · {CATEGORY_META[learnFlash.cat].label}{" "}
            {learnFlash.delta > 0 ? "+" : ""}
            {learnFlash.delta}
          </span>
        ) : (
          <span className="text-violet-300">
            {autoMode ? "thinking · auto" : "thinking · live"}
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
        aria-hidden
      >
        {/* connections input → hidden · flowing dashes */}
        {inputs.map((i, ii) =>
          hidden.map((h, hi) => (
            <line
              key={`ih-${ii}-${hi}`}
              x1={xInput + 4}
              y1={i.y}
              x2={xHidden - 4}
              y2={h.y}
              stroke="#94a3b8"
              strokeOpacity={0.28}
              strokeWidth={0.8}
              strokeDasharray="2 4"
              className="nn-signal"
              style={{ animationDelay: `-${((ii * 4 + hi) * 0.11).toFixed(2)}s` }}
            />
          ))
        )}
        {/* connections hidden → output · faster flow on winning route */}
        {hidden.map((h, hi) =>
          outputs.map((o, oi) => {
            const weight = [
              outputDistribution.alert,
              outputDistribution.inbox,
              outputDistribution.silent,
            ][oi];
            return (
              <line
                key={`ho-${hi}-${oi}`}
                x1={xHidden + 4}
                y1={h.y}
                x2={xOutput - 4}
                y2={o.y}
                stroke={o.color}
                strokeOpacity={0.22 + weight * 0.7}
                strokeWidth={0.7 + weight * 1.6}
                strokeDasharray="2 4"
                className={weight > 0.5 ? "nn-signal-fast" : "nn-signal"}
                style={{ animationDelay: `-${((hi * 3 + oi) * 0.13).toFixed(2)}s` }}
              />
            );
          })
        )}

        {/* forward pulse · on each emit */}
        {current && (
          <g key={`fwd-${activeKey}`}>
            {inputs.map((i, ii) =>
              hidden.map((h, hi) => (
                <circle key={`p1-${ii}-${hi}`} r="1.8" fill="#ffd54a">
                  <animate attributeName="cx" from={xInput + 4} to={xHidden - 4} dur="0.4s" begin={`${ii * 0.04}s`} fill="freeze" />
                  <animate attributeName="cy" from={i.y} to={h.y} dur="0.4s" begin={`${ii * 0.04}s`} fill="freeze" />
                  <animate attributeName="opacity" from="1" to="0" dur="0.4s" begin={`${ii * 0.04}s`} fill="freeze" />
                </circle>
              ))
            )}
            {hidden.map((h, hi) =>
              outputs.map((o, oi) => (
                <circle key={`p2-${hi}-${oi}`} r="2" fill={o.color}>
                  <animate attributeName="cx" from={xHidden + 4} to={xOutput - 4} dur="0.45s" begin={`${0.3 + hi * 0.04}s`} fill="freeze" />
                  <animate attributeName="cy" from={h.y} to={o.y} dur="0.45s" begin={`${0.3 + hi * 0.04}s`} fill="freeze" />
                  <animate attributeName="opacity" from="1" to="0" dur="0.45s" begin={`${0.3 + hi * 0.04}s`} fill="freeze" />
                </circle>
              ))
            )}
          </g>
        )}

        {/* backward pulse · on each action (learn) */}
        {learnEvent && (
          <g key={`back-${learnKey}`}>
            {outputs.map((o, oi) =>
              hidden.map((h, hi) => (
                <circle key={`b1-${oi}-${hi}`} r="2" fill={learnColor}>
                  <animate attributeName="cx" from={xOutput - 4} to={xHidden + 4} dur="0.5s" begin={`${oi * 0.05}s`} fill="freeze" />
                  <animate attributeName="cy" from={o.y} to={h.y} dur="0.5s" begin={`${oi * 0.05}s`} fill="freeze" />
                  <animate attributeName="opacity" from="1" to="0" dur="0.5s" begin={`${oi * 0.05}s`} fill="freeze" />
                </circle>
              ))
            )}
            {hidden.map((h, hi) =>
              inputs.map((i, ii) => (
                <circle key={`b2-${hi}-${ii}`} r="1.8" fill={learnColor}>
                  <animate attributeName="cx" from={xHidden - 4} to={xInput + 4} dur="0.55s" begin={`${0.4 + hi * 0.05}s`} fill="freeze" />
                  <animate attributeName="cy" from={h.y} to={i.y} dur="0.55s" begin={`${0.4 + hi * 0.05}s`} fill="freeze" />
                  <animate attributeName="opacity" from="1" to="0" dur="0.55s" begin={`${0.4 + hi * 0.05}s`} fill="freeze" />
                </circle>
              ))
            )}
          </g>
        )}

        {/* inputs · pulsing in place */}
        {inputs.map((i, ii) => {
          const delay = `-${(ii * 0.5).toFixed(2)}s`;
          return (
            <g key={`in-${ii}`}>
              <circle cx={xInput} cy={i.y} r="6" fill="#e2e8f0" opacity="0.18">
                <animate attributeName="r" values="6;9;6" dur="2.8s" begin={delay} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.18;0.05;0.18" dur="2.8s" begin={delay} repeatCount="indefinite" />
              </circle>
              <circle cx={xInput} cy={i.y} r="4" fill="#e2e8f0">
                <animate attributeName="r" values="4;4.7;4" dur="2.2s" begin={delay} repeatCount="indefinite" />
              </circle>
              <text x={xInput - 14} y={i.y + 3} textAnchor="end" fontSize="8" fill="#cbd5e1" fontFamily="monospace">
                {i.label}
              </text>
            </g>
          );
        })}
        {/* hidden · pulsing violet */}
        {hidden.map((h, hi) => {
          const delay = `-${(hi * 0.4 + 0.2).toFixed(2)}s`;
          return (
            <g key={`hd-${hi}`}>
              <circle cx={xHidden} cy={h.y} r="6" fill="#a78bfa" opacity="0.2">
                <animate attributeName="r" values="6;9;6" dur="2.6s" begin={delay} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.06;0.2" dur="2.6s" begin={delay} repeatCount="indefinite" />
              </circle>
              <circle cx={xHidden} cy={h.y} r="3.4" fill="#a78bfa">
                <animate attributeName="r" values="3.4;4.2;3.4" dur="2s" begin={delay} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
        {/* outputs · fixed radius, opacity carries the weight */}
        {outputs.map((o, oi) => {
          const weight = [outputDistribution.alert, outputDistribution.inbox, outputDistribution.silent][oi];
          const delay = `-${(oi * 0.5 + 0.1).toFixed(2)}s`;
          return (
            <g key={`out-${oi}`}>
              <circle cx={xOutput} cy={o.y} r="10" fill={o.color} opacity={0.08 + weight * 0.18}>
                <animate attributeName="r" values="10;12.5;10" dur="3s" begin={delay} repeatCount="indefinite" />
                <animate attributeName="opacity" values={`${0.08 + weight * 0.18};${0.03 + weight * 0.1};${0.08 + weight * 0.18}`} dur="3s" begin={delay} repeatCount="indefinite" />
              </circle>
              <circle cx={xOutput} cy={o.y} r="5" fill={o.color} opacity={0.5 + weight * 0.5}>
                <animate attributeName="r" values="5;5.7;5" dur="2.4s" begin={delay} repeatCount="indefinite" />
              </circle>
              <text x={xOutput + 12} y={o.y + 3} fontSize="8" fill={o.color} fontFamily="monospace" fontWeight="600">
                {o.label}
              </text>
              <text x={xOutput + 12} y={o.y + 13} fontSize="7" fill="#cbd5e1" fontFamily="monospace">
                {Math.round(weight * 100)}%
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/65">
        ▸ features → hidden → routing prediction
      </div>

      <style jsx>{`
        :global(.nn-signal) {
          animation: nnSignalFlow 2.2s linear infinite;
        }
        :global(.nn-signal-fast) {
          animation: nnSignalFlow 1s linear infinite;
        }
        @keyframes nnSignalFlow {
          from {
            stroke-dashoffset: 18;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

// ─── pgvector · galaxy-style semantic embedding ─────────────────────

function VectorMemoryPane({
  memory,
  current,
  learnEvent,
  clusterShift,
}: {
  memory: Notification[];
  current: Notification | null;
  learnEvent: {
    key: number;
    action: Action;
    cat: Category;
    delta: number;
    vx: number;
    vy: number;
  } | null;
  clusterShift: Record<Category, { dx: number; dy: number }>;
}) {
  const W = 360;
  const H = 240;
  const PAD = 18;
  const toX = (vx: number) => PAD + vx * (W - PAD * 2);
  const toY = (vy: number) => PAD + vy * (H - PAD * 2);

  // static centroids only · no drift, layout never shifts
  const effectiveCentroid = (cat: Category) => CAT_CENTROID[cat];

  // deterministic grid slot inside a category region
  const SLOT_COLS = 4;
  const SLOT_ROWS = 4;
  const SLOT_SPACING = 0.06;
  const slotOf = (cat: Category, idx: number) => {
    const i = idx % (SLOT_COLS * SLOT_ROWS);
    const col = i % SLOT_COLS;
    const row = Math.floor(i / SLOT_COLS);
    const cx = CAT_CENTROID[cat].x;
    const cy = CAT_CENTROID[cat].y;
    return {
      x: Math.max(0.04, Math.min(0.96, cx + (col - (SLOT_COLS - 1) / 2) * SLOT_SPACING)),
      y: Math.max(0.04, Math.min(0.96, cy + (row - (SLOT_ROWS - 1) / 2) * SLOT_SPACING)),
    };
  };

  const neighbors = useMemo(() => {
    if (!current) return [];
    const ranked = memory
      .filter((m) => m.id !== current.id)
      .map((m) => {
        const d = Math.hypot(m.vx - current.vx, m.vy - current.vy);
        const sim = Math.max(0, 1 - d / 1.0);
        return { m, d, sim };
      })
      .sort((a, b) => a.d - b.d);
    // keep the single nearest per category so labels spread across the canvas
    const seen = new Set<Category>();
    const picked: typeof ranked = [];
    for (const r of ranked) {
      if (seen.has(r.m.category)) continue;
      seen.add(r.m.category);
      picked.push(r);
      if (picked.length >= 3) break;
    }
    return picked;
  }, [memory, current]);

  const neighborMix = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    neighbors.forEach((n) => {
      counts[n.m.category] = (counts[n.m.category] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]) as [Category, number][];
  }, [neighbors]);

  const [learnFlash, setLearnFlash] = useState<{ cat: Category; delta: number } | null>(null);
  useEffect(() => {
    if (!learnEvent) return;
    setLearnFlash({ cat: learnEvent.cat, delta: learnEvent.delta });
    const t = setTimeout(() => setLearnFlash(null), 1200);
    return () => clearTimeout(t);
  }, [learnEvent?.key]);

  const LABEL_OFFSET: Record<
    Category,
    { x: number; y: number; anchor: "start" | "end" | "middle" }
  > = {
    work: { x: 0.05, y: -0.12, anchor: "start" },
    family: { x: -0.05, y: -0.12, anchor: "end" },
    social: { x: 0.04, y: -0.18, anchor: "start" },
    promo: { x: -0.05, y: 0.13, anchor: "end" },
    entertainment: { x: 0.05, y: 0.13, anchor: "start" },
    junk: { x: 0, y: 0.1, anchor: "middle" },
  };

  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <span>[ pgvector · semantic memory ]</span>
        {learnFlash ? (
          <span
            className="flex items-center gap-1"
            style={{ color: CATEGORY_META[learnFlash.cat].hex }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
              style={{
                background: CATEGORY_META[learnFlash.cat].hex,
                boxShadow: `0 0 8px ${CATEGORY_META[learnFlash.cat].hex}`,
              }}
            />
            cluster shifting · {CATEGORY_META[learnFlash.cat].label}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#ffd54a] animate-pulse" />
            {memory.length} embeddings
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),104px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ aspectRatio: `${W} / ${H}` }}
          aria-hidden
        >
          {/* cluster labels — small floating text above each cluster's natural spread */}
          {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const c = CAT_CENTROID[cat];
            const flashing = learnFlash?.cat === cat;
            return (
              <text
                key={`lbl-${cat}`}
                x={toX(c.x)}
                y={toY(c.y) - 22}
                textAnchor="middle"
                fontSize="8.5"
                fill={meta.hex}
                opacity={flashing ? 1 : 0.7}
                fontFamily="monospace"
                fontWeight="700"
                style={{
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  transition: "opacity 300ms",
                }}
              >
                {meta.label}
              </text>
            );
          })}

          {/* KNN connection lines · drawn before dots so dots sit on top */}
          {current &&
            neighbors.map((n, i) => {
              const lx = toX(n.m.vx);
              const ly = toY(n.m.vy);
              const cx = toX(current.vx);
              const cy = toY(current.vy);
              return (
                <line
                  key={`knn-line-${n.m.id}`}
                  x1={lx}
                  y1={ly}
                  x2={cx}
                  y2={cy}
                  stroke="#fbbf24"
                  strokeOpacity={0.6 - i * 0.08}
                  strokeWidth={1.1}
                />
              );
            })}

          {/* memory nodes · natural positions, gentle float */}
          {memory.map((m, idx) => {
            if (current?.id === m.id) return null;
            const dur = 4 + (idx % 4) * 0.6;
            const delay = -((idx * 0.37) % dur);
            return (
              <circle
                key={m.id}
                cx={toX(m.vx)}
                cy={toY(m.vy)}
                r="6.5"
                fill={CATEGORY_META[m.category].hex}
                stroke="#fafaf3"
                strokeWidth="0.4"
                strokeOpacity="0.75"
                opacity="0.95"
                className={`vm-float-${idx % 3}`}
                style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
              />
            );
          })}

          {/* current node · clean ring + filled core, floating */}
          {current && (() => {
            const meta = CATEGORY_META[current.category];
            return (
              <g className="vm-float-0" style={{ animationDuration: "5s" }}>
                <circle cx={toX(current.vx)} cy={toY(current.vy)} r="14" fill="none" stroke={meta.hex} strokeOpacity="0.6" strokeWidth="1.6" />
                <circle cx={toX(current.vx)} cy={toY(current.vy)} r="9" fill={meta.hex} stroke="#fafaf3" strokeWidth="1.8" />
              </g>
            );
          })()}

          {/* KNN sim labels · rendered LAST so they sit above dots & lines */}
          {current &&
            neighbors.map((n, i) => {
              const lx = toX(n.m.vx);
              const ly = toY(n.m.vy);
              const cx = toX(current.vx);
              const cy = toY(current.vy);
              const dx = cx - lx;
              const dy = cy - ly;
              const len = Math.max(1, Math.hypot(dx, dy));
              const px = -dy / len;
              const py = dx / len;
              // bigger nudge perpendicular + bias toward neighbor end (35%)
              const nudge = (i % 2 === 0 ? 1 : -1) * 13;
              const tx = lx + dx * 0.38 + px * nudge;
              const ty = ly + dy * 0.38 + py * nudge;
              return (
                <g key={`knn-lbl-${n.m.id}`}>
                  <rect
                    x={tx - 15}
                    y={ty - 7}
                    width="30"
                    height="14"
                    rx="3"
                    fill="#02050f"
                    stroke="#fbbf24"
                    strokeOpacity="0.75"
                    strokeWidth="0.9"
                  />
                  <text
                    x={tx}
                    y={ty + 3.5}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#fde047"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {n.sim.toFixed(2)}
                  </text>
                </g>
              );
            })}
        </svg>

        {/* side legend */}
        <ul className="flex flex-col gap-1.5 font-mono text-[10px]">
          {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = memory.filter((m) => m.category === cat).length;
            const isActive = current?.category === cat;
            const isLearning = learnFlash?.cat === cat;
            const hot = isActive || isLearning;
            return (
              <li key={cat} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: meta.hex,
                    boxShadow: hot ? `0 0 6px ${meta.hex}` : "none",
                  }}
                />
                <span className={`uppercase tracking-[0.22em] ${hot ? meta.text : "text-bone/65"}`}>
                  {meta.label}
                </span>
                <span className="ml-auto text-bone/75">{count}</span>
              </li>
            );
          })}
        </ul>

      </div>

      <div className="mt-2 space-y-0.5 font-mono text-[10px] text-bone/75">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-amber-300" />
            <span className="uppercase tracking-[0.2em] text-bone/65">
              line · this event is similar to past one
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block rounded border border-amber-300/70 bg-[#02050f] px-1 text-[9px] font-bold text-amber-200">
              0.94
            </span>
            <span className="uppercase tracking-[0.2em] text-bone/65">
              similarity · 1.0 identical · 0 unrelated
            </span>
          </span>
        </div>
      </div>

      <style jsx>{`
        :global(.vm-float-0),
        :global(.vm-float-1),
        :global(.vm-float-2) {
          transform-box: fill-box;
          transform-origin: center;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        :global(.vm-float-0) {
          animation-name: vmFloat0;
        }
        :global(.vm-float-1) {
          animation-name: vmFloat1;
        }
        :global(.vm-float-2) {
          animation-name: vmFloat2;
        }
        @keyframes vmFloat0 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(4px, -3px);
          }
          66% {
            transform: translate(-3px, -4px);
          }
        }
        @keyframes vmFloat1 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-4px, 3.5px);
          }
        }
        @keyframes vmFloat2 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(3.5px, 3.5px);
          }
          75% {
            transform: translate(-3.5px, -3px);
          }
        }
      `}</style>
    </div>
  );
}

function WeightsPane({
  weights,
  history,
}: {
  weights: Record<Category, number>;
  history: Record<Category, number>;
}) {
  const rows: Category[] = ["work", "family", "social", "promo", "entertainment", "junk"];
  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <span>[ attention weights · learned ]</span>
        <span className="text-bone/55">live</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((cat) => {
          const m = CATEGORY_META[cat];
          const w = weights[cat];
          const h = history[cat];
          const delta = w - DEFAULT_WEIGHTS[cat];
          return (
            <div key={cat}>
              <div className="flex items-baseline justify-between font-mono text-[10.5px]">
                <span className={`uppercase tracking-[0.22em] ${m.text}`}>{m.label}</span>
                <span className="flex items-center gap-2 text-bone">
                  <span className="text-bone/55">{h}×</span>
                  <span>{w}</span>
                  {delta !== 0 && (
                    <span className={delta > 0 ? "text-emerald-300" : "text-rose-300"}>
                      ({delta > 0 ? "+" : ""}
                      {delta})
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-bone/[0.08]">
                <div
                  className={`h-full ${m.bar}`}
                  style={{
                    width: `${w}%`,
                    transition: "width 380ms ease-out",
                    boxShadow: `0 0 6px ${m.hex}80`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoutingMixCard({ stats }: { stats: Record<Routing, number> }) {
  const total = stats.alert + stats.inbox + stats.silent || 1;
  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <span>[ routing mix ]</span>
        <span className="text-bone/55">{total} routed</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-sm bg-bone/[0.08]">
        <div className="bg-emerald-400 transition-[width] duration-300" style={{ width: `${(stats.alert / total) * 100}%` }} />
        <div className="bg-amber-300 transition-[width] duration-300" style={{ width: `${(stats.inbox / total) * 100}%` }} />
        <div className="bg-bone/50 transition-[width] duration-300" style={{ width: `${(stats.silent / total) * 100}%` }} />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px]">
        <span className="text-emerald-300">alert · {stats.alert}</span>
        <span className="text-amber-300">inbox · {stats.inbox}</span>
        <span className="text-bone/55">silent · {stats.silent}</span>
      </div>
    </div>
  );
}

function TimelineCard({
  phase,
  day,
  notifsSeen,
}: {
  phase: Phase;
  day: number;
  notifsSeen: number;
}) {
  const segs: { key: Phase; label: string; sub: string }[] = [
    { key: "chaos", label: "wk 1", sub: "chaos" },
    { key: "activate", label: "wk 2", sub: "boot" },
    { key: "learning", label: "wk 4", sub: "learn" },
    { key: "adapted", label: "wk 12", sub: "adapt" },
  ];
  const activeIdx = segs.findIndex((s) => s.key === phase);
  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <span>[ evolution ]</span>
        <span className="text-bone/55">d{day} · {notifsSeen}</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {segs.map((s, i) => {
          const filled = i <= activeIdx;
          const cur = i === activeIdx;
          return (
            <div
              key={s.key}
              className={`border px-1.5 py-1.5 text-center transition ${
                cur
                  ? "border-amber-300/60 bg-amber-300/[0.12]"
                  : filled
                  ? "border-emerald-400/30 bg-emerald-400/[0.06]"
                  : "border-bone/15 bg-bone/[0.03]"
              }`}
            >
              <div
                className={`font-mono text-[9px] uppercase tracking-[0.22em] ${
                  cur ? "text-amber-200" : filled ? "text-emerald-300" : "text-bone/55"
                }`}
              >
                {s.label}
              </div>
              <div
                className={`mt-0.5 font-mono text-[10px] ${
                  cur ? "text-bone" : filled ? "text-bone" : "text-bone/55"
                }`}
              >
                {s.sub}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseChip({ phase }: { phase: Phase }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] ${PHASE_TONE[phase]}`}>
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          phase === "chaos"
            ? "bg-rose-400 shadow-[0_0_8px_#fb7185] animate-pulse"
            : phase === "activate"
            ? "bg-amber-300 shadow-[0_0_8px_#ffd54a] animate-pulse"
            : phase === "learning"
            ? "bg-violet-400 shadow-[0_0_8px_#a78bfa] animate-pulse"
            : "bg-emerald-400 shadow-[0_0_8px_#34d399]"
        }`}
      />
      [{phase}]
    </div>
  );
}

function ActionGlyph({ action }: { action: Action }) {
  const map: Record<Action, { glyph: string; cls: string }> = {
    open: { glyph: "▸", cls: "text-emerald-300" },
    ignore: { glyph: "○", cls: "text-bone/55" },
    important: { glyph: "★", cls: "text-cyan-300" },
    mute: { glyph: "✕", cls: "text-rose-300" },
  };
  const m = map[action];
  return <span className={`w-3 shrink-0 text-center ${m.cls}`}>{m.glyph}</span>;
}
