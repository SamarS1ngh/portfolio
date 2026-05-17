export type ProjectTag = "ai" | "mobile" | "web" | "infra" | "voice" | "saas";

export type Project = {
  slug: string;
  name: string;
  year: string;
  role: string;
  blurb: string;
  tagline: string;
  stack: string[];
  tags: ProjectTag[];
  repo?: string;
  link?: string;
  status: "shipping" | "active" | "shipped" | "archived";
  problem: string;
  decisions: { title: string; body: string }[];
  outcome: string;
};

export const projects: Project[] = [
  {
    slug: "jarvis",
    name: "Jarvis",
    year: "2025—",
    role: "solo · everything",
    blurb: "voice OS for the desktop",
    tagline: "Stark-style assistant that lives on my laptop. Always listening, never annoying.",
    stack: ["TypeScript", "OpenAI Realtime", "Vosk", "Tauri", "Linux daemon", "RAG (WIP)"],
    tags: ["ai", "voice", "infra"],
    status: "active",
    problem:
      "Existing voice assistants are either cloud-tethered, locked to a vendor's app surface, or treat 'voice' as a search box. I wanted one that runs locally, holds context across days, and can act on the system — not just answer.",
    decisions: [
      {
        title: "Local wake-word, cloud reasoning",
        body: "Vosk for offline wake/keyword spotting, OpenAI Realtime API for the conversational layer. Best of both — instant local response on activation, frontier reasoning when it matters.",
      },
      {
        title: "Persistent memory via RAG (in progress)",
        body: "Conversations chunked + embedded into a local vector store so it remembers what we talked about last Tuesday. Long-term memory was the missing piece in every other assistant I tried.",
      },
      {
        title: "Daemon-first, UI-second",
        body: "Runs as a background process exposed over a unix socket. Tauri shell is just one client. Means CLI tools, hotkeys, and future agents can all talk to the same brain.",
      },
    ],
    outcome:
      "Daily-driver since week one. Handles ~40 voice queries/day for me. Memory-RAG is the next milestone — once that lands, it stops being a fancy STT and starts being an actual second brain.",
  },
  {
    slug: "nocap",
    name: "nocap",
    year: "2026",
    role: "solo · android + ml",
    blurb: "ruthless notification filter",
    tagline: "ML decides what's worth your attention. The rest gets summarized or shot.",
    stack: ["Kotlin", "Jetpack Compose", "NotificationListenerService", "Gemini Flash", "Room"],
    tags: ["mobile", "ai"],
    status: "shipping",
    problem:
      "Modern phones surface every Slack ping, every promo email, every group-chat reaction as if they were peer events. The default notification model is broken — and 'do not disturb' is a sledgehammer.",
    decisions: [
      {
        title: "Classify before display",
        body: "Every incoming notification is intercepted, passed to Gemini Flash with a few-shot prompt, and tagged: urgent / informational / promotional / social / junk. User sees what matters; the rest gets bucketed.",
      },
      {
        title: "Summarize, don't bury",
        body: "Promotional + social aren't deleted — they're collapsed into a periodic digest. Browseable on-demand, never interrupting.",
      },
      {
        title: "Gemini Flash for cost",
        body: "Hundreds of notifications per day per user means classification has to be cheap. Flash hits the latency + price point. Local LLM fallback planned.",
      },
    ],
    outcome:
      "Personal phone gets ~80% fewer interrupting notifications. Group-chat noise basically silenced. Beta with a small user pool.",
  },
  {
    slug: "eeo-modules",
    name: "EasyEnterpriseOS",
    year: "2025—",
    role: "co-build · full-stack",
    blurb: "open-core enterprise OS",
    tagline: "Four interlocking modules — SSO, Org, PM, Ledger — that talk to each other out of the box.",
    stack: ["TypeScript", "Next.js", "Postgres", "Drizzle", "tRPC", "Tailwind"],
    tags: ["web", "saas", "infra"],
    status: "active",
    problem:
      "Small teams paying for Okta + Notion + Linear + QuickBooks isn't a stack — it's a tax. Each tool reinvents identity, permissions, and audit trails badly.",
    decisions: [
      {
        title: "Four modules, one identity plane",
        body: "SSO sits underneath everything. Org defines people + permissions once. PM and Ledger consume both — no per-app user table, no per-app role model.",
      },
      {
        title: "Open-core, self-host first",
        body: "Each module is a standalone repo with its own deploy. Companies who want to host themselves get the full thing. Cloud is a convenience layer, not a moat.",
      },
      {
        title: "tRPC + Drizzle for end-to-end types",
        body: "Schema → DB → server → client without leaving TypeScript. Lets a tiny team move at the pace of a big one.",
      },
    ],
    outcome:
      "All four modules in active dev. SSO + Org production-ready. PM in beta with internal users. Ledger scaffolded.",
  },
  {
    slug: "ai-companion",
    name: "AI Companion",
    year: "2025",
    role: "collab · backend + ai",
    blurb: "long-context companion",
    tagline: "Conversational AI with persistent memory — remembers you across sessions, weeks, months.",
    stack: ["Python", "FastAPI", "OpenAI", "pgvector", "Redis"],
    tags: ["ai", "voice"],
    status: "active",
    problem:
      "Chat assistants forget you the moment the tab closes. For a companion that's supposed to feel like 'someone who knows you', that's a non-starter.",
    decisions: [
      {
        title: "Episodic + semantic memory split",
        body: "Episodic (raw conversation chunks, embedded) for recall; semantic (compressed facts about the user) for prompt injection. Two layers, queried differently.",
      },
      {
        title: "Async memory consolidation",
        body: "Background worker periodically reads recent episodes, distills facts, dedupes against existing semantic memory. Mirrors how sleep consolidates human memory.",
      },
    ],
    outcome:
      "Memory recall feels qualitatively different from a vanilla chat — users report the companion bringing up things from weeks prior. Still tuning the consolidation cadence.",
  },
  {
    slug: "teacher-pau",
    name: "teacher-pau",
    year: "2025",
    role: "contract · full-stack",
    blurb: "online teacher booking + live class",
    tagline: "Book a teacher, join a live video class, draw on a shared whiteboard. End-to-end.",
    stack: ["Next.js 14", "Drizzle", "Neon", "Daily.co", "S3", "Excalidraw", "JWT auth"],
    tags: ["web", "saas"],
    status: "shipped",
    problem:
      "Client needed Calendly + Zoom + a whiteboard + payment in one product, with teacher schedules, multiple class types, and recordings. Off-the-shelf stitching wouldn't cut it.",
    decisions: [
      {
        title: "Migrated Supabase → Neon mid-build",
        body: "Started on Supabase, hit limits on connection pooling under teacher-availability bursts. Moved to raw Neon TCP + Drizzle. Custom JWT replaced Supabase Auth. Painful, worth it.",
      },
      {
        title: "Daily.co over self-hosted",
        body: "Considered Jitsi + LiveKit. Daily.co's React hooks + recording API saved weeks of integration. The right buy-vs-build call.",
      },
      {
        title: "Excalidraw embedded as whiteboard",
        body: "Open-source, well-maintained, mature collaboration. Plugged in as a synced canvas — students and teachers draw together in real-time.",
      },
    ],
    outcome:
      "Shipped to production. Handling bookings, live classes, and recordings. Migration off Supabase removed a meaningful chunk of latency.",
  },
  {
    slug: "onecart",
    name: "ONECART",
    year: "2024—25",
    role: "contract · multi-repo",
    blurb: "multi-vendor commerce",
    tagline: "Customer app, vendor dashboard, serverless backend — three repos, one product.",
    stack: ["React Native (Expo)", "Clerk", "Next.js", "Node.js", "AWS Lambda", "Playwright"],
    tags: ["mobile", "web", "infra"],
    status: "shipped",
    problem:
      "Multi-vendor grocery commerce needs a delivery-friendly mobile app, an operator dashboard for vendors, and a backend that can handle bursty traffic at promo time without paying for idle.",
    decisions: [
      {
        title: "Three repos, shared contracts",
        body: "App, dashboard, and backend live separately so each team can ship at its own cadence. Shared OpenAPI spec keeps contracts honest.",
      },
      {
        title: "Clerk for auth",
        body: "Mobile + web auth flows that just work, including OTP and social. Skipped the rebuild-auth tax for a product that didn't compete on it.",
      },
      {
        title: "Serverless backend",
        body: "Lambda for everything. Cost matches usage — quiet at 3am, scales with the morning grocery rush. No idle EC2.",
      },
    ],
    outcome:
      "Shipped customer app to stores, dashboard to vendors, backend humming. Playwright suite gates dashboard releases.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
