"use client";

import { useEffect, useState } from "react";

// Notchfy brief §00 — explains the product as it's actually used: a MacBook screen
// with a real notch, the panel dropping out of it over whatever app you were in.

const SITE = "https://www.notchfy.com/";

type Behind = "code" | "terminal" | "doc" | "files" | "chat" | "browser";

type Scene = {
  moment: string;
  title: string;
  body: string;
  shot: string;
  alt: string;
  app: string;
  behind: Behind;
  note?: string;
};

const SCENES: Scene[] = [
  {
    moment: "mid-build, quick glance",
    title: "Everything you check all day, in one hover",
    body: "CPU and memory, battery, the time, what's playing, your Claude usage, the weather. Normally that's five different apps. Here you push the cursor up, read it, move away, and you're still in your editor.",
    shot: "/shots/notchfy/home.png",
    alt: "Notchfy home dashboard dropped from the notch",
    app: "Xcode",
    behind: "code",
  },
  {
    moment: "forgot a Mac shortcut",
    title: "Ask your Mac how to do something",
    body: "MacMate is a small AI that lives in the notch and only answers Mac questions: shortcuts, settings, Finder tricks. It runs on Apple's on-device model when your Mac supports it, or on your own Claude, OpenAI, Gemini or Grok key.",
    shot: "/shots/notchfy/macmate.png",
    alt: "MacMate answering how to take a screenshot",
    app: "Finder",
    behind: "files",
  },
  {
    moment: "coding with Claude Code",
    title: "See how much AI you burned today",
    body: "Notchfy reads Claude Code's local session logs: tokens today, streak, sessions, and a heatmap of the week. No API key needed and nothing leaves the Mac.",
    shot: "/shots/notchfy/claude-usage.png",
    alt: "Claude Code usage stats in the notch",
    app: "Terminal — claude",
    behind: "terminal",
  },
  {
    moment: "a sale lands while you work",
    title: "Your revenue, without opening Stripe",
    body: "Paste a read-only Stripe key and each sale flashes on the notch with its amount. Hover for the day, week or month, plus a chart and the latest orders.",
    shot: "/shots/notchfy/revenue.png",
    alt: "Revenue dashboard with sales chart and recent orders",
    app: "Safari",
    behind: "browser",
    note: "sample data",
  },
  {
    moment: "wrong song, deep in a doc",
    title: "Control music without switching apps",
    body: "Whatever is playing (Spotify, Apple Music, a YouTube tab) shows up with controls. Skip, pause and scrub right from the notch, and the doc you're writing stays in front.",
    shot: "/shots/notchfy/now-playing.png",
    alt: "Now playing controls in the notch",
    app: "Notes",
    behind: "doc",
  },
  {
    moment: "moving a file between apps",
    title: "A shelf to park files on",
    body: "Drag a file onto the notch and it opens straight into the shelf. Switch apps, then drag the file back out where it needs to go. No more hunting through Desktop or Downloads.",
    shot: "/shots/notchfy/shelf.png",
    alt: "File shelf holding dropped files",
    app: "Finder",
    behind: "files",
  },
  {
    moment: "just took a screenshot",
    title: "Your latest screenshots, one click away",
    body: "New captures appear in the notch as soon as you take them. Copy one straight into a chat, open it, or show it in Finder, without digging through your Desktop.",
    shot: "/shots/notchfy/captures.png",
    alt: "Recent screenshots in the captures module",
    app: "Slack",
    behind: "chat",
  },
];

const THEMES = [
  { name: "Minimal", src: "/shots/notchfy/theme-minimal.png" },
  { name: "Playful", src: "/shots/notchfy/theme-playful.png" },
  { name: "Electric", src: "/shots/notchfy/theme-electric.png" },
  { name: "Tech HUD", src: "/shots/notchfy/theme-techhud.png" },
  { name: "Polished", src: "/shots/notchfy/theme-polished.png" },
  { name: "Bloody Moon", src: "/shots/notchfy/theme-bloody.png" },
];

