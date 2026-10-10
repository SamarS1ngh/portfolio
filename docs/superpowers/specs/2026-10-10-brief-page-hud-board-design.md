# Brief page → HUD status board — design

**Date:** 2026-10-10
**Scope:** `app/work/[slug]` — the project brief page used by all 11 projects.
**Status:** approved in chat, pending spec review.

## 1. Intent

**What Samar said**
- Every project brief is too text-heavy and boring.
- The portfolio is a space / tech HUD; the brief page should feel techy and interesting to look at too — not the same as the home page's main view, but in the same family.
- Not a text-loaded website.

**Decisions taken (Q&A, 2026-10-10)**
- Copy: **rewrite short, keep the long prose hidden** behind an expand ("decrypt") toggle.
- Layout: **bento status board** — sections become HUD panels of varied sizes in a grid.
- Motion: **subtle, on reveal** — panels boot in once as they scroll into view, then stay still.

**Assumptions (not stated, correct if wrong)**
- §00 media stays on top, unchanged: live CTA card, Notchfy stage, Jarvis/nocap/EEO simulators, screenshot galleries, client dossier.
- Prev/next nav, "return to world" and the resume link stay at the bottom.
- No content is deleted; the existing long fields remain the source for "decrypt".

**Success looks like**
- A visitor gets the gist of any project by scanning headlines + visuals, without reading a paragraph.
- Depth is one click away for recruiters who want it.
- Looks like it belongs to the HUD portfolio; works on phone; no jank.

## 2. Layout

Replaces sections §01–§10 (problem, why, stack, architecture, challenge, tradeoffs, decisions, scale, roadmap, outcome).

```
┌─ HEADER STRIP ── name · status LED · year · role · stack chips ─────┐
├─ PROBLEM (wide) ──────────────────┬─ WHY ──────────┬─ SIGNAL ───────┤
│ headline · [decrypt ▾]            │ headline       │ status gauge   │
├─ ARCHITECTURE (2/3) ──────────────┴────────────────┼─ HARD PART ────┤
│ ascii map / diagram  + headline                    │ stat tiles     │
├─ CALL 01 ─┬─ CALL 02 ─┬─ CALL 03 ─┬─ CALL 04 ──────┤ + headline     │
│ tldr      │ tldr      │ tldr      │ tldr  [▾]      ├─ SCALE ────────┤
├─ TRADEOFFS: gain ▲ / cost ▼ rows ──────────────────┤ stat tiles     │
├─ ROADMAP: ●──●──●──◐──○ horizontal track ─────────── OUTCOME ───────┤
└────────────────────────────────────────────────────────────────────┘
```

- Grid: 6 columns desktop (≥1024px), 2 columns tablet, 1 column phone. Same reading order at every width.
- Client briefs (`p.client` set): no WHY panel, no TRADEOFFS panel (matches current behaviour); the grid reflows to fill.
- Missing optional data (no `architectureMap`, no stats, no milestones) → the panel shows headline + decrypt only; never an empty box.
- Decisions: one card per decision, tldr visible, body behind its own decrypt.
- Tradeoffs: each row = `▲ gain` / `▼ cost`, body behind decrypt.
- Roadmap: horizontal track of milestone dots (done ● / wip ◐ / planned ○) with labels; vertical on phone. Falls back to `future` prose headline when no milestones.

## 3. Panel shell — `HudPanel`

- Corner brackets, mono uppercase label with section index, accent colour per section (existing palette): amber default, violet architecture, rose hard part, sky scale, emerald roadmap.
- Body order: headline (large display type) → visual (stat tiles / map / gauge / track) → `Decrypt` toggle.
- `Decrypt`: button "▸ decrypt full log" ↔ "▾ collapse"; reveals the long prose with a short height transition. Keyboard accessible (`button`, `aria-expanded`, `aria-controls`).

## 4. Motion

- A shared `useReveal` hook (one observer per panel, disconnected after first hit) marks a panel revealed the first time ≥25% is visible. Server HTML renders visible; the hidden state is applied only after mount.
- On reveal: brackets draw in, stat numbers count up (numeric part only; non-numeric values just fade), headline types in fast (~600ms total).
- After reveal: static. No ambient loops.
- `prefers-reduced-motion: reduce` → everything renders in its final state immediately.
- No new dependencies (plain CSS transitions + the observer).

## 5. Data

Add an optional field to `Project` in `content/projects.ts`:

```ts
brief?: {
  problem: string;        // one punchy line each, ~60–100 chars
  why?: string;
  architecture: string;
  challenge: string;
  scale: string;
  outcome: string;
  tradeoffs?: { gain: string; cost: string }[]; // same order as `tradeoffs`
  decisions?: string[];                          // tldr per decision, same order
};
```

- Hand-written short copy for all 11 projects.
- Fallback when `brief` (or one of its keys) is missing: first sentence of the long field. Tradeoff fallback: split on " · " / "Cost:" if present, else first sentence as gain and no cost line.
- Long fields (`problem`, `why`, `architecture`, …) unchanged — they feed decrypt.

## 6. Code shape

New folder `app/work/[slug]/_board/`:
- `Board.tsx` — server-safe layout; takes a `Project`, renders panels in grid.
- `HudPanel.tsx` — client; shell + reveal animation.
- `Decrypt.tsx` — client; expand/collapse toggle.
- `useReveal.ts` — shared observer hook.
- `parts.tsx` — StatTiles, StatusGauge, MilestoneTrack, CountUp (StatTiles/StatusGauge moved out of `page.tsx`; the spec sheet folds into the loadout strip as year/role).
- `brief.ts` — `shortCopy(project)` resolves `brief` with fallbacks (pure, unit-testable).

`page.tsx` shrinks to: hero/header → §00 media (unchanged) → `<Board project={p} />` → nav + footer links.

## 7. Verification

- `npm run build` passes; `tsc --noEmit` clean.
- Headless Chrome screenshots at 1440px and 390px of three briefs: one personal (`flowstate`), one client (`dr-magnet`), one simulator (`jarvis`). Check no empty panels, no overflow, decrypt works.
- Reduced-motion check: panels render final state.

## 8. Backup options (if the board doesn't land)

If Samar doesn't like the result, **re-ask these questions** before trying again:

**Copy**
- (chosen) Rewrite short + keep long hidden.
- Rewrite short, delete long — headline + bullets only; fastest read, loses depth.
- Keep text, only restyle — same paragraphs in HUD panels/tabs.

**Layout**
- (chosen) Bento status board.
- Mission console (tabs) — one screen, left rail of modes (BRIEF / SYSTEMS / RISKS / CALLS / LOG), centre viewport swaps per mode, telemetry ticker at the bottom. Most cockpit-like; content hides behind clicks; cramped on mobile.
- Scroll HUD sequence — keep vertical order, each section a full-width "scan" panel that animates in (scanline, typing headline, counters). Most cinematic; still long.

**Motion**
- (chosen) Subtle, on reveal.
- Alive / ambient — plus scanlines, blinking LEDs, ticker, data pulses along diagram wires.
- Static — HUD look only.

**Short-copy source**
- (chosen) Hand-written `brief` field, first-sentence fallback.
- Auto first sentence only — no writing, flatter headlines.
