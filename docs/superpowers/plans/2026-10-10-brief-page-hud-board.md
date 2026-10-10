# Brief Page HUD Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the brief page's ten stacked prose sections with a bento HUD status board: short headlines + visuals per panel, full prose behind a "decrypt" toggle, panels boot in once on scroll.

**Architecture:** A pure `shortCopy()` resolver turns a `Project` (with optional hand-written `brief`) into short copy with first-sentence fallbacks. Client primitives (`HudPanel`, `Decrypt`, `useReveal`, counting `StatTiles`) render panels; a server `Board` lays them out in a 6-column grid. `page.tsx` keeps masthead, §00 media and nav, and renders `<Board>` in place of §01–§10.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind 3, TypeScript 5. Tests: Node 22 built-in runner with `--experimental-strip-types` (no new deps).

**Spec:** `docs/superpowers/specs/2026-10-10-brief-page-hud-board-design.md`

## Global Constraints

- No new dependencies.
- §00 media (live CTA, Notchfy stage, simulators, galleries, client dossier), masthead, prev/next nav and footer links stay unchanged.
- No long-form content deleted; long fields feed decrypt.
- Client briefs (`p.client` set): no WHY panel, no TRADEOFFS panel.
- Never render an empty panel: missing visuals → headline + decrypt only.
- Motion only on first reveal (≥25% visible); `prefers-reduced-motion: reduce` → final state immediately.
- Content must be visible in server-rendered HTML (hidden state applied only after mount).
- Grid: 6 cols ≥1024px, 2 cols ≥768px, 1 col below. Same reading order.
- Accent palette: amber default, violet architecture, rose hard part, sky scale, emerald roadmap.
- Short headlines ~60–100 chars.

## Review Focus

1. A project with no `brief` and a missing map/stats/milestones → panels fall back to first sentences, no empty boxes. (Task 1 test + Task 3 check on `eeo-modules`.)
2. `brief.tradeoffs`/`brief.decisions` shorter than the long arrays → missing entries fall back per index, never `undefined` text. (Task 1 test.)
3. JavaScript disabled / slow hydration → server HTML shows every panel's content. (Task 3 check: `curl` HTML contains headline text and no `opacity:0` inline style.)
4. Reduced-motion users → no animation, final state. (Task 2 code path; Task 5 check.)
5. 390px phone with long stat values ("macOS 14+ · apple silicon + intel") and long headlines → no horizontal overflow. (Task 5 check.)

---

### Task 1: Short-copy resolver

**Files:**
- Modify: `content/projects.ts` (add `brief?` to `Project` type, lines 3–54)
- Create: `app/work/[slug]/_board/brief.ts`
- Test: `app/work/[slug]/_board/brief.test.mts`

**Interfaces:**
- Produces: `type ShortCopy`, `firstSentence(s: string): string`, `splitTradeoff(t: string): { gain: string; cost?: string }`, `shortCopy(p: BriefSource): ShortCopy`.

- [ ] **Step 1: Add the type to `Project`** — in `content/projects.ts`, after `shots?: ...;` add:

```ts
  // hand-written short copy for the HUD board — missing keys fall back to the first sentence
  brief?: {
    problem?: string;
    why?: string;
    architecture?: string;
    challenge?: string;
    scale?: string;
    future?: string;
    outcome?: string;
    tradeoffs?: { gain: string; cost?: string }[];
    decisions?: string[];
  };
```

