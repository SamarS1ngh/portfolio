"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase =
  | "idle"
  | "listening"
  | "transcribing"
  | "reasoning"
  | "executing"
  | "speaking";

type ExecKind = "cmd" | "out" | "ok" | "warn";
type ExecLine = { kind: ExecKind; text: string };
type EffectResult = { lines?: ExecLine[]; reply?: string; ok?: boolean };
type Step = {
  utterance: string;
  intent: string;
  exec: ExecLine[];
  reply: string;
  effect?: () => Promise<EffectResult>;
};

type Skill = {
  id: string;
  hint: string;
  desc: string;
  badge?: "fires" | "perm" | "safe";
  test: RegExp;
  build: (text: string, m: RegExpMatchArray) => Step;
};

type HistEntry = {
  id: string;
  utterance: string;
  intent: string;
  reply: string;
  at: number;
};

const PHASE_LABEL: Record<Phase, string> = {
  idle: "standby",
  listening: "listening",
  transcribing: "stt · webspeech",
  reasoning: "matching skill",
  executing: "executing",
  speaking: "tts · webspeech",
};

const PHASE_TONE: Record<Phase, string> = {
  idle: "text-bone/60 border-bone/20 bg-bone/[0.04]",
  listening: "text-cyan-200 border-cyan-400/50 bg-cyan-400/10",
  transcribing: "text-cyan-200 border-cyan-400/40 bg-cyan-400/[0.06]",
  reasoning: "text-violet-200 border-violet-400/50 bg-violet-400/10",
  executing: "text-amber-200 border-amber-300/60 bg-amber-300/10",
  speaking: "text-emerald-200 border-emerald-400/50 bg-emerald-400/10",
};

const EXEC_TONE: Record<ExecKind, string> = {
  cmd: "text-bone/95",
  out: "text-bone/55",
  ok: "text-emerald-300",
  warn: "text-amber-300",
};

// ─── browser-side primitives ─────────────────────────────────────────

function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    u.pitch = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

const SITES: Record<string, string> = {
  github: "https://github.com",
  youtube: "https://youtube.com",
  twitter: "https://twitter.com",
  x: "https://x.com",
  google: "https://google.com",
  gmail: "https://mail.google.com",
  drive: "https://drive.google.com",
  calendar: "https://calendar.google.com",
  linkedin: "https://linkedin.com",
  stackoverflow: "https://stackoverflow.com",
  "stack overflow": "https://stackoverflow.com",
  reddit: "https://reddit.com",
  wikipedia: "https://wikipedia.org",
  "hacker news": "https://news.ycombinator.com",
  hn: "https://news.ycombinator.com",
  chatgpt: "https://chat.openai.com",
  claude: "https://claude.ai",
  "new tab": "about:blank",
  blank: "about:blank",
  spotify: "https://open.spotify.com",
  netflix: "https://netflix.com",
  maps: "https://maps.google.com",
  "google maps": "https://maps.google.com",
};

