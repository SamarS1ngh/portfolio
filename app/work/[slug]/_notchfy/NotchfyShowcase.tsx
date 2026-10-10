"use client";

import { useEffect, useRef, useState } from "react";

// Notchfy brief §00 — one stage with a working notch: hover it and the real
// dashboard grows out of it; pick a moment (or a theme) and it swaps in.

type Moment = { key: string; title: string; body: string; shot: string; note?: string };

const MOMENTS: Moment[] = [
  {
    key: "home",
    title: "Glance at everything",
    body: "CPU, memory, battery, the time, what's playing, the weather. One hover instead of five apps.",
    shot: "/shots/notchfy/home.png",
  },
  {
    key: "macmate",
    title: "Ask how to do a Mac thing",
    body: "MacMate answers Mac how-to questions using Apple's on-device model, or your own Claude, OpenAI, Gemini or Grok key.",
    shot: "/shots/notchfy/macmate.png",
  },
  {
    key: "claude",
    title: "Track your Claude Code usage",
    body: "Tokens today, streak and a weekly heatmap, read from Claude Code's local logs. No key needed.",
    shot: "/shots/notchfy/claude-usage.png",
  },
  {
    key: "revenue",
    title: "See sales land",
    body: "With a read-only Stripe key, each sale flashes on the notch. Hover for totals, a chart and recent orders.",
    shot: "/shots/notchfy/revenue.png",
    note: "sample data",
  },
  {
    key: "music",
    title: "Control music",
    body: "Skip, pause and scrub whatever's playing without leaving the app in front.",
    shot: "/shots/notchfy/now-playing.png",
  },
  {
    key: "shelf",
    title: "Park files on a shelf",
    body: "Drag a file onto the notch, switch apps, then drag it back out where it needs to go.",
    shot: "/shots/notchfy/shelf.png",
  },
  {
    key: "captures",
    title: "Grab your last screenshot",
    body: "New screenshots show up in the notch. Copy one into a chat or open it in one click.",
    shot: "/shots/notchfy/captures.png",
  },
];

const THEMES = [
  { name: "Minimal", shot: "/shots/notchfy/theme-minimal.png" },
  { name: "Playful", shot: "/shots/notchfy/theme-playful.png" },
  { name: "Electric", shot: "/shots/notchfy/theme-electric.png" },
  { name: "Tech HUD", shot: "/shots/notchfy/theme-techhud.png" },
  { name: "Polished", shot: "/shots/notchfy/theme-polished.png" },
  { name: "Bloody Moon", shot: "/shots/notchfy/theme-bloody.png" },
];

const ALL_SHOTS = [...MOMENTS.map((m) => m.shot), ...THEMES.map((t) => t.shot)];

// Closed: clipped down to a notch-sized pill at the top centre.
// Open: the full panel. Same shape type both ways, so clip-path animates smoothly.
const CLOSED = "inset(0 40% calc(100% - 30px) 40% round 0 0 14px 14px)";
const OPEN = "inset(0 0% 0% 0% round 0 0 22px 22px)";