- [ ] **Step 2: Write the failing test** — `app/work/[slug]/_board/brief.test.mts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { firstSentence, splitTradeoff, shortCopy } from "./brief.ts";

const base = {
  problem: "Phones are noisy. Very noisy.",
  why: "I missed a message. It hurt.",
  architecture: "Three parts. A, B, C.",
  challenge: "Speed! Always speed.",
  scale: "One user.",
  future: "More stuff later. Maybe.",
  outcome: "It works? Mostly.",
  tradeoffs: [
    "On-device over cloud · free and offline. Cost: analysis takes battery. More text.",
    "Android only. iOS hides notifications.",
  ],
  decisions: [
    { title: "A", body: "Body A first. Second." },
    { title: "B", body: "Body B first. Second." },
  ],
};

test("firstSentence takes up to the first terminator", () => {
  assert.equal(firstSentence("Hello there. More."), "Hello there.");
  assert.equal(firstSentence("Speed! Always."), "Speed!");
  assert.equal(firstSentence("  no   terminator  "), "no terminator");
});

test("splitTradeoff splits head · body and Cost:", () => {
  assert.deepEqual(splitTradeoff(base.tradeoffs[0]), {
    gain: "On-device over cloud",
    cost: "analysis takes battery.",
  });
  assert.deepEqual(splitTradeoff(base.tradeoffs[1]), { gain: "Android only.", cost: undefined });
});

test("shortCopy falls back to first sentences with no brief", () => {
  const c = shortCopy(base);
  assert.equal(c.problem, "Phones are noisy.");
  assert.equal(c.why, "I missed a message.");
  assert.equal(c.architecture, "Three parts.");
  assert.equal(c.future, "More stuff later.");
  assert.equal(c.outcome, "It works?");
  assert.equal(c.decisions[1].tldr, "Body B first.");
  assert.equal(c.decisions[1].body, "Body B first. Second.");
  assert.equal(c.tradeoffs[0].body, base.tradeoffs[0]);
});

test("shortCopy prefers brief and falls back per index", () => {
  const c = shortCopy({
    ...base,
    brief: {
      problem: "Short problem.",
      tradeoffs: [{ gain: "G0", cost: "C0" }],
      decisions: ["tldr A"],
    },
  });
  assert.equal(c.problem, "Short problem.");
  assert.equal(c.challenge, "Speed!");
  assert.deepEqual([c.tradeoffs[0].gain, c.tradeoffs[0].cost], ["G0", "C0"]);
  assert.equal(c.tradeoffs[1].gain, "Android only.");
  assert.equal(c.decisions[0].tldr, "tldr A");
  assert.equal(c.decisions[1].tldr, "Body B first.");
});

test("shortCopy leaves why undefined when project has none", () => {
  const c = shortCopy({ ...base, why: "" });
  assert.equal(c.why, undefined);
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `node --experimental-strip-types --test "app/work/[slug]/_board/brief.test.mts"`
Expected: FAIL — `Cannot find module .../brief.ts`

- [ ] **Step 4: Implement** — `app/work/[slug]/_board/brief.ts`:

```ts
import type { Project } from "@/content/projects";

export type BriefSource = Pick<
  Project,
  "problem" | "why" | "architecture" | "challenge" | "scale" | "future" | "outcome" | "tradeoffs" | "decisions" | "brief"
>;

export type ShortCopy = {
  problem: string;
  why?: string;
  architecture: string;
  challenge: string;
  scale: string;
  future: string;
  outcome: string;
  tradeoffs: { gain: string; cost?: string; body: string }[];
  decisions: { title: string; tldr: string; body: string }[];
};

export function firstSentence(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  const m = t.match(/^(.+?[.!?])(\s|$)/);
  return m ? m[1] : t;
}

// long tradeoffs read "headline · body. Cost: downside." — fall back to the first sentence
export function splitTradeoff(t: string): { gain: string; cost?: string } {
  const [head, ...rest] = t.split(" · ");
  if (rest.length === 0) return { gain: firstSentence(t), cost: undefined };
  const tail = rest.join(" · ");
  const at = tail.indexOf("Cost:");
  return { gain: head.trim(), cost: at >= 0 ? firstSentence(tail.slice(at + 5)) : undefined };
}

export function shortCopy(p: BriefSource): ShortCopy {
  const b = p.brief ?? {};
  return {
    problem: b.problem ?? firstSentence(p.problem),
    why: p.why ? b.why ?? firstSentence(p.why) : undefined,
    architecture: b.architecture ?? firstSentence(p.architecture),
    challenge: b.challenge ?? firstSentence(p.challenge),
    scale: b.scale ?? firstSentence(p.scale),
    future: b.future ?? firstSentence(p.future),
    outcome: b.outcome ?? firstSentence(p.outcome),
    tradeoffs: p.tradeoffs.map((body, i) => ({ ...(b.tradeoffs?.[i] ?? splitTradeoff(body)), body })),
    decisions: p.decisions.map((d, i) => ({
      title: d.title,
      tldr: b.decisions?.[i] ?? firstSentence(d.body),
      body: d.body,
    })),
  };
}
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `node --experimental-strip-types --test "app/work/[slug]/_board/brief.test.mts"`
Expected: 5 tests pass. Then `npx tsc --noEmit -p .` → clean (`.mts` is outside the tsconfig include globs; if tsc picks it up and errors on the `.ts` import, add `"**/*.test.mts"` to `exclude` in `tsconfig.json`).

- [ ] **Step 6: Commit**

```bash
git add content/projects.ts "app/work/[slug]/_board/brief.ts" "app/work/[slug]/_board/brief.test.mts"
git commit -m "feat(brief): short-copy resolver for the HUD board"
```

---

### Task 2: Board primitives

**Files:**
- Create: `app/work/[slug]/_board/useReveal.ts`
- Create: `app/work/[slug]/_board/Decrypt.tsx`
- Create: `app/work/[slug]/_board/HudPanel.tsx`
- Create: `app/work/[slug]/_board/parts.tsx`