// ── the fake app sitting behind the notch, so each scene reads as "you were working" ──

function BehindContent({ kind }: { kind: Behind }) {
  if (kind === "terminal") {
    return (
      <div className="space-y-[5%] p-[5%] font-mono text-[clamp(5px,0.9vw,10px)] leading-tight text-emerald-300/70">
        <div>$ claude</div>
        <div className="text-bone/50">› refactor the hover state machine</div>
        <div className="h-[3px] w-3/4 rounded bg-emerald-300/30" />
        <div className="h-[3px] w-1/2 rounded bg-emerald-300/30" />
        <div className="h-[3px] w-2/3 rounded bg-bone/20" />
        <div className="h-[3px] w-2/5 rounded bg-bone/20" />
      </div>
    );
  }
  if (kind === "files") {
    return (
      <div className="grid grid-cols-5 gap-[6%] p-[7%]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[5/4] rounded-[3px] bg-sky-300/35" />
        ))}
      </div>
    );
  }
  if (kind === "chat") {
    return (
      <div className="flex h-full">
        <div className="w-1/4 space-y-[8%] bg-[#3f0e40]/80 p-[4%]">
          {[70, 55, 80, 45].map((w, i) => (
            <div key={i} className="h-[3px] rounded bg-white/30" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex-1 space-y-[5%] p-[5%]">
          {[60, 40, 75, 50].map((w, i) => (
            <div key={i} className="flex items-center gap-[3%]">
              <div className="h-[clamp(6px,1.2vw,14px)] w-[clamp(6px,1.2vw,14px)] shrink-0 rounded bg-amber-200/40" />
              <div className="h-[3px] rounded bg-bone/25" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "browser") {
    return (
      <div className="space-y-[5%] p-[5%]">
        <div className="h-[8%] min-h-[6px] w-1/3 rounded bg-violet-300/40" />
        <div className="grid grid-cols-3 gap-[4%]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/3] rounded bg-bone/10" />
          ))}
        </div>
        <div className="h-[3px] w-3/4 rounded bg-bone/20" />
        <div className="h-[3px] w-1/2 rounded bg-bone/20" />
      </div>
    );
  }
  if (kind === "doc") {
    return (
      <div className="mx-auto h-full w-4/5 space-y-[4%] bg-[#f4f1ea]/90 p-[6%]">
        <div className="h-[5px] w-1/2 rounded bg-black/50" />
        {[95, 88, 92, 70, 90, 60].map((w, i) => (
          <div key={i} className="h-[3px] rounded bg-black/25" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }
  // code
  const rows: [number, number, string][] = [
    [0, 40, "bg-pink-400/50"],
    [6, 55, "bg-sky-300/45"],
    [6, 35, "bg-amber-200/45"],
    [12, 60, "bg-emerald-300/40"],
    [12, 45, "bg-sky-300/45"],
    [6, 20, "bg-bone/30"],
    [0, 15, "bg-bone/30"],
  ];
  return (
    <div className="space-y-[4%] p-[5%]">
      {rows.map(([indent, w, c], i) => (
        <div key={i} className={`h-[3px] rounded ${c}`} style={{ marginLeft: `${indent}%`, width: `${w}%` }} />
      ))}
    </div>
  );
}

// ── the MacBook screen: wallpaper, menu bar, notch, app window, dropped panel ──

function MacScreen({
  open,
  shot,
  alt,
  app,
  behind,
  onNotchEnter,
  onNotchLeave,
  onTap,
  hint,
}: {
  open: boolean;
  shot: string;
  alt: string;
  app: string;
  behind: Behind;
  onNotchEnter?: () => void;
  onNotchLeave?: () => void;
  onTap?: () => void;
  hint?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-bone/15 bg-[#0b0b0d] p-[1.4%] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.9)]">
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-[10px]"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 110%, #f59e6b 0%, transparent 55%), radial-gradient(90% 80% at 90% 100%, #7c3aed 0%, transparent 60%), linear-gradient(180deg, #1e1b4b 0%, #4c1d95 55%, #9d4edd 100%)",
        }}
        onClick={onTap}
      >
        {/* menu bar */}
        <div className="absolute inset-x-0 top-0 z-10 flex h-[4.2%] min-h-[12px] items-center justify-between bg-black/35 px-[2%] font-sans text-[clamp(6px,0.85vw,11px)] text-white/85 backdrop-blur">
          <div className="flex items-center gap-[1.2em]">
            <b className="font-semibold">{app.split(" — ")[0]}</b>
            <span>File</span>
            <span>Edit</span>
            <span className="hidden sm:inline">View</span>
          </div>
          <div className="flex items-center gap-[1.2em]">
            <span>Wed 30 Sep</span>
            <span>11:29</span>
          </div>
        </div>

        {/* the app you were working in */}
        <div className="absolute left-[7%] top-[13%] h-[78%] w-[66%] overflow-hidden rounded-[6px] border border-white/10 bg-[#1a1b22]/95 shadow-2xl">
          <div className="flex h-[7%] min-h-[10px] items-center gap-[1.5%] border-b border-white/10 bg-[#24252d] px-[2%]">
            <span className="h-[clamp(4px,0.6vw,8px)] w-[clamp(4px,0.6vw,8px)] rounded-full bg-[#ff5f57]" />
            <span className="h-[clamp(4px,0.6vw,8px)] w-[clamp(4px,0.6vw,8px)] rounded-full bg-[#febc2e]" />
            <span className="h-[clamp(4px,0.6vw,8px)] w-[clamp(4px,0.6vw,8px)] rounded-full bg-[#28c840]" />
            <span className="ml-[2%] font-sans text-[clamp(5px,0.8vw,10px)] text-white/50">{app}</span>
          </div>
          <div className="h-[93%]">
            <BehindContent kind={behind} />
          </div>
        </div>

        {/* notch + dropped panel — one black shape that grows out of the notch */}
        <div
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 overflow-hidden bg-black transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.25,1.15)]"
          style={{
            width: open ? "88%" : "15%",
            height: open ? "71%" : "4.2%",
            borderBottomLeftRadius: open ? 18 : 10,
            borderBottomRightRadius: open ? 18 : 10,
            boxShadow: open ? "0 24px 60px -10px rgba(0,0,0,0.75)" : "none",
          }}
          onMouseEnter={onNotchEnter}
          onMouseLeave={onNotchLeave}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shot}
            alt={alt}
            loading="lazy"
            className="absolute inset-x-0 top-0 w-full transition-opacity duration-300"
            style={{ opacity: open ? 1 : 0, transitionDelay: open ? "150ms" : "0ms" }}
          />
        </div>

        {/* first-visit hint pointing at the notch */}
        {hint && !open && (
          <div className="pointer-events-none absolute left-1/2 top-[8%] z-30 -translate-x-1/2 animate-bounce whitespace-nowrap rounded-full bg-white/90 px-3 py-1 font-mono text-[clamp(8px,1vw,11px)] font-bold uppercase tracking-[0.2em] text-black">
            ↑ hover the notch
          </div>
        )}
      </div>
    </div>
  );
}

// ── intro: what the notch is, and what Notchfy does with it ──

function Intro() {
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  // until someone interacts, open and close on its own so the idea is visible at a glance
  useEffect(() => {
    if (touched) return;
    const id = setInterval(() => setOpen((o) => !o), 2600);
    return () => clearInterval(id);
  }, [touched]);

  const steps = [
    ["01", "Every new MacBook has a notch", "A black cut-out at the top of the screen for the camera. It takes up space and does nothing."],
    ["02", "Move your cursor up to it", "Notchfy grows a dashboard out of the notch: 24 tools, whichever ones you switched on."],
    ["03", "Move away and it's gone", "No window to close and no app to switch back from. You never left what you were doing."],
  ];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr,1.6fr]">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">▸ what it is</div>
        <h3
          className="mt-3 text-3xl font-light uppercase leading-tight tracking-tight text-bone md:text-4xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Your notch, turned into a dashboard
        </h3>
        <ol className="mt-8 space-y-6">
          {steps.map(([n, t, b]) => (
            <li key={n} className="flex gap-4">
              <span className="font-mono text-[11px] text-amber-300/80">{n}</span>
              <div>
                <div className="font-sans text-base font-medium text-bone">{t}</div>
                <p className="mt-1 font-sans text-[15px] leading-relaxed text-bone/70">{b}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 font-mono text-[11px] leading-relaxed tracking-wide text-bone/50">
          no notch? it draws a simulated one · macOS 14+ · apple silicon + intel
        </p>
      </div>

      <MacScreen
        open={open}
        shot="/shots/notchfy/home.png"
        alt="Notchfy dashboard dropping out of the MacBook notch"
        app="Xcode"
        behind="code"
        hint={!touched}
        onNotchEnter={() => {
          setTouched(true);
          setOpen(true);
        }}
        onNotchLeave={() => setOpen(false)}
        onTap={() => {
          setTouched(true);
          setOpen((o) => !o);
        }}
      />
    </div>
  );
}

// ── one real-life moment: story on one side, the notch doing its job on the other ──

function SceneRow({ s, i }: { s: Scene; i: number }) {
  const flip = i % 2 === 1;
  return (
    <div className={`grid items-center gap-8 lg:gap-14 ${flip ? "lg:grid-cols-[1.7fr,1fr]" : "lg:grid-cols-[1fr,1.7fr]"}`}>
      <div className={flip ? "lg:order-2" : ""}>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50">
          <span className="text-amber-300/80">{String(i + 1).padStart(2, "0")}</span>
          <span>moment · {s.moment}</span>
        </div>
        <h4
          className="mt-3 text-2xl font-light leading-tight tracking-tight text-bone md:text-[28px]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {s.title}
        </h4>
        <p className="mt-3 max-w-lg font-sans text-[15px] leading-relaxed text-bone/75 md:text-base">{s.body}</p>
        {s.note && (
          <span className="mt-4 inline-block border border-bone/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
            {s.note}
          </span>
        )}
      </div>
      <div className={flip ? "lg:order-1" : ""}>
        <MacScreen open shot={s.shot} alt={s.alt} app={s.app} behind={s.behind} />
      </div>
    </div>
  );
}

export function NotchfyShowcase() {
  return (
    <div className="space-y-24">
      <Intro />

      <div>
        <div className="mb-12 max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">▸ in real life</div>
          <h3
            className="mt-3 text-3xl font-light uppercase leading-tight tracking-tight text-bone md:text-4xl"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            The moments it&apos;s built for
          </h3>
          <p className="mt-3 font-sans text-[15px] leading-relaxed text-bone/70 md:text-base">
            Each one is a small check that used to mean switching apps. All screenshots come from the real app.
          </p>
        </div>
        <div className="space-y-20 md:space-y-28">
          {SCENES.map((s, i) => (
            <SceneRow key={s.title} s={s} i={i} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-8 max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">▸ make it yours</div>
          <h3
            className="mt-3 text-3xl font-light uppercase leading-tight tracking-tight text-bone md:text-4xl"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Six themes, same dashboard
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {THEMES.map((t) => (
            <figure key={t.name} className="overflow-hidden rounded-xl border border-bone/10 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.src} alt={`${t.name} theme`} loading="lazy" className="w-full" />
              <figcaption className="border-t border-bone/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/60">
                {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start gap-5 rounded-2xl border border-amber-300/30 bg-amber-300/[0.06] p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">live · on sale</div>
          <p className="mt-2 font-sans text-lg text-bone">$5 for the first 100 buyers, then $12. One-time, no subscription.</p>
        </div>
        <a
          href={SITE}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-300 px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.25em] text-black transition hover:bg-amber-200"
        >
          ▸ visit notchfy.com <span aria-hidden>↗</span>
        </a>
      </div>
    </div>
  );
}