function resolveSite(target: string): string {
  const key = target
    .toLowerCase()
    .replace(/^(the|a|an)\s+/, "")
    .replace(/\s+app$/, "")
    .trim();
  if (SITES[key]) return SITES[key];
  if (/^https?:\/\//i.test(target)) return target;
  if (/\.[a-z]{2,}/i.test(target)) return `https://${target.replace(/^\s+|\s+$/g, "")}`;
  return `https://www.google.com/search?q=${encodeURIComponent(target)}`;
}

// ─── skills ─────────────────────────────────────────────────────────

const SKILLS: Skill[] = [
  {
    id: "time",
    hint: "what time is it",
    desc: "reads system clock",
    badge: "safe",
    test: /\b(what'?s?\s+(?:the\s+)?time|what\s+time|current\s+time)/i,
    build: (t) => {
      const now = new Date();
      const fmt = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      return {
        utterance: t,
        intent: "time.now",
        exec: [
          { kind: "cmd", text: "$ const now = new Date()" },
          { kind: "out", text: `→ ${now.toString().split(" GMT")[0]}` },
          { kind: "ok", text: `→ "${fmt}"` },
        ],
        reply: `It's ${fmt}.`,
      };
    },
  },
  {
    id: "date",
    hint: "what's the date today",
    desc: "reads date",
    badge: "safe",
    test: /\b(what'?s?\s+(?:the\s+)?date|today'?s?\s+date|what\s+day)/i,
    build: (t) => {
      const d = new Date();
      const fmt = d.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      return {
        utterance: t,
        intent: "date.today",
        exec: [
          { kind: "cmd", text: "$ new Date().toLocaleDateString()" },
          { kind: "ok", text: `→ ${fmt}` },
        ],
        reply: `Today is ${fmt}.`,
      };
    },
  },
  {
    id: "joke",
    hint: "tell me a joke",
    desc: "random joke",
    badge: "safe",
    test: /\b(joke|funny|make\s+me\s+laugh)/i,
    build: (t) => {
      const jokes = [
        "I told my GPU I needed space. Now it won't render to me.",
        "Why don't programmers like nature? Too many bugs.",
        "I'd tell you a UDP joke, but you might not get it.",
        "There are ten types of people. Those who get binary and those who don't.",
        "A SQL query walks into a bar, sees two tables, and asks: can I join you?",
      ];
      const j = jokes[Math.floor(Math.random() * jokes.length)];
      return {
        utterance: t,
        intent: "entertainment.joke",
        exec: [
          { kind: "cmd", text: "$ jokes[Math.floor(Math.random()*jokes.length)]" },
          { kind: "ok", text: "→ 1 selected" },
        ],
        reply: j,
      };
    },
  },
  {
    id: "intro",
    hint: "who are you",
    desc: "self description",
    badge: "safe",
    test: /\b(who\s+are\s+you|your\s+name|introduce\s+yourself)/i,
    build: (t) => ({
      utterance: t,
      intent: "meta.identity",
      exec: [
        { kind: "cmd", text: "$ voidd.identity()" },
        { kind: "ok", text: "→ V.O.I.D · web preview · build 0.7.2-web" },
      ],
      reply:
        "I'm V.O.I.D — Samar's voice agent. This is the browser preview. The pinned list shows what I can actually run here.",
    }),
  },
  {
    id: "help",
    hint: "what can you do",
    desc: "explain skills",
    badge: "safe",
    test: /\b(what\s+can\s+you\s+do|capabilities|help|list\s+(?:commands|skills))/i,
    build: (t) => ({
      utterance: t,
      intent: "meta.help",
      exec: [
        { kind: "cmd", text: "$ skills.list()" },
        { kind: "out", text: "→ enumerating registered skills" },
      ],
      reply:
        "Check the pinned skills on the right. Every line there maps to a browser API I'll actually call.",
    }),
  },
  {
    id: "open",
    hint: "open github",
    desc: "window.open · new tab",
    badge: "fires",
    test: /\b(open|launch|go\s+to|take\s+me\s+to)\s+(?!new\s+tab\b)(.+)/i,
    build: (t, m) => {
      const target = m[2].trim();
      const url = resolveSite(target);
      return {
        utterance: t,
        intent: "browser.open",
        exec: [
          { kind: "cmd", text: `$ resolveSite(${JSON.stringify(target)})` },
          { kind: "out", text: `→ ${url}` },
        ],
        reply: `Opening ${target}.`,
        effect: async () => {
          const w = window.open(url, "_blank", "noopener,noreferrer");
          return w
            ? { ok: true, lines: [{ kind: "ok", text: "→ window.open · tab spawned" }] }
            : {
                ok: false,
                lines: [{ kind: "warn", text: "→ popup blocked · allow popups for this origin" }],
                reply: "Your browser blocked the popup.",
              };
        },
      };
    },
  },
  {
    id: "newtab",
    hint: "open new tab",
    desc: "blank tab",
    badge: "fires",
    test: /\b(?:open\s+(?:a\s+)?new\s+tab|new\s+tab)\b/i,
    build: (t) => ({
      utterance: t,
      intent: "browser.tab.new",
      exec: [{ kind: "cmd", text: '$ window.open("about:blank", "_blank")' }],
      reply: "New tab on the way.",
      effect: async () => {
        const w = window.open("about:blank", "_blank", "noopener,noreferrer");
        return w
          ? { ok: true, lines: [{ kind: "ok", text: "→ tab opened" }] }
          : {
              ok: false,
              lines: [{ kind: "warn", text: "→ popup blocked" }],
              reply: "Browser blocked the popup.",
            };
      },
    }),
  },
  {
    id: "search",
    hint: "search rust borrow checker",
    desc: "google in new tab",
    badge: "fires",
    test: /\b(search|google|look\s+up)\s+(?:for\s+)?(.+)/i,
    build: (t, m) => {
      const q = m[2].trim();
      const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      return {
        utterance: t,
        intent: "browser.search",
        exec: [
          { kind: "cmd", text: `$ q = ${JSON.stringify(q)}` },
          { kind: "out", text: `→ ${url.length > 76 ? url.slice(0, 73) + "…" : url}` },
        ],
        reply: `Searching for ${q}.`,
        effect: async () => {
          const w = window.open(url, "_blank", "noopener,noreferrer");
          return {
            ok: !!w,
            lines: [{ kind: w ? "ok" : "warn", text: w ? "→ search tab opened" : "→ popup blocked" }],
          };
        },
      };
    },
  },
  {
    id: "copy",
    hint: "copy hello world",
    desc: "clipboard.writeText",
    badge: "perm",
    test: /\bcopy\s+(.+)/i,
    build: (t, m) => {
      const payload = m[1].trim().replace(/^["'](.*)["']$/, "$1");
      return {
        utterance: t,
        intent: "clipboard.write",
        exec: [
          {
            kind: "cmd",
            text: `$ navigator.clipboard.writeText(${JSON.stringify(payload)})`,
          },
        ],
        reply: `Copied "${payload}".`,
        effect: async () => {
          try {
            await navigator.clipboard.writeText(payload);
            return { ok: true, lines: [{ kind: "ok", text: "→ clipboard owned" }] };
          } catch (e: any) {
            return {
              ok: false,
              lines: [{ kind: "warn", text: `→ denied · ${e?.message ?? "permission"}` }],
              reply: "Clipboard write was blocked.",
            };
          }
        },
      };
    },
  },
  {
    id: "paste",
    hint: "read my clipboard",
    desc: "clipboard.readText",
    badge: "perm",
    test: /\b(read|what'?s?\s+(?:on|in))\s+(?:my\s+)?clipboard/i,
    build: (t) => ({
      utterance: t,
      intent: "clipboard.read",
      exec: [{ kind: "cmd", text: "$ navigator.clipboard.readText()" }],
      reply: "…",
      effect: async () => {
        try {
          const text = await navigator.clipboard.readText();
          const preview =
            text.length > 80 ? text.slice(0, 80) + "…" : text || "(empty)";
          return {
            ok: true,
            lines: [{ kind: "ok", text: `→ ${preview}` }],
            reply: text ? `Clipboard says: ${preview}` : "Clipboard is empty.",
          };
        } catch (e: any) {
          return {
            ok: false,
            lines: [{ kind: "warn", text: `→ denied · ${e?.message ?? "permission"}` }],
            reply: "Couldn't read your clipboard. Browser blocked it.",
          };
        }
      },
    }),
  },
  {
    id: "theme-flip",
    hint: "flip the theme",
    desc: "inverts demo panel only",
    badge: "fires",
    test: /\b(dark\s+mode|night\s+mode|go\s+dark|light\s+mode|day\s+mode|go\s+light|invert|flip\s+(?:the\s+)?theme)/i,
    build: (t) => ({
      utterance: t,
      intent: "theme.flip",
      exec: [
        { kind: "cmd", text: "$ root = document.getElementById('jarvis-demo-root')" },
        { kind: "cmd", text: "$ root.classList.toggle('jarvis-inverted')" },
      ],
      reply: "Theme flipped — scoped to this panel.",
      effect: async () => {
        const root = document.getElementById("jarvis-demo-root");
        if (!root) {
          return {
            ok: false,
            lines: [{ kind: "warn", text: "→ demo root not found" }],
          };
        }
        root.classList.toggle("jarvis-inverted");
        const on = root.classList.contains("jarvis-inverted");
        return {
          ok: true,
          lines: [{ kind: "ok", text: `→ inverted · ${on ? "on" : "off"}` }],
        };
      },
    }),
  },
  {
    id: "scroll-down",
    hint: "scroll down",
    desc: "scroll viewport",
    badge: "fires",
    test: /\bscroll\s+down\b/i,
    build: (t) => ({
      utterance: t,
      intent: "page.scroll.down",
      exec: [{ kind: "cmd", text: "$ window.scrollBy({ top: innerHeight*0.8 })" }],
      reply: "Down we go.",
      effect: async () => {
        const px = Math.round(window.innerHeight * 0.8);
        window.scrollBy({ top: px, behavior: "smooth" });
        return { ok: true, lines: [{ kind: "ok", text: `→ scrolled +${px}px` }] };
      },
    }),
  },
  {
    id: "scroll-up",
    hint: "scroll up",
    desc: "scroll viewport",
    badge: "fires",
    test: /\bscroll\s+up\b/i,
    build: (t) => ({
      utterance: t,
      intent: "page.scroll.up",
      exec: [{ kind: "cmd", text: "$ window.scrollBy({ top: -innerHeight*0.8 })" }],
      reply: "Up.",
      effect: async () => {
        const px = Math.round(window.innerHeight * 0.8);
        window.scrollBy({ top: -px, behavior: "smooth" });
        return { ok: true, lines: [{ kind: "ok", text: `→ scrolled -${px}px` }] };
      },
    }),
  },
  {
    id: "scroll-top",
    hint: "scroll to top",
    desc: "scroll viewport",
    badge: "fires",
    test: /\bscroll\s+(?:to\s+)?(?:the\s+)?top\b/i,
    build: (t) => ({
      utterance: t,
      intent: "page.scroll.top",
      exec: [{ kind: "cmd", text: "$ window.scrollTo({ top: 0 })" }],
      reply: "Back to the top.",
      effect: async () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return { ok: true, lines: [{ kind: "ok", text: "→ at origin" }] };
      },
    }),
  },
  {
    id: "fullscreen",
    hint: "fullscreen",
    desc: "toggle fullscreen",
    badge: "fires",
    test: /\b(fullscreen|full\s+screen|maximize|exit\s+fullscreen)\b/i,
    build: (t) => ({
      utterance: t,
      intent: "page.fullscreen.toggle",
      exec: [
        { kind: "cmd", text: "$ document.fullscreenElement ? exit : request" },
      ],
      reply: "Fullscreen toggled.",
      effect: async () => {
        try {
          if (document.fullscreenElement) {
            await document.exitFullscreen();
            return { ok: true, lines: [{ kind: "ok", text: "→ exited fullscreen" }] };
          }
          await document.documentElement.requestFullscreen();
          return { ok: true, lines: [{ kind: "ok", text: "→ entered fullscreen" }] };
        } catch (e: any) {
          return {
            ok: false,
            lines: [{ kind: "warn", text: `→ ${e?.message ?? "fullscreen denied"}` }],
            reply: "Browser blocked fullscreen.",
          };
        }
      },
    }),
  },
  {
    id: "notify",
    hint: "ping me in 10 seconds",
    desc: "scheduled Notification",
    badge: "perm",
    test: /\b(ping|nudge|remind|notify)\s+me\s+(?:in\s+)?(\d+)\s*(sec|second|seconds|min|minute|minutes)\b(?:\s+(?:to|about)?\s*(.+))?/i,
    build: (t, m) => {
      const n = parseInt(m[2], 10);
      const unit = m[3].startsWith("sec") ? 1000 : 60000;
      const ms = n * unit;
      const note = (m[4] ?? "you asked me to ping you").trim();
      return {
        utterance: t,
        intent: "scheduler.notify",
        exec: [
          {
            kind: "cmd",
            text: `$ setTimeout(() => new Notification("V.O.I.D"), ${ms})`,
          },
        ],
        reply: `Locked. I'll ping you in ${n} ${m[3]}.`,
        effect: async () => {
          if (typeof Notification === "undefined") {
            return {
              ok: false,
              lines: [{ kind: "warn", text: "→ Notification API unsupported" }],
            };
          }
          let perm = Notification.permission;
          if (perm === "default") perm = await Notification.requestPermission();
          if (perm !== "granted") {
            return {
              ok: false,
              lines: [
                { kind: "warn", text: "→ permission denied · grant to use ping" },
              ],
              reply: "Notification permission denied.",
            };
          }
          setTimeout(() => {
            try {
              new Notification("V.O.I.D · ping", { body: note });
            } catch {}
          }, ms);
          return {
            ok: true,
            lines: [{ kind: "ok", text: `→ job queued · fires in ${ms}ms` }],
          };
        },
      };
    },
  },
  {
    id: "repeat",
    hint: "repeat after me hello world",
    desc: "TTS arbitrary text",
    badge: "fires",
    test: /\b(?:repeat\s+after\s+me|say|speak)\s+(.+)/i,
    build: (t, m) => ({
      utterance: t,
      intent: "tts.speak",
      exec: [
        {
          kind: "cmd",
          text: `$ new SpeechSynthesisUtterance(${JSON.stringify(m[1].trim())})`,
        },
        { kind: "ok", text: "→ queued · speechSynthesis" },
      ],
      reply: m[1].trim(),
    }),
  },
  {
    id: "stop",
    hint: "stop talking",
    desc: "cancel TTS",
    badge: "safe",
    test: /\b(stop\s+(?:talking|speaking)|shut\s+up|be\s+quiet|silence)/i,
    build: (t) => ({
      utterance: t,
      intent: "tts.cancel",
      exec: [{ kind: "cmd", text: "$ speechSynthesis.cancel()" }],
      reply: "",
      effect: async () => {
        if (typeof window !== "undefined") window.speechSynthesis?.cancel();
        return { ok: true, lines: [{ kind: "ok", text: "→ tts queue flushed" }] };
      },
    }),
  },
  {
    id: "reload",
    hint: "reload the page",
    desc: "location.reload",
    badge: "fires",
    test: /\b(reload|refresh)\s+(?:the\s+)?(?:page|tab)/i,
    build: (t) => ({
      utterance: t,
      intent: "page.reload",
      exec: [{ kind: "cmd", text: "$ location.reload()" }],
      reply: "Reloading.",
      effect: async () => {
        setTimeout(() => location.reload(), 400);
        return { ok: true, lines: [{ kind: "ok", text: "→ reload scheduled" }] };
      },
    }),
  },
];

// Steps that autoloop is allowed to demo (no side effects, no popups, no TTS).
const AUTOLOOP_HINTS = [
  "what time is it",
  "what's the date today",
  "tell me a joke",
  "who are you",
  "what can you do",
];

function skillByHint(hint: string): Step | null {
  for (const s of SKILLS) {
    const m = hint.match(s.test);
    if (m) return s.build(hint, m);
  }
  return null;
}

function buildAutoSteps(): Step[] {
  return AUTOLOOP_HINTS.map((h) => skillByHint(h)).filter(
    (s): s is Step => s !== null
  );
}

function classifyLive(text: string): { step: Step; matched: boolean } {
  for (const s of SKILLS) {
    const m = text.match(s.test);
    if (m) return { step: s.build(text, m), matched: true };
  }
  return {
    matched: false,
    step: {
      utterance: text,
      intent: "nlu.unmatched",
      exec: [
        { kind: "cmd", text: `$ skills.match(${JSON.stringify(text)})` },
        { kind: "warn", text: "→ no skill matched" },
      ],
      reply: `I don't have a skill for "${text}" in the browser yet. Try one from the pinned list on the right.`,
    },
  };
}

// ─── async utilities ───────────────────────────────────────────────

function sleep(ms: number, ref: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    if (ref.cancelled) return resolve();
    const t = setTimeout(resolve, ms);
    const i = setInterval(() => {
      if (ref.cancelled) {
        clearTimeout(t);
        clearInterval(i);
        resolve();
      }
    }, 40);
    setTimeout(() => clearInterval(i), ms + 80);
  });
}

async function typewriter(
  text: string,
  setter: (s: string) => void,
  cps: number,
  ref: { cancelled: boolean }
) {
  setter("");
  const step = Math.max(8, 1000 / cps);
  let cur = "";
  for (const ch of text) {
    if (ref.cancelled) return;
    cur += ch;
    setter(cur);
    await sleep(step, ref);
  }
}

function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    sec
  ).padStart(2, "0")}`;
}

// ─── component ─────────────────────────────────────────────────────

export default function JarvisDemo() {
  // simulation state
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [intent, setIntent] = useState<string>("");
  const [typedUtterance, setTypedUtterance] = useState("");
  const [execLines, setExecLines] = useState<ExecLine[]>([]);
  const [typedReply, setTypedReply] = useState("");
  const [history, setHistory] = useState<HistEntry[]>([]);

  // mic / live mode
  const [live, setLive] = useState(false);
  const [supported, setSupported] = useState(true);
  const [amp, setAmp] = useState(0);
  const [interim, setInterim] = useState("");

  // telemetry
  const [tokens, setTokens] = useState(87);
  const [latency, setLatency] = useState(142);
  const [ctxTokens, setCtxTokens] = useState(842);
  const [waker, setWaker] = useState(0.94);
  const [uptimeStart] = useState(
    () => Date.now() - (4 * 3600 + 21 * 60) * 1000
  );
  const [now, setNow] = useState(Date.now());

  // phase timing trace (last run)
  const [traceMs, setTraceMs] = useState<Record<Phase, number>>({
    idle: 0,
    listening: 0,
    transcribing: 0,
    reasoning: 0,
    executing: 0,
    speaking: 0,
  });
  const lastPhaseAtRef = useRef<{ phase: Phase; at: number }>({
    phase: "idle",
    at: performance.now(),
  });

  // refs / control
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const idxRef = useRef(0);
  const [pulse, setPulse] = useState(0);

  const recRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  // clock
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // telemetry jitter
  useEffect(() => {
    const t = setInterval(() => {
      setTokens(72 + Math.floor(Math.random() * 36));
      setLatency(118 + Math.floor(Math.random() * 84));
      setWaker(0.86 + Math.random() * 0.13);
    }, 1400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCtxTokens((c) => Math.max(420, c - Math.floor(Math.random() * 6)));
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // SR detect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  // clear any leftover global filter from earlier demo versions
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.filter = "";
    document.body.style.filter = "";
  }, []);

  // track phase durations
  useEffect(() => {
    const now = performance.now();
    const last = lastPhaseAtRef.current;
    if (last.phase !== "idle" && last.phase !== phase) {
      const dur = now - last.at;
      setTraceMs((t) => ({ ...t, [last.phase]: dur }));
    }
    if (phase === "listening") {
      setTraceMs({
        idle: 0,
        listening: 0,
        transcribing: 0,
        reasoning: 0,
        executing: 0,
        speaking: 0,
      });
    }
    lastPhaseAtRef.current = { phase, at: now };
  }, [phase]);

  // single-step runner
  const runStep = useCallback(
    async (
      step: Step,
      ref: { cancelled: boolean },
      opts: { real?: boolean } = {}
    ) => {
      setTypedUtterance("");
      setExecLines([]);
      setTypedReply("");
      setIntent(step.intent);

      // listening
      setPhase("listening");
      await sleep(620, ref);
      if (ref.cancelled) return;

      // transcribing
      setPhase("transcribing");
      await typewriter(step.utterance, setTypedUtterance, 30, ref);
      if (ref.cancelled) return;
      await sleep(240, ref);

      // reasoning
      setPhase("reasoning");
      await sleep(620, ref);
      if (ref.cancelled) return;

      // executing — planned lines first
      setPhase("executing");
      for (const line of step.exec) {
        if (ref.cancelled) return;
        setExecLines((prev) => [...prev, line]);
        setCtxTokens((c) => c + 4 + Math.floor(Math.random() * 10));
        await sleep(440, ref);
      }

      // run real effect if requested
      let finalReply = step.reply;
      if (opts.real && step.effect) {
        try {
          const result = await step.effect();
          if (result.lines) {
            for (const line of result.lines) {
              if (ref.cancelled) return;
              setExecLines((prev) => [...prev, line]);
              await sleep(300, ref);
            }
          }
          if (result.reply !== undefined) finalReply = result.reply;
        } catch (err: any) {
          setExecLines((prev) => [
            ...prev,
            {
              kind: "warn",
              text: `→ effect threw · ${err?.message ?? "unknown"}`,
            },
          ]);
          finalReply = "That blew up. Try another command.";
        }
      }

      await sleep(180, ref);
      if (ref.cancelled) return;

      // speaking
      setPhase("speaking");
      if (finalReply) {
        await typewriter(finalReply, setTypedReply, 42, ref);
      }
      if (ref.cancelled) return;

      if (opts.real && finalReply) speakText(finalReply);
      await sleep(900, ref);

      setHistory((h) =>
        [
          {
            id: Math.random().toString(36).slice(2, 9),
            utterance: step.utterance,
            intent: step.intent,
            reply: finalReply,
            at: Date.now(),
          },
          ...h,
        ].slice(0, 5)
      );

      setPhase("idle");
      await sleep(900, ref);
    },
    []
  );

  // autoloop driver — safe steps only
  useEffect(() => {
    if (live) return;
    const ref = { cancelled: false };
    cancelRef.current = ref;

    (async () => {
      while (!ref.cancelled) {
        const steps = buildAutoSteps();
        const i = idxRef.current % steps.length;
        setStepIdx(i);
        await runStep(steps[i], ref, { real: false });
        if (ref.cancelled) return;
        idxRef.current = (idxRef.current + 1) % steps.length;
      }
    })();

    return () => {
      ref.cancelled = true;
    };
  }, [live, pulse, runStep]);

  // run a single skill for real (chip click)
  const runSkillReal = useCallback(
    async (skill: Skill) => {
      cancelRef.current.cancelled = true;
      await new Promise((r) => setTimeout(r, 30));
      const ref = { cancelled: false };
      cancelRef.current = ref;
      const m = skill.hint.match(skill.test);
      if (!m) return;
      const step = skill.build(skill.hint, m);
      await runStep(step, ref, { real: true });
      // resume autoloop unless mic is live
      if (!live) {
        idxRef.current = (idxRef.current + 1) % AUTOLOOP_HINTS.length;
        setPulse((p) => p + 1);
      }
    },
    [runStep, live]
  );

  function skip() {
    cancelRef.current.cancelled = true;
    idxRef.current = (idxRef.current + 1) % AUTOLOOP_HINTS.length;
    setPulse((p) => p + 1);
  }

  // mic plumbing
  async function startMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i];
        setAmp(sum / buf.length / 255);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        rec.onresult = (e: any) => {
          let finalText = "";
          let interimText = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) finalText += r[0].transcript;
            else interimText += r[0].transcript;
          }
          if (interimText) setInterim(interimText);
          if (finalText) {
            setInterim("");
            void handleLiveUtterance(finalText);
          }
        };
        rec.onerror = () => stopMic();
        rec.onend = () => setLive(false);
        recRef.current = rec;
        rec.start();
      }
      setLive(true);
      cancelRef.current.cancelled = true;
      setPhase("listening");
    } catch {
      setSupported(false);
    }
  }

  function stopMic() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {}
      recRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    setLive(false);
    setAmp(0);
    setInterim("");
    setPulse((p) => p + 1);
  }

  async function handleLiveUtterance(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    cancelRef.current.cancelled = true;
    await new Promise((r) => setTimeout(r, 30));
    const ref = { cancelled: false };
    cancelRef.current = ref;
    const { step } = classifyLive(trimmed);
    await runStep(step, ref, { real: true });
    if (live) setPhase("listening");
  }

  useEffect(() => () => stopMic(), []);

  const bars = useWaveBars(phase, amp, 32);

  return (
    <div
      id="jarvis-demo-root"
      className="relative overflow-hidden rounded-2xl border border-bone/10 bg-black/55 p-4 backdrop-blur-md md:p-6"
    >
      <style jsx global>{`
        #jarvis-demo-root.jarvis-inverted {
          filter: invert(1) hue-rotate(180deg);
        }
      `}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(125,163,255,0.5) 0 1px, transparent 1px 3px)",
        }}
      />

      <div className="relative flex flex-wrap items-center gap-3">
        <PhaseChip phase={phase} />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">
          ▸ v.o.i.d · web preview
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/60">
          {formatUptime(now - uptimeStart)} uptime
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={skip}
            disabled={live}
            className="rounded-full border border-bone/15 bg-bone/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70 transition hover:border-amber-300/40 hover:text-amber-300 disabled:opacity-40"
          >
            skip ▸
          </button>
          {supported && (
            <button
              type="button"
              onClick={() => (live ? stopMic() : startMic())}
              className={`group relative inline-flex items-center gap-2 overflow-hidden border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] transition ${
                live
                  ? "border-cyan-400/70 bg-cyan-400/15 text-cyan-100 shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)] hover:bg-cyan-400/25"
                  : "border-amber-300/70 bg-amber-300/15 text-amber-100 shadow-[0_0_24px_-4px_rgba(255,213,107,0.7)] hover:bg-amber-300/25"
              }`}
              aria-label={live ? "stop listening" : "engage microphone"}
            >
              {!live && (
                <span className="pointer-events-none absolute inset-0 -z-0 animate-pulse bg-amber-300/[0.08]" />
              )}
              <MicIcon active={live} />
              <span className="relative">
                {live ? "stop · listening" : "tap to talk"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* note explaining honesty */}
      <div className="relative mt-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.04] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200/80">
        ⚠ browser preview · only browser APIs run. desktop daemon (xdotool, processes, files) lives at the project root.
      </div>

      <div className="relative mt-4 grid gap-4 lg:grid-cols-[280px,minmax(0,1fr),340px]">
        <div className="flex flex-col gap-3">
          <OrbCard
            phase={phase}
            amp={amp}
            live={live}
            supported={supported}
            onToggleMic={() => (live ? stopMic() : startMic())}
          />
          <Waveform bars={bars} phase={phase} />
          <Telemetry
            phase={phase}
            tokens={tokens}
            latency={latency}
            ctxTokens={ctxTokens}
            waker={waker}
          />
          <CapabilitiesPane supported={supported} />
        </div>

        <div className="flex flex-col gap-3">
        <div className="relative flex min-h-[280px] flex-col rounded-xl border border-bone/10 bg-black/70 p-4 font-mono text-[12.5px] leading-[1.55] lg:min-h-[360px]">
          <div className="mb-3 flex items-center justify-between border-b border-bone/10 pb-2 text-[10px] uppercase tracking-[0.3em]">
            <span className="text-amber-300/70">
              ◐ session · {String(stepIdx + 1).padStart(2, "0")} /{" "}
              {String(AUTOLOOP_HINTS.length).padStart(2, "0")}
            </span>
            {intent && (
              <span className="text-violet-300/80">intent · {intent}</span>
            )}
          </div>

          <div className="flex-1 space-y-2 overflow-hidden">
            <div className="text-cyan-300">
              <span className="text-cyan-500/60">{">"}</span>{" "}
              {typedUtterance || (live && interim) || (
                <span className="text-bone/25 italic">
                  {live ? "listening for you…" : "awaiting utterance"}
                </span>
              )}
              {(phase === "transcribing" || (live && interim)) && (
                <Caret className="bg-cyan-300" />
              )}
              {live && interim && (
                <span className="text-bone/40 italic"> {interim}</span>
              )}
            </div>

            {(phase === "reasoning" ||
              phase === "executing" ||
              phase === "speaking" ||
              execLines.length > 0 ||
              typedReply) && (
              <div className="text-violet-300/85">
                <Spinner active={phase === "reasoning"} /> matching skill ·
                resolving handler
                {phase === "reasoning" && <Caret className="bg-violet-300" />}
              </div>
            )}

            {execLines.map((ln, i) => (
              <div key={i} className={EXEC_TONE[ln.kind]}>
                {ln.text}
              </div>
            ))}

            {(typedReply || phase === "speaking") && (
              <div className="pt-1 text-emerald-300">
                <span className="text-emerald-500/70">◐</span>{" "}
                <span className="italic">"{typedReply}"</span>
                {phase === "speaking" && <Caret className="bg-emerald-300" />}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-bone/10 pt-2 text-[10px] uppercase tracking-[0.3em] text-bone/40">
            <span>▸ vox-link · {PHASE_LABEL[phase]}</span>
            <span>
              tok {ctxTokens.toLocaleString()} · {tokens} t/s · {latency}ms
            </span>
          </div>
        </div>

        {/* latency trace — fills the previously empty middle real-estate */}
        <LatencyTrace ms={traceMs} phase={phase} />
        </div>

        {/* skills — third column, side by side with simulator */}
        <div className="flex max-h-[420px] flex-col rounded-xl border border-bone/10 bg-black/40 p-3 lg:max-h-none lg:min-h-[440px]">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
            <span>[ skills · {SKILLS.length} ]</span>
            <span className="flex items-center gap-1.5 text-bone/40">
              <BadgeDot tone="safe" /> safe
              <BadgeDot tone="fires" /> fires
              <BadgeDot tone="perm" /> perm
            </span>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {SKILLS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => runSkillReal(s)}
                className="group flex w-full items-start gap-2 rounded-md border border-bone/10 bg-bone/[0.03] px-2.5 py-1.5 text-left transition hover:border-amber-300/40 hover:bg-amber-300/[0.06]"
              >
                <BadgeDot tone={s.badge ?? "safe"} className="mt-1 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[11px] text-bone/90 group-hover:text-amber-200">
                    "{s.hint}"
                  </span>
                  <span className="block truncate font-mono text-[9px] uppercase tracking-[0.2em] text-bone/40">
                    {s.desc}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {!supported && (
            <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/40">
              mic disabled · chips still run
            </div>
          )}
        </div>
      </div>

      {/* memory pane — full-width row below */}
      <div className="relative mt-4 rounded-xl border border-bone/10 bg-black/40 p-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
          [ memory · recent · {history.length} ]
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {history.length === 0 && (
            <div className="font-mono text-xs text-bone/30 sm:col-span-2 lg:col-span-3">
              no entries yet — runs commit after first reply
            </div>
          )}
          {history.map((h) => (
            <div key={h.id} className="font-mono text-[11px]">
              <span className="text-cyan-300">you</span>
              <span className="text-bone/30"> · </span>
              <span className="text-bone/85">{h.utterance}</span>
              <span className="ml-2 text-violet-300/70">[{h.intent}]</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "animate-pulse" : ""}
      aria-hidden
    >
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  );
}

function BadgeDot({
  tone,
  className = "",
}: {
  tone: "fires" | "perm" | "safe";
  className?: string;
}) {
  const map: Record<string, string> = {
    safe: "bg-emerald-400 shadow-[0_0_6px_#34d399]",
    fires: "bg-amber-300 shadow-[0_0_6px_#ffd76b]",
    perm: "bg-violet-400 shadow-[0_0_6px_#a78bfa]",
  };
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${map[tone]} ${className}`}
    />
  );
}