**Interfaces:**
- Produces:
  - `useReveal<T extends Element>(): { ref: RefObject<T>; phase: "ssr" | "armed" | "shown" }`
  - `RevealContext` (React context of `phase`) so children can animate.
  - `<Decrypt id: string; text: string />`
  - `<HudPanel index: string; label: string; accent?: Accent; headline?: string; detail?: string; className?: string; children?: ReactNode />`, `type Accent = "amber" | "violet" | "rose" | "sky" | "emerald" | "bone"`
  - `parts.tsx`: `<StatTiles items: {k:string;v:string}[]; tone: Accent />`, `<StatusGauge status: string />`, `<MilestoneTrack items: {state:"planned"|"wip"|"done";label:string}[] />`, `<CountUp value: string />`

- [ ] **Step 1: `useReveal.ts`**

```ts
"use client";

import { createContext, useEffect, useRef, useState } from "react";

// ssr = rendered visible on the server; armed = hidden, waiting to scroll in; shown = revealed
export type RevealPhase = "ssr" | "armed" | "shown";
export const RevealContext = createContext<RevealPhase>("shown");

export function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<RevealPhase>("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setPhase("shown");
      return;
    }
    setPhase("armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPhase("shown");
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, phase };
}
```

- [ ] **Step 2: `Decrypt.tsx`**

```tsx
"use client";

import { useState } from "react";

export function Decrypt({ id, text }: { id: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55 transition-colors hover:text-amber-300"
      >
        {open ? "▾ collapse" : "▸ decrypt full log"}
      </button>
      <div
        id={id}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pt-3 font-sans text-[15px] leading-relaxed text-bone/80">{text}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `HudPanel.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { Decrypt } from "./Decrypt";
import { RevealContext, useReveal } from "./useReveal";

export type Accent = "amber" | "violet" | "rose" | "sky" | "emerald" | "bone";

export const ACCENT: Record<Accent, { border: string; text: string; dot: string; bracket: string }> = {
  amber: { border: "border-amber-300/25", text: "text-amber-300", dot: "bg-amber-300 shadow-[0_0_8px_#ffd54a]", bracket: "border-amber-300" },
  violet: { border: "border-violet-400/25", text: "text-violet-200", dot: "bg-violet-400 shadow-[0_0_8px_#a78bfa]", bracket: "border-violet-400" },
  rose: { border: "border-rose-400/25", text: "text-rose-200", dot: "bg-rose-400 shadow-[0_0_8px_#fb7185]", bracket: "border-rose-400" },
  sky: { border: "border-sky-400/25", text: "text-sky-200", dot: "bg-sky-400 shadow-[0_0_8px_#38bdf8]", bracket: "border-sky-400" },
  emerald: { border: "border-emerald-400/25", text: "text-emerald-200", dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]", bracket: "border-emerald-400" },
  bone: { border: "border-bone/15", text: "text-bone", dot: "bg-bone shadow-[0_0_8px_#fafaf3]", bracket: "border-bone/70" },
};

const CORNERS = [
  "left-0 top-0 border-l-2 border-t-2 origin-top-left",
  "right-0 top-0 border-r-2 border-t-2 origin-top-right",
  "left-0 bottom-0 border-l-2 border-b-2 origin-bottom-left",
  "right-0 bottom-0 border-r-2 border-b-2 origin-bottom-right",
];

export function HudPanel({
  index,
  label,
  accent = "amber",
  headline,
  detail,
  className = "",
  children,
}: {
  index: string;
  label: string;
  accent?: Accent;
  headline?: string;
  detail?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { ref, phase } = useReveal<HTMLElement>();
  const a = ACCENT[accent];
  const hidden = phase === "armed";

  return (
    <RevealContext.Provider value={phase}>
      <section
        ref={ref}
        className={`relative min-w-0 border ${a.border} bg-[#04060e]/90 p-5 transition-[opacity,transform] duration-500 ease-out md:p-6 ${
          hidden ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        } ${className}`}
      >
        {CORNERS.map((c) => (
          <span
            key={c}
            aria-hidden
            className={`pointer-events-none absolute h-3 w-3 ${a.bracket} ${c} transition-transform delay-150 duration-300 ${
              hidden ? "scale-0" : "scale-100"
            }`}
          />
        ))}

        <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em]">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.dot}`} />
          <span className={a.text}>§{index}</span>
          <span className="text-bone/60">{label}</span>
          <span className="h-px flex-1 bg-bone/10" />
        </div>

        {headline && (
          <h3
            className="mt-4 break-words font-light text-xl leading-snug tracking-tight text-bone transition-[clip-path] delay-200 duration-700 ease-out md:text-2xl"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              clipPath: hidden ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
            }}
          >
            {headline}
          </h3>
        )}

        {children && <div className="mt-4">{children}</div>}

        {detail && <Decrypt id={`decrypt-${index}`} text={detail} />}
      </section>
    </RevealContext.Provider>
  );
}
```

- [ ] **Step 4: `parts.tsx`** — moved from `page.tsx` (StatTiles, StatusGauge) plus CountUp and MilestoneTrack:

```tsx
"use client";