function Stage({
  shot,
  open,
  setOpen,
  onUserOpen,
}: {
  shot: string;
  open: boolean;
  setOpen: (o: boolean) => void;
  onUserOpen: () => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-bone/10 px-[3%] pb-[4%]"
      style={{
        background:
          "radial-gradient(70% 60% at 50% 0%, rgba(255,255,255,0.07), transparent 70%), linear-gradient(180deg, #0c0f1a 0%, #06080f 100%)",
      }}
      onMouseEnter={() => {
        onUserOpen();
        setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
      onPointerUp={(e) => {
        // touch has no hover — a tap toggles instead
        if (e.pointerType !== "touch") return;
        onUserOpen();
        setOpen(!open);
      }}
    >
      {/* menu bar */}
      <div className="absolute inset-x-0 top-0 flex h-[30px] items-center justify-between bg-white/[0.04] px-4 font-sans text-[11px] text-bone/45">
        <span className="font-semibold text-bone/60">Notchfy</span>
        <span>Wed 30 Sep · 11:29</span>
      </div>

      {/* the notch / panel — one black shape, revealed by clip-path */}
      <div
        className="relative z-10 aspect-[2/1] w-full bg-black transition-[clip-path] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ clipPath: open ? OPEN : CLOSED }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shot}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300"
          style={{ opacity: open ? 1 : 0, transitionDelay: open ? "120ms" : "0ms" }}
        />
      </div>

      {/* closed-state hint */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-[38%] z-0 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-bone/45 transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="hidden md:inline">↑ hover here — the notch opens</span>
        <span className="md:hidden">tap to open the notch</span>
      </div>
    </div>
  );
}

export function NotchfyShowcase() {
  const [shot, setShot] = useState(MOMENTS[0].shot);
  const [active, setActive] = useState<string>(MOMENTS[0].key);
  const [open, setOpen] = useState(true);
  const reopenTimer = useRef<ReturnType<typeof setTimeout>>();
  const touched = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const swapTimer = useRef<ReturnType<typeof setTimeout>>();

  // preload every capture so swaps never flash empty
  useEffect(() => {
    ALL_SHOTS.forEach((s) => {
      const i = new Image();
      i.src = s;
    });
  }, []);

  // first time it scrolls into view, play the open animation once
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          // starts open (never an empty box); on first sight, fold into the notch and back out
          setTimeout(() => setOpen(false), 700);
          setTimeout(() => setOpen(true), 1500);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // switching content: close into the notch, swap, grow back out — like the real app
  const show = (key: string, next: string) => {
    touched.current = true;
    setActive(key);
    clearTimeout(swapTimer.current);
    clearTimeout(reopenTimer.current);
    if (!open) {
      setShot(next);
      setOpen(true);
      return;
    }
    setOpen(false);
    swapTimer.current = setTimeout(() => {
      setShot(next);
      setOpen(true);
    }, 380);
  };

  const current = MOMENTS.find((m) => m.key === active);

  return (
    <div ref={rootRef} className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,2fr)] lg:gap-12">
      {/* left — what it is + the moments */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">▸ what it is</div>
        <h3
          className="mt-3 text-2xl font-light uppercase leading-tight tracking-tight text-bone md:text-3xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Your notch, turned into a dashboard
        </h3>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-bone/70">
          Push the cursor up to the MacBook notch and a dashboard grows out of it. Move away and it&apos;s gone, and
          you never left the app you were in. Macs without a notch get a simulated one.
        </p>

        <div className="mt-7 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/45">▸ what you use it for</div>
        <ul className="mt-3 border-t border-bone/10">
          {MOMENTS.map((m, i) => {
            const on = active === m.key;
            return (
              <li key={m.key} className="border-b border-bone/10">
                <button
                  onClick={() => show(m.key, m.shot)}
                  className={`flex w-full items-baseline gap-3 py-2.5 text-left transition-colors ${
                    on ? "text-bone" : "text-bone/55 hover:text-bone/85"
                  }`}
                >
                  <span className={`font-mono text-[10px] ${on ? "text-amber-300" : "text-bone/35"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans text-[15px]">{m.title}</span>
                </button>
                {on && (
                  <p className="-mt-1 pb-3 pl-7 font-sans text-[13.5px] leading-relaxed text-bone/60">
                    {m.body}
                    {m.note && (
                      <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/40">
                        ({m.note})
                      </span>
                    )}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* right — the stage */}
      <div className="lg:pt-2">
        <Stage
          shot={shot}
          open={open}
          setOpen={(o) => {
            clearTimeout(reopenTimer.current);
            setOpen(o);
            // after you move away it folds into the notch, then comes back so the stage never sits empty
            if (!o) reopenTimer.current = setTimeout(() => setOpen(true), 1800);
          }}
          onUserOpen={() => {
            touched.current = true;
          }}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/45">themes</span>
          {THEMES.map((t) => {
            const on = active === `theme:${t.name}`;
            return (
              <button
                key={t.name}
                onClick={() => show(`theme:${t.name}`, t.shot)}
                className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
                  on
                    ? "border-amber-300/70 bg-amber-300/15 text-amber-100"
                    : "border-bone/15 text-bone/55 hover:border-bone/35 hover:text-bone/85"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/35">
          real captures from the app{current?.note ? ` · this one uses ${current.note}` : ""}
        </p>
      </div>
    </div>
  );
}