function PhaseChip({ phase }: { phase: Phase }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] ${PHASE_TONE[phase]}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          phase === "idle"
            ? "bg-bone/40"
            : phase === "listening" || phase === "transcribing"
            ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse"
            : phase === "reasoning"
            ? "bg-violet-400 shadow-[0_0_8px_#a78bfa] animate-pulse"
            : phase === "executing"
            ? "bg-amber-300 shadow-[0_0_8px_#ffd76b] animate-pulse"
            : "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
        }`}
      />
      [{PHASE_LABEL[phase]}]
    </div>
  );
}

function OrbCard({
  phase,
  amp,
  live,
  supported,
  onToggleMic,
}: {
  phase: Phase;
  amp: number;
  live: boolean;
  supported: boolean;
  onToggleMic: () => void;
}) {
  const speaking = phase === "speaking";
  const exec = phase === "executing";
  const reasoning = phase === "reasoning";
  const listening = phase === "listening" || phase === "transcribing";

  const baseGlow = speaking
    ? 0.95
    : exec
    ? 0.75
    : reasoning
    ? 0.6
    : listening
    ? 0.45 + amp * 0.5
    : 0.18;
  const ringScale = 1 + baseGlow * 0.32;
  const orbColor = speaking
    ? "#34d399"
    : exec
    ? "#ffd76b"
    : reasoning
    ? "#a78bfa"
    : listening
    ? "#22d3ee"
    : "#7da3ff";

  return (
    <button
      type="button"
      onClick={onToggleMic}
      disabled={!supported}
      aria-label={live ? "stop listening" : "tap to talk"}
      className={`group relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border bg-gradient-to-b from-black/60 to-black/30 transition disabled:cursor-not-allowed lg:max-w-none ${
        live
          ? "border-cyan-400/60 shadow-[0_0_30px_-6px_rgba(34,211,238,0.6)]"
          : "border-amber-300/40 shadow-[0_0_30px_-8px_rgba(255,213,107,0.55)] hover:border-amber-300/70 hover:shadow-[0_0_40px_-4px_rgba(255,213,107,0.7)]"
      }`}
    >
      {/* invitation pulse — only when idle + not live */}
      {!live && supported && phase === "idle" && (
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-2xl border border-amber-300/40" />
      )}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="orb-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={orbColor} stopOpacity="0.95" />
            <stop offset="55%" stopColor={orbColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={orbColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g stroke={orbColor} strokeOpacity="0.08" strokeWidth="0.6">
          <circle cx="100" cy="100" r="90" fill="none" />
          <circle cx="100" cy="100" r="70" fill="none" />
          <circle cx="100" cy="100" r="50" fill="none" />
          <line x1="10" y1="100" x2="190" y2="100" />
          <line x1="100" y1="10" x2="100" y2="190" />
        </g>

        <g
          style={{
            transformOrigin: "100px 100px",
            animation: "vspin 14s linear infinite",
          }}
        >
          <circle
            cx="100"
            cy="100"
            r={78 * ringScale}
            fill="none"
            stroke={orbColor}
            strokeOpacity="0.45"
            strokeDasharray="3 7"
            strokeWidth="0.9"
            style={{ transition: "r 120ms linear" }}
          />
        </g>

        <circle
          cx="100"
          cy="100"
          r={62 * ringScale}
          fill="none"
          stroke={orbColor}
          strokeOpacity="0.55"
          strokeWidth="1.1"
          style={{ transition: "r 80ms linear" }}
        />

        <circle
          cx="100"
          cy="100"
          r={28 + baseGlow * 10}
          fill="url(#orb-grad)"
          style={{ transition: "r 80ms linear" }}
        />

        <circle cx="86" cy="98" r={2.6 + baseGlow * 1.3} fill={orbColor} />
        <circle cx="114" cy="98" r={2.6 + baseGlow * 1.3} fill={orbColor} />

        <path
          d={
            speaking
              ? "M 84 114 Q 100 126 116 114"
              : exec
              ? "M 86 113 Q 100 119 114 113"
              : "M 88 113 Q 100 115 112 113"
          }
          fill="none"
          stroke={orbColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <div className="pointer-events-none absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-300/80">
        v.o.i.d · core
      </div>

      {/* CTA label — appears for idle, hides while session runs */}
      {supported && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] transition ${
            live ? "text-cyan-200" : "text-amber-200 group-hover:text-amber-100"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-current/40 bg-black/50 px-3 py-1 backdrop-blur-sm">
            <MicIcon active={live} />
            {live ? "listening · tap to stop" : "tap to talk"}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-3 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/45">
        amp {(amp * 100).toFixed(0).padStart(2, "0")} · gain {Math.floor(baseGlow * 100)}
      </div>

      <style jsx>{`
        @keyframes vspin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
}