import { useContext, useEffect, useState } from "react";
import { ACCENT, type Accent } from "./HudPanel";
import { RevealContext } from "./useReveal";

// counts the first number in a value ("1,210 songs", "20 / 20", "$0") up from zero on reveal
export function CountUp({ value }: { value: string }) {
  const phase = useContext(RevealContext);
  const m = value.match(/^(\D*?)(\d[\d,]*\.?\d*)(.*)$/);
  const target = m ? parseFloat(m[2].replace(/,/g, "")) : NaN;
  const decimals = m && m[2].includes(".") ? m[2].split(".")[1].length : 0;
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (phase !== "shown" || !Number.isFinite(target) || target === 0) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 800);
      setN(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
      else setN(null);
    };
    setN(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, target]);

  if (!m || n === null) return <>{value}</>;
  const shown = n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <>
      {m[1]}
      {shown}
      {m[3]}
    </>
  );
}

export function StatTiles({ items, tone }: { items: { k: string; v: string }[]; tone: Accent }) {
  const a = ACCENT[tone];
  const cols = items.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-2";
  return (
    <div className={`grid gap-2 ${cols}`}>
      {items.map((it) => (
        <div key={it.k} className={`min-w-0 border ${a.border} bg-black/40 px-3 py-2`}>
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/50">{it.k}</div>
          <div
            className={`mt-1 break-words font-light text-lg leading-tight tracking-tight ${a.text}`}
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <CountUp value={it.v} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusGauge({ status }: { status: string }) {
  const stages = [
    { key: "active", label: "build" },
    { key: "shipping", label: "ship" },
    { key: "shipped", label: "live" },
    { key: "archived", label: "rest" },
  ];
  const activeIdx = stages.findIndex((s) => s.key === status);
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {stages.map((s, i) => (
          <span
            key={s.key}
            className={`h-2 flex-1 ${
              activeIdx >= 0 && i <= activeIdx
                ? i === activeIdx
                  ? "bg-amber-300 shadow-[0_0_6px_#ffd54a]"
                  : "bg-amber-300/70"
                : "bg-bone/15"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.25em]">
        {stages.map((s, i) => (
          <span
            key={s.key}
            className={i === activeIdx ? "text-amber-200" : i < activeIdx ? "text-amber-300/55" : "text-bone/35"}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const MILESTONE = {
  done: { bar: "bg-emerald-400", dot: "●", text: "text-emerald-200", dotc: "text-emerald-300" },
  wip: { bar: "bg-amber-300", dot: "◐", text: "text-amber-100", dotc: "text-amber-300 animate-pulse" },
  planned: { bar: "bg-bone/15", dot: "○", text: "text-bone/70", dotc: "text-bone/40" },
} as const;

// horizontal track on md+, stacked on phones
export function MilestoneTrack({ items }: { items: { state: "planned" | "wip" | "done"; label: string }[] }) {
  return (
    <ol className="grid gap-3 md:grid-flow-col md:auto-cols-fr md:gap-2">
      {items.map((m, i) => {
        const s = MILESTONE[m.state];
        return (
          <li key={i} className="min-w-0">
            <span className={`block h-1 ${s.bar}`} />
            <div className="mt-2 flex items-start gap-2">
              <span className={`font-mono text-[12px] ${s.dotc}`}>{s.dot}</span>
              <span className={`break-words font-mono text-[11px] leading-snug ${s.text}`}>{m.label}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add "app/work/[slug]/_board"
git commit -m "feat(brief): HUD panel, decrypt, reveal and stat primitives"
```

---

### Task 3: Board layout + page wiring

**Files:**
- Create: `app/work/[slug]/_board/Board.tsx`
- Modify: `app/work/[slug]/page.tsx` — replace the article body from `{/* Wide body ...` through the outcome `</section>` (≈ lines 191–437) with `<Board project={p} />`; delete now-unused `STAT_TONE`, `StatTiles`, `MilestoneDot`, `SectionHead`, `SpecSheet`, `StatusGauge` (grep each name first; keep any still referenced, e.g. by `ClientDossier`).

**Interfaces:**
- Consumes: `shortCopy` (Task 1), `HudPanel`, `StatTiles`, `StatusGauge`, `MilestoneTrack` (Task 2).
- Produces: `<Board project: Project />`.

- [ ] **Step 1: `Board.tsx`**

```tsx
import type { Project } from "@/content/projects";
import { shortCopy } from "./brief";
import { HudPanel } from "./HudPanel";
import { MilestoneTrack, StatTiles, StatusGauge } from "./parts";

// bento HUD board — replaces the old §01–§10 prose sections
export function Board({ project: p }: { project: Project }) {
  const c = shortCopy(p);
  const personal = !p.client;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {/* loadout strip */}
      <HudPanel index="01" label="loadout · stack + spec" className="md:col-span-2 lg:col-span-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {p.stack.map((s) => (
              <span key={s} className="border border-amber-300/40 bg-amber-300/[0.10] px-2 py-1 uppercase tracking-wider text-amber-100">
                {s}
              </span>
            ))}
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.25em]">
            <div className="flex gap-2"><dt className="text-bone/45">year</dt><dd className="text-bone">{p.year}</dd></div>
            <div className="flex gap-2"><dt className="text-bone/45">role</dt><dd className="text-bone">{p.role}</dd></div>
          </dl>
        </div>
      </HudPanel>

      <HudPanel
        index="02"
        label="the problem"
        headline={c.problem}
        detail={p.problem}
        className={personal ? "md:col-span-2 lg:col-span-3" : "md:col-span-2 lg:col-span-4"}
      />
      {personal && c.why && (
        <HudPanel index="03" label="why i built it" headline={c.why} detail={p.why} className="lg:col-span-2" />
      )}
      <HudPanel index="04" label="signal" className={personal ? "lg:col-span-1" : "lg:col-span-2"}>
        <StatusGauge status={p.status} />
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300">● {p.status}</div>
      </HudPanel>

      <HudPanel
        index="05"
        label="architecture · how it's wired"
        accent="violet"
        headline={c.architecture}
        detail={p.architecture}
        className="md:col-span-2 lg:col-span-4"
      >
        {p.architectureMap && (
          <pre className="overflow-x-auto border border-violet-400/20 bg-black/70 p-4 font-mono text-[11.5px] leading-[1.5] text-violet-100 md:text-[12.5px]">
            {p.architectureMap}
          </pre>
        )}
      </HudPanel>
      <HudPanel
        index="06"
        label="the hard part"
        accent="rose"
        headline={c.challenge}
        detail={p.challenge}
        className="md:col-span-2 lg:col-span-2"
      >
        {p.challengeStats && <StatTiles items={p.challengeStats} tone="rose" />}
      </HudPanel>

      <HudPanel index="07" label={`key calls · ${c.decisions.length}`} className="md:col-span-2 lg:col-span-4">
        <ol className="grid gap-3 sm:grid-cols-2">
          {c.decisions.map((d, i) => (
            <li key={d.title} className="min-w-0 border border-amber-300/20 bg-black/40 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
                call · {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-2 font-sans text-[15px] font-medium text-bone">{d.title}</div>
              <p className="mt-1.5 font-sans text-[13.5px] leading-relaxed text-bone/65">{d.tldr}</p>
              <details className="mt-2 group">
                <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.3em] text-bone/45 hover:text-amber-300">
                  <span className="group-open:hidden">▸ decrypt</span>
                  <span className="hidden group-open:inline">▾ collapse</span>
                </summary>
                <p className="mt-2 font-sans text-[13.5px] leading-relaxed text-bone/75">{d.body}</p>
              </details>
            </li>
          ))}
        </ol>
      </HudPanel>
      <HudPanel
        index="08"
        label="scale · how it holds up"
        accent="sky"
        headline={c.scale}
        detail={p.scale}
        className="md:col-span-2 lg:col-span-2"
      >
        {p.scaleStats && <StatTiles items={p.scaleStats} tone="sky" />}
      </HudPanel>

      {personal && c.tradeoffs.length > 0 && (
        <HudPanel index="09" label="tradeoffs · what i gave up" accent="bone" className="md:col-span-2 lg:col-span-6">
          <ul className="grid gap-3 md:grid-cols-2">
            {c.tradeoffs.map((t, i) => (
              <li key={i} className="min-w-0 border border-bone/10 bg-black/40 p-4">
                <div className="font-sans text-[14px] text-emerald-200">▲ {t.gain}</div>
                {t.cost && <div className="mt-1 font-sans text-[14px] text-rose-200/90">▼ {t.cost}</div>}
                <details className="mt-2 group">
                  <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.3em] text-bone/45 hover:text-amber-300">
                    <span className="group-open:hidden">▸ decrypt</span>
                    <span className="hidden group-open:inline">▾ collapse</span>
                  </summary>
                  <p className="mt-2 font-sans text-[13.5px] leading-relaxed text-bone/75">{t.body}</p>
                </details>
              </li>
            ))}
          </ul>
        </HudPanel>
      )}

      <HudPanel
        index="10"
        label="roadmap · what's next"
        accent="emerald"
        headline={p.futureMilestones ? undefined : c.future}
        detail={p.futureMilestones ? undefined : p.future}
        className="md:col-span-2 lg:col-span-4"
      >
        {p.futureMilestones && <MilestoneTrack items={p.futureMilestones} />}
      </HudPanel>
      <HudPanel
        index="11"
        label={`outcome · ${p.status}`}
        headline={c.outcome}
        detail={p.outcome}
        className="md:col-span-2 lg:col-span-2"
      />
    </div>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`** — add `import { Board } from "./_board/Board";`; inside `<article ...>` replace everything from `{/* Wide body — uses the full canvas ...` down to and including the outcome `</section>` with:

```tsx
        <div className="mb-16">
          <Board project={p} />
        </div>
```

Keep the `<nav>` and footer links that follow. Then for each of `STAT_TONE`, `StatTiles`, `MilestoneDot`, `SectionHead`, `SpecSheet`, `StatusGauge`: run `grep -n "<Name\b\|Name\[" "app/work/[slug]/page.tsx"`; delete the definition only when the definition is the sole match.

- [ ] **Step 3: Build**

Run: `npx tsc --noEmit -p . && npm run build`
Expected: compiles, all 11 `/work/*` paths prerendered.

- [ ] **Step 4: SSR-visibility check (Review Focus 3)** — with `npx next start -p 3911` running:

Run: `curl -s localhost:3911/work/eeo-modules | grep -c "decrypt full log"` → ≥ 5
Run: `curl -s localhost:3911/work/eeo-modules | grep -c "opacity-0"` → 0 inside board (server phase is `ssr`, visible).
Expected: both hold. Stop the server by PID afterwards (`ss -ltnp | grep 3911`, then `kill <pid>`; never `pkill -f` — it matches its own shell).

- [ ] **Step 5: Commit**

```bash
git add "app/work/[slug]/_board/Board.tsx" "app/work/[slug]/page.tsx"
git commit -m "feat(brief): bento HUD board replaces the prose sections"
```

---

### Task 4: Hand-written short copy (11 projects)

**Files:**
- Modify: `content/projects.ts` — add a `brief: {...}` key to each project object (place it right after `outcome:`).

- [ ] **Step 1: Add the briefs** — exact values:

`notchfy`
```ts
    brief: {
      problem: "Every quick check (time, music, a sale, a file) means switching apps. The notch just sits there.",
      why: "I wanted the glance without the switch, and to ship a paid desktop app end to end.",
      architecture: "A floating window over the notch, a tested geometry core, and 24 self-contained modules.",
      challenge: "On macOS 26/27, SwiftUI and AppKit looped on layout until the app crashed.",
      scale: "No backend. The real work is staying light enough to forget it's running.",
      outcome: "Live at notchfy.com: signed, notarized, licensed and self-updating.",
      tradeoffs: [
        { gain: "Sold direct, not on the App Store", cost: "I own signing, licensing, updates and payments" },
        { gain: "One-time price, no subscription", cost: "No recurring revenue" },
        { gain: "Private macOS APIs unlock key features", cost: "Any macOS update can break them" },
        { gain: "On-device AI first, your own key second", cost: "Answer quality varies by model" },
      ],
      decisions: [
        "Notch math and hover logic live in a UI-free, unit-tested package.",
        "Activate once; a flaky network never locks out a paying user.",
        "Other apps' alerts show in the notch, unless you're already in that app.",
        "Signing, notarization, OTA updates and checkout, all shipped with one release command.",
      ],
    },
```

`jarvis`
```ts
    brief: {
      problem: "Voice assistants live in the cloud, forget everything, and rarely do things.",
      why: "Small desktop chores add up, and nothing good existed for Linux.",
      architecture: "A background program does the work; the window is just one face on it.",
      challenge: "Talk over it and the voice, the AI and the mic all have to react instantly.",
      scale: "One user, one laptop. Cost and storage grow steadily, with no cliffs.",
      outcome: "Used daily since week one: about 40 voice commands a day.",
      tradeoffs: [
        { gain: "Cloud AI is fast and sharp", cost: "It dies without WiFi" },
        { gain: "Shortcuts and CLI access for free", cost: "The window has to keep syncing state" },
        { gain: "Long-term memory", cost: "Old facts can leak into new answers" },
      ],
      decisions: [
        "The wake word runs offline so it's instant; the cloud does the thinking.",
        "Conversations are chunked and stored locally so it can recall them later.",
        "It runs in the background, so any shortcut or script can talk to it.",
      ],
    },
```

`nocap`
```ts
    brief: {
      problem: "Phones treat every ping as urgent, and Do Not Disturb is a sledgehammer.",
      why: "I missed my landlord's message under 47 notifications of noise.",
      architecture: "Every notification is scored on-device in about 10ms; hard cases go to the cloud.",
      challenge: "Android kills slow listeners, so every decision has to fit a tight time budget.",
      scale: "A ~3 MB model on the phone; the cloud stays under 20¢ per user a month.",
      outcome: "About 80% fewer interruptions, and beta friends say the same.",
      tradeoffs: [
        { gain: "On-device model is instant and free", cost: "Tops out around 87% on tricky cases" },
        { gain: "Android lets apps read notifications", cost: "No iOS, so half the audience is gone" },
        { gain: "Noise collapses into a quiet inbox", cost: "Can't un-show what Android already showed" },
      ],
      decisions: [
        "A tiny on-phone model scores each notification before it rings.",
        "Low-priority pings are grouped into an inbox, never deleted.",
        "The local model handles 90% for free; the cloud takes the tricky 10%.",
      ],
    },
```

`flowstate`
```ts
    brief: {
      problem: "Smart shuffle picks songs by what people click. It has never heard them.",
      why: "The gym, focus work and parties all need one mood held for an hour.",
      architecture: "An on-phone model fingerprints how each song sounds; the queue follows the sound.",
      challenge: "Lock-screen skips died after ~3 tries, until the networking moved to Kotlin.",
      scale: "Built for one library: 1,210 songs, instant picks, $0 in server cost.",
      outcome: "Daily driver: 770 tracks analyzed, 20/20 background skips.",
      tradeoffs: [
        { gain: "On-device: free, offline, private", cost: "Analysis costs time and battery" },
        { gain: "React Native UI moved fast", cost: "Every hard bug lived on the native seam" },
        { gain: "Unofficial API gets my real library", cost: "It can break at any time" },
        { gain: "Stop on a broken song", cost: "Louder than silently auto-skipping" },
      ],
      decisions: [
        "The model hears the waveform, not tags or play counts.",
        "Lock ↔ Drift sets how tightly the queue holds the mood.",
        "A parity test proves the audio input is right before trusting the output.",
        "Anything that must work while the phone is locked runs natively.",
      ],
    },
```

`rent-roll`
```ts
    brief: {
      problem: "Small landlords track rent in notebooks and chase payers on WhatsApp.",
      why: "Eight tenants, eight due dates, and a landlord scrolling chats at midnight.",
      architecture: "One ledger, two faces: a landlord dashboard and a tenant portal.",
      challenge: "One schema that rents out a whole flat or a single bed, without forking.",
      scale: "Landlord-sized, not viral: a daily job and near-flat serverless cost.",
      outcome: "Full loop live: invite, invoice, collect over UPI, remind on WhatsApp.",
      tradeoffs: [
        { gain: "UPI QR + mark-paid works on day one", cost: "Reconciling payments is manual" },
        { gain: "WhatsApp reminder links ship now", cost: "Not automated like the Business API" },
        { gain: "Tenants join with one tap", cost: "Needed a custom invite-and-claim flow" },
      ],
      decisions: [
        "Landlord and tenant views read the same data.",
        "A daily job creates invoices and sends reminders on its own.",
        "A tenancy can point at a whole flat or a single bed.",
      ],
    },
```

`negotiator-noir`
```ts
    brief: {
      problem: "Persuasion games reduce it to a dice roll. Nothing trains you to read a person.",
      why: "Negotiation lessons only stuck when I used them, so I built a trainer.",
      architecture: "Story as data, rules as pure functions, UI as hand-built panels.",
      challenge: "Choices that matter, without a combinatorial explosion of branches.",
      scale: "Offline and single-player. The only thing that grows is content.",
      outcome: "The six-chapter campaign runs end to end. Pre-release.",
      tradeoffs: [
        { gain: "No engine: tiny bundle, full control", cost: "Every UI piece is built by hand" },
        { gain: "Hand-written branches read better", cost: "Every path costs writing time" },
        { gain: "AI concept art in hours, not weeks", cost: "Keeping it consistent is the fight" },
      ],
      decisions: [
        "Each mission teaches one real negotiation principle.",
        "Game logic is pure, tested functions; the UI only renders.",
        "Pick the angle, then the words: two reads per turn.",
      ],
    },
```

`wallpaper-controller`
```ts
    brief: {
      problem: "Android can't rotate the lock screen, and the apps that do are invasive.",
      why: "I wanted a new wallpaper on every wake, without shady permissions.",
      architecture: "A live-wallpaper engine stays alive legitimately and rotates on screen-off.",
      challenge: "Survive in the background with no foreground service or battery exemption.",
      scale: "All on-device. No backend, no analytics, no data collected.",
      outcome: "Daily driver; the v1.6 release bundle is ready for the Play Store.",
      tradeoffs: [
        { gain: "No zombie background process", cost: "Rotation stops if the live wallpaper is off" },
        { gain: "Static bitmap: zero battery drama", cost: "No animated home wallpaper" },
        { gain: "No storage permission needed", cost: "Images take duplicate space" },
      ],
      decisions: [
        "The live wallpaper keeps the process alive, so rotation just works.",
        "No INTERNET permission: privacy is provable, not promised.",
        "Images are copied in, so no media permission and nothing breaks.",
      ],
    },
```

`eeo-modules`
```ts
    brief: {
      problem: "Small teams pay for five SaaS tools that each reinvent logins and permissions.",
      why: "I watched a 12-person team spend ~$4k a month on overlapping tools.",
      architecture: "Four deployable modules sharing one identity and permissions layer.",
      challenge: "Independent enough to self-host one, shared enough to reuse identity.",
      scale: "Each module handles ~10k monthly users on a $20 server.",
      outcome: "SSO and Org in daily use, PM in beta, Ledger scaffolded.",
      tradeoffs: [
        { gain: "Multi-repo: deploy only what you need", cost: "CI config duplicated across four repos" },
        { gain: "End-to-end TypeScript types", cost: "Other languages hand-write request shapes" },
        { gain: "Open-source users get a real product", cost: "Only a tiny paid surface" },
      ],
      decisions: [
        "SSO and Org sit under everything; the other modules trust them.",
        "Every module is its own repo and can be self-hosted alone.",
        "tRPC + Drizzle keep types end to end, from database to UI.",
      ],
    },
```

`dr-magnet` (client — no why/tradeoffs)
```ts
    brief: {
      problem: "Paid ad traffic, mostly on mobile: every bounce is wasted money.",
      architecture: "One server-rendered sales page where every button leads to a booking form.",
      challenge: "36 elements stayed hidden until JavaScript loaded, which was slow on mid-range phones.",
      scale: "Scale means ad spend, not servers. Conversion rate is what breaks.",
      outcome: "Live at drmagnet.in, running the agency's Meta and Google campaigns.",
      decisions: [
        "The form qualifies leads before anyone gets on a call.",
        "Browser and server both report a conversion; Meta counts it once.",
        "Content ships visible from the server; animation comes after.",
        "A sticky booking bar follows mobile visitors down the page.",
      ],
    },
```

`live-class` (client)
```ts
    brief: {
      problem: "Tutoring ran on Calendly, Zoom, a whiteboard tool and Stripe, glued together.",
      architecture: "One Next.js app for booking, video, whiteboard, recordings and payments.",
      challenge: "200+ parents clicking the same slot in the same second, with no double-booking.",
      scale: "~600 concurrent classes at peak; video seats are the limit, not the backend.",
      outcome: "In production with real teachers and students.",
      decisions: [
        "Each slot is locked so only one booking can win it.",
        "Recording webhooks can retry safely without creating duplicates.",
        "Bought video from Daily.co instead of self-hosting, saving weeks.",
        "Excalidraw is embedded as a shared, synced whiteboard.",
      ],
    },
```

`live-cart` (client)
```ts
    brief: {
      problem: "Vendors needed live streams with real-time auctions that settle themselves.",
      architecture: "Expo app, Next.js vendor dashboard, AWS WebSockets for bids and chat.",
      challenge: "Hundreds of bids per second, in order, with anti-snipe timers.",
      scale: "~50 live streams at once, each with hundreds of viewers.",
      outcome: "Live weekly: bid acks under 180ms p99, over 96% auto-settled.",
      decisions: [
        "One process owns each auction, so bids are always in order.",
        "Video and bids use separate channels; a video hiccup doesn't stop bidding.",
        "The winner is charged at close, then the order is created.",
      ],
    },
```

- [ ] **Step 2: Check counts line up** — `brief.decisions.length` must equal `decisions.length` and `brief.tradeoffs.length` must equal `tradeoffs.length` per project:

Run:
```bash
node --experimental-strip-types -e '
import("./content/projects.ts").then(({ projects }) => {
  for (const p of projects) {
    const b = p.brief ?? {};
    const d = (b.decisions ?? []).length, t = (b.tradeoffs ?? []).length;
    const ok = d === p.decisions.length && (p.client || t === p.tradeoffs.length);
    console.log(ok ? "ok " : "BAD", p.slug, d, p.decisions.length, t, p.tradeoffs.length);
  }
});'
```
Expected: every line starts with `ok`.

- [ ] **Step 3: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add content/projects.ts
git commit -m "content(brief): hand-written short copy for all 11 projects"
```

---

### Task 5: Visual verification + ship

**Files:** none (screenshots go to the scratchpad).

- [ ] **Step 1: Build and serve** — `rm -rf .next && npm run build && npx next start -p 3911` (background). Don't run `next dev` against the same `.next`.

- [ ] **Step 2: Screenshots** — for `flowstate`, `dr-magnet`, `jarvis` at 1440×3600 and 390×6000:

```bash
google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1440,3600 \
  --virtual-time-budget=6000 --screenshot=$SCRATCH/<slug>-desk.png http://localhost:3911/work/<slug>
```

Check each: no empty panel; panels in reading order; no horizontal scroll at 390px (Review Focus 5); client brief has no WHY/TRADEOFFS panel.

- [ ] **Step 3: Reduced-motion check (Review Focus 4)** — add `--force-prefers-reduced-motion` to one desktop run; all panels must be fully visible.

- [ ] **Step 4: Push** — `git push origin main`; stop the server by PID.