function Waveform({ bars, phase }: { bars: number[]; phase: Phase }) {
  const tone =
    phase === "speaking"
      ? "bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
      : phase === "executing"
      ? "bg-amber-300 shadow-[0_0_6px_rgba(255,213,107,0.5)]"
      : phase === "reasoning"
      ? "bg-violet-300 shadow-[0_0_6px_rgba(167,139,250,0.5)]"
      : phase === "listening" || phase === "transcribing"
      ? "bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.5)]"
      : "bg-bone/60";
  return (
    <div className="rounded-xl border border-bone/15 bg-black/50 p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
        <span>[ waveform · 16k ]</span>
        <span className="text-bone/45">fft · 256</span>
      </div>
      <div className="flex h-20 items-end gap-[3px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`flex-1 rounded-sm ${tone}`}
            style={{
              height: `${Math.max(14, h * 100)}%`,
              opacity: 0.7 + h * 0.3,
              transition: "height 80ms linear, opacity 80ms linear",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Telemetry({
  phase,
  tokens,
  latency,
  ctxTokens,
  waker,
}: {
  phase: Phase;
  tokens: number;
  latency: number;
  ctxTokens: number;
  waker: number;
}) {
  const Row = ({ k, v, hot }: { k: string; v: string; hot?: boolean }) => (
    <div className="flex items-baseline justify-between gap-2 font-mono text-[10.5px]">
      <span className="uppercase tracking-[0.25em] text-bone/45">{k}</span>
      <span className={hot ? "text-amber-300" : "text-bone/85"}>{v}</span>
    </div>
  );
  return (
    <div className="rounded-xl border border-bone/10 bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
        <span>[ telemetry ]</span>
        <span className="text-emerald-300/70">● ok</span>
      </div>
      <div className="space-y-1">
        <Row k="runtime" v="browser · webspeech" />
        <Row k="wake" v={`conf ${waker.toFixed(2)}`} />
        <Row k="stt lat" v={`${latency}ms`} hot={phase === "transcribing"} />
        <Row k="tok/s" v={`${tokens}`} hot={phase === "reasoning" || phase === "speaking"} />
        <Row k="ctx" v={`${ctxTokens.toLocaleString()} tok`} />
        <Row k="skills" v={`${SKILLS.length} loaded`} />
      </div>
    </div>
  );
}

const PHASE_BAR_TONE: Record<Phase, string> = {
  idle: "bg-bone/40",
  listening: "bg-cyan-400",
  transcribing: "bg-cyan-300",
  reasoning: "bg-violet-400",
  executing: "bg-amber-300",
  speaking: "bg-emerald-400",
};

function LatencyTrace({
  ms,
  phase,
}: {
  ms: Record<Phase, number>;
  phase: Phase;
}) {
  const rows: Phase[] = [
    "listening",
    "transcribing",
    "reasoning",
    "executing",
    "speaking",
  ];
  const total = rows.reduce((s, p) => s + (ms[p] || 0), 0);
  const max = Math.max(1500, total);
  return (
    <div className="rounded-xl border border-bone/15 bg-black/50 p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
        <span>[ latency trace · last run ]</span>
        <span className="text-bone/55">
          Σ {total > 0 ? `${total.toFixed(0)}ms` : "—"}
        </span>
      </div>
      <div className="space-y-1.5">
        {rows.map((p) => {
          const v = ms[p] || 0;
          const w = max > 0 ? (v / max) * 100 : 0;
          const live = phase === p;
          return (
            <div
              key={p}
              className="flex items-center gap-3 font-mono text-[10.5px]"
            >
              <span className="w-[88px] shrink-0 uppercase tracking-[0.22em] text-bone/55">
                {p}
              </span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-sm bg-bone/[0.05]">
                <div
                  className={`h-full ${PHASE_BAR_TONE[p]} ${
                    live ? "shadow-[0_0_8px_rgba(255,255,255,0.35)]" : ""
                  }`}
                  style={{
                    width: `${w}%`,
                    transition: "width 240ms ease-out",
                  }}
                />
                {live && (
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 ${PHASE_BAR_TONE[p]} opacity-50 animate-pulse`}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
              <span className="w-14 text-right text-bone/80">
                {v > 0 ? `${v.toFixed(0)}ms` : live ? "…" : "—"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 border-t border-bone/10 pt-2 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/45">
        ▸ ear → brain → hands → mouth · per-phase wall time
      </div>
    </div>
  );
}

type Cap = {
  label: string;
  state: "ok" | "warn" | "off";
  detail: string;
};

function CapabilitiesPane({ supported }: { supported: boolean }) {
  const [caps, setCaps] = useState<Cap[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const list: Cap[] = [
      {
        label: "stt",
        state: supported ? "ok" : "off",
        detail: supported ? "webspeech" : "missing",
      },
      {
        label: "tts",
        state: window.speechSynthesis ? "ok" : "off",
        detail: window.speechSynthesis ? "ready" : "missing",
      },
      {
        label: "clipboard",
        state: navigator.clipboard ? "ok" : "off",
        detail: navigator.clipboard ? "r/w · secure" : "needs https",
      },
      {
        label: "notify",
        state:
          typeof Notification === "undefined"
            ? "off"
            : Notification.permission === "granted"
            ? "ok"
            : Notification.permission === "denied"
            ? "off"
            : "warn",
        detail:
          typeof Notification === "undefined"
            ? "unsupported"
            : Notification.permission,
      },
      {
        label: "fullscreen",
        state: document.fullscreenEnabled ? "ok" : "off",
        detail: document.fullscreenEnabled ? "ready" : "blocked",
      },
      {
        label: "mic",
        state: navigator.mediaDevices ? "ok" : "off",
        detail: navigator.mediaDevices ? "getUserMedia" : "missing",
      },
    ];
    setCaps(list);
  }, [supported, tick]);

  const okCount = caps.filter((c) => c.state === "ok").length;

  return (
    <div className="rounded-xl border border-bone/15 bg-black/50 p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
        <span>[ capabilities ]</span>
        <span className="text-bone/55">
          {okCount}/{caps.length}
        </span>
      </div>
      <div className="space-y-1">
        {caps.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-between gap-2 font-mono text-[10.5px]"
          >
            <span className="flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  c.state === "ok"
                    ? "bg-emerald-400 shadow-[0_0_5px_#34d399]"
                    : c.state === "warn"
                    ? "bg-amber-300 shadow-[0_0_5px_#ffd76b]"
                    : "bg-bone/30"
                }`}
              />
              <span className="uppercase tracking-[0.22em] text-bone/70">
                {c.label}
              </span>
            </span>
            <span
              className={
                c.state === "ok"
                  ? "text-emerald-300"
                  : c.state === "warn"
                  ? "text-amber-300"
                  : "text-bone/45"
              }
            >
              {c.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Caret({ className = "" }: { className?: string }) {
  return (
    <span
      className={`ml-0.5 inline-block h-[0.95em] w-[0.5ch] align-[-1px] animate-pulse ${className}`}
    />
  );
}

function Spinner({ active }: { active: boolean }) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setI((x) => (x + 1) % frames.length), 90);
    return () => clearInterval(t);
  }, [active]);
  return <span className="inline-block w-3">{active ? frames[i] : "✓"}</span>;
}

function useWaveBars(phase: Phase, amp: number, count: number) {
  const [bars, setBars] = useState<number[]>(() => Array(count).fill(0.12));
  useEffect(() => {
    let raf = 0;
    let t = 0;
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      t += 0.09;
      const base =
        phase === "speaking"
          ? 0.55
          : phase === "executing"
          ? 0.4
          : phase === "listening" || phase === "transcribing"
          ? 0.34
          : phase === "reasoning"
          ? 0.26
          : 0.22;
      const next = Array.from({ length: count }, (_, i) => {
        const wob =
          Math.sin(t + i * 0.55) * 0.22 +
          Math.sin(t * 1.35 + i * 0.31) * 0.14 +
          Math.sin(t * 0.7 + i * 0.9) * 0.08;
        const reactive = amp * (0.5 + (i % 4) * 0.18);
        return Math.max(0.12, Math.min(1, base + wob + reactive));
      });
      setBars(next);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, [phase, amp, count]);
  return bars;
}
