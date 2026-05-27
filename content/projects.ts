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
  why: string;
  architecture: string;
  challenge: string;
  tradeoffs: string[];
  scale: string;
  future: string;
  decisions: { title: string; body: string }[];
  outcome: string;
  // optional visual sweeteners — render when present, else fall back to prose
  architectureMap?: string;
  challengeStats?: { k: string; v: string }[];
  scaleStats?: { k: string; v: string }[];
  futureMilestones?: { state: "planned" | "wip" | "done"; label: string }[];
  liveUrl?: string;
  playstoreUrl?: string;
  heroVideo?: string;
  heroPoster?: string;
};

export const projects: Project[] = [
  {
    slug: "jarvis",
    name: "Jarvis",
    year: "2025—",
    role: "solo · everything",
    blurb: "voice-first personal assistant for the desktop",
    tagline: "Talk to your laptop like a person. Jarvis listens, talks back, and actually does things — opens apps, runs commands, manages files, pulls context from across your system. Not a chat box, an operator.",
    stack: ["TypeScript", "OpenAI Realtime", "Vosk", "Tauri", "Linux daemon", "RAG (WIP)"],
    tags: ["ai", "voice", "infra"],
    status: "active",
    problem:
      "Most voice assistants are either trapped in the cloud, locked to one company's apps, or just fancy search bars. I wanted one that runs on my own laptop, remembers what we talked about last week, and actually does things — not just answers them.",
    why:
      "Most assistant moments are tiny — open a file, mute a tab, ask the time. Reaching for the keyboard for those is a small pain that adds up. Nothing outside Apple's walled garden really nailed it for Linux, so I built my own.",
    architecture:
      "The window you see is just a face. The real work happens in a small program running in the background. Keyboard shortcuts, the command line, and future agents all talk to it through one shared connection. That program handles the microphone, calls the AI, runs commands on the computer, and writes every chat into a tiny local database so it can look things up later.",
    architectureMap: `┌─────────┐                          ┌────────────────────┐
│   UI    │ ◄────── speaks to ─────► │  background brain  │
│ window  │                          │    (the daemon)    │
└─────────┘                          └──────────┬─────────┘
                                                │
              ┌─────────────────┬───────────────┴──────────────┐
              ▼                 ▼                              ▼
       ┌────────────┐    ┌────────────┐               ┌────────────┐
       │ wake-word  │    │   ai       │               │  actions   │
       │  listens   │───►│  thinks    │───►           │  on your   │
       │  ~80ms     │    │ (gpt-4o)   │               │  computer  │
       └────────────┘    └──────┬─────┘               └────────────┘
                                │
                                ▼
                         ┌────────────────┐
                         │   memory       │
                         │  past chats    │
                         └────────────────┘`,
    challenge:
      "Interruptions. If you start talking while Jarvis is mid-sentence, two things have to stop right away — the voice playing back and the AI still generating it — and the mic has to catch your next word without missing a beat. Getting that smooth took three rewrites.",
    challengeStats: [
      { k: "wake-up speed", v: "~80ms" },
      { k: "ai response", v: "200–600ms" },
      { k: "stop-talk window", v: "<50ms" },
      { k: "audio rewrites", v: "3" },
    ],
    tradeoffs: [
      "Speed vs smarts · a fully offline model would work without internet but be dumber. Cloud feels snappy and sharp, but dies without WiFi.",
      "Background-first design · keyboard shortcuts and command-line tricks come for free, but the window has to keep asking the background brain what changed.",
      "A memory that remembers is great until it remembers wrong. Old facts can leak into new answers — softened by aging them out, never fully solved.",
    ],
    scale:
      "Just me, on one laptop. Both costs and storage grow at a steady, predictable rate as I use it more — no hidden cliff waiting.",
    scaleStats: [
      { k: "cost while talking", v: "$0.20/hr" },
      { k: "memory size", v: "30 MB / 1k hr" },
      { k: "my daily use", v: "~40 asks" },
      { k: "users supported", v: "1" },
    ],
    future:
      "True offline mode so it works without internet. Screen vision so 'what's on my screen?' is literal, not a metaphor. Multiple users — knows who's talking and pulls their memory.",
    futureMilestones: [
      { state: "wip", label: "long-term memory · remembers past chats" },
      { state: "planned", label: "offline mode · works without internet" },
      { state: "planned", label: "screen vision · sees what you see" },
      { state: "planned", label: "multi-user · knows who's talking" },
    ],
    decisions: [
      {
        title: "Local ears, cloud brain",
        body: "A small offline model listens for the wake word (\"hey jarvis\") because that has to be instant. Once it triggers, the heavier thinking goes to the cloud where the smarter model lives. Best of both — no lag when summoning it, real intelligence when answering.",
      },
      {
        title: "It actually remembers",
        body: "Every conversation gets broken into small chunks and saved on the laptop in a way it can search later. So next Tuesday it can recall what we discussed today. This was the missing piece in every other assistant I tried — they're all goldfish.",
      },
      {
        title: "Background-first, window second",
        body: "Jarvis runs as a small program in the background. The window you see is just one way to talk to it. That means keyboard shortcuts, the command line, and future agents can all reach the same brain.",
      },
    ],
    outcome:
      "I've used it every day since week one. About 40 voice commands a day, mostly small ones. The next big step is long-term memory — once that lands, it stops being fancy speech-to-text and starts being a real second brain.",
    repo: "https://github.com/SamarS1ngh",
    heroVideo: "/reels/jarvis.mp4",
    heroPoster: "/reels/jarvis.jpg",
  },
  {
    slug: "nocap",
    name: "nocap",
    year: "2026",
    role: "solo · android + ml",
    blurb: "ruthless notification filter",
    tagline: "An app that uses AI to filter your phone notifications. Every swipe — accept or dismiss — teaches it what matters to you, so it gets sharper with each use.",
    stack: ["Kotlin", "Jetpack Compose", "NotificationListenerService", "Gemini Flash", "Room"],
    tags: ["mobile", "ai"],
    status: "shipping",
    problem:
      "Modern phones surface every Slack ping, every promo email, every group-chat reaction as if they were peer events. The default notification model is broken — and 'do not disturb' is a sledgehammer.",
    why:
      "I'd open my phone to a wall of 47 notifications and miss the one from my landlord because it sat under a Discord raid ping. The phone vendors won't fix this because engagement metrics reward noise. Someone had to build the opt-out.",
    architecture:
      "NotificationListenerService captures every system notification → enrichment step pulls icon, package, prior swipe history → a small TFLite classifier handles the obvious cases on-device → ambiguous ones get queued in a batched call to Gemini Flash → bucket routing rules apply → Room persists everything, Compose renders a bucketed inbox separate from the system shade. Every accept/dismiss swipe writes a feedback row that drives a nightly fine-tune.",
    challenge:
      "Latency budget. NotificationListenerService fires on the main loop — anything that touches the network has to be fast or the OS kills the service. Round-tripping every notification to Gemini would tank battery and blow the 5-second budget. Solution: local classifier first, Gemini only for the ~10% ambiguous tail, batched in 800ms windows.",
    tradeoffs: [
      "local model is cheaper and instant but caps at ~87% accuracy on edge cases vs Gemini's ~96%. Acceptable since we collapse, never delete.",
      "Android only · Apple does not expose system-wide notification interception. Half the audience, gone.",
      "we can't actually drop a notification post-firing — Android only lets you mute/group. So we display a separate inbox UI rather than hiding the system shade.",
    ],
    scale:
      "Per-user model lives on-device, ~3MB. Gemini Flash calls capped at ~50/day per active user. Cost per user under $0.20/mo at current pricing. If usage 10×s, the batching window widens — latency stays tolerable because non-urgent buckets don't care about a 2s delay.",
    future:
      "Cross-device sync so 'urgent' on phone matches desktop. User-supplied few-shot examples in plain language ('treat anything from Mom as urgent'). Calendar-aware rules — auto-mute group chats during meetings.",
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
    repo: "https://github.com/SamarS1ngh",
    heroVideo: "/reels/nocap.mp4",
    heroPoster: "/reels/nocap.jpg",
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
    why:
      "I watched a 12-person company spend $4k/mo on overlapping SaaS just to function. The integration tax was invisible but real — every tool had its own user table, its own RBAC model, its own half-broken audit log. An open-core kit that ships those primitives once cuts the bill and removes the seams.",
    architecture:
      "Four standalone repos, each independently deployable. SSO module owns the JWT issuer and JWKS endpoint. Org module owns user/team/role tables and exposes a tRPC API everyone else calls. PM and Ledger are stateless consumers — they trust SSO-signed JWTs and ask Org for permission checks. Postgres per module, no cross-module joins. Drizzle schema lives in a shared internal package so types flow end-to-end.",
    challenge:
      "Keeping the modules independent enough to self-host one but coupled enough that identity and permissions are actually shared instead of re-implemented per app. The right shape took three attempts — I tried a shared monolith DB (too coupled), then per-module event bus (too async), and landed on tRPC gateway calls with short-lived JWTs (sync where it matters, decoupled where it doesn't).",
    tradeoffs: [
      "monorepo dx vs multi-repo deploy autonomy · went multi-repo. Customers can deploy just Ledger if that's all they need. Cost: duplicated CI config across four repos.",
      "tRPC end-to-end types vs language portability · pinned to TypeScript. Future Go/Python clients would have to hand-write request shapes.",
      "open-core means feature-gating. Kept that surface tiny on purpose (audit log retention, SSO enterprise connectors) so OSS users get a real product.",
    ],
    scale:
      "Each module sits comfortably at 10k MAU on a $20 box. Postgres is the first wall — connection pooling via pgBouncer landed after teacher-pau hit it first. Audit tables partitioned monthly. Cross-module reads cached at the gateway with 60s TTL since RBAC rarely changes between requests.",
    future:
      "Workflow module (the Notion-ish doc-and-task one). Mobile shell on React Native sharing the tRPC client. Self-hosted control plane so customers can deploy and upgrade individual modules from a single dashboard without leaving their VPC.",
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
    liveUrl: "https://organization.easyenterpriseos.com",
    heroVideo: "/reels/eeo.mp4",
    heroPoster: "/reels/eeo.jpg",
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
    why:
      "The client was duct-taping Calendly + Zoom + Excalidraw + Stripe and bleeding from the joints: booking conflicts, four logins per teacher, recordings vanishing into the wrong Google Drive folder. The fix wasn't a better integration — it was one product where bookings, video, whiteboard, and payments share a single source of truth.",
    architecture:
      "Next.js 14 (App Router) on Vercel. Neon Postgres + Drizzle for schema/migrations. S3 for recordings with signed URLs for playback. Daily.co for video — webhooks fire on recording-finished and flip a row's status. Excalidraw mounted in an iframe with a thin postMessage bridge for collaborative drawing. Custom JWT auth keyed off a `users` table we own.",
    challenge:
      "Teacher-availability bursts. When a popular teacher's calendar opens, hundreds of students hit the booking endpoint inside one second. Supabase's pooler collapsed under that pattern — connection exhaustion within 200ms. Migration to raw Neon TCP + pg-pool + optimistic-lock booking with retry brought throughput up ~8× and made the bookings transactionally honest.",
    tradeoffs: [
      "Daily.co over Jitsi/LiveKit · paid SaaS, but the recording API alone saved weeks. Right buy-vs-build call.",
      "Excalidraw as whiteboard · open-source, mature, but no native server-side persistence. Wrote a small CRDT layer for shared state.",
      "custom JWT auth post-Supabase migration · more code we own, less vendor lock-in, but now we're on the hook for token rotation and revocation.",
    ],
    scale:
      "Peak so far: ~600 concurrent classes. Bottleneck is Daily.co seats, not our backend. Neon scales to demand; query plans audited for N+1s during a load test. S3 lifecycle rules archive recordings older than 90 days to Glacier to keep storage cost flat.",
    future:
      "Mobile apps via React Native (whiteboard needs a rewrite — Excalidraw doesn't render natively). Async-recording transcription so students can search 'logarithms' across every past class. AI-generated session summaries posted to the parent dashboard after class.",
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
    heroVideo: "/reels/teacher-pau.mp4",
    heroPoster: "/reels/teacher-pau.jpg",
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
    why:
      "Multi-vendor grocery in tier-2 India means three audiences — customers on cheap Android, vendors on browser-only laptops, and ops on whatever's at the warehouse. Different surfaces, different shipping cadences. Cramming them into one repo with one team would have stalled all three. Three surfaces, one product, three repos was the only honest answer.",
    architecture:
      "Customer app: Expo / React Native, talks REST over HTTPS. Vendor dashboard: Next.js on Vercel. Backend: API Gateway → Node Lambdas (TypeScript) → RDS Postgres + S3 for product images. Async order flow goes through SQS so the customer-facing endpoint returns fast and the heavy lifting (inventory check, vendor notify, dispatch routing) happens off the request path. Playwright suite gates every dashboard release.",
    challenge:
      "Cost-per-order. Lambda cold starts were killing p99 during the morning grocery rush. Provisioned concurrency cost more than just renting a long-running box. Solved with regional Lambdas + aggressive SQS prefetch keeping functions warm, plus connection re-use to RDS via RDS Proxy. p99 dropped from 2.1s to 380ms and the bill stayed under $80/mo at launch volumes.",
    tradeoffs: [
      "serverless backend matches usage but cold starts hurt · accepted in exchange for paying ₹0 at 3am.",
      "Clerk for auth instead of custom · saved a month of work, costs $20/mo per 1k MAU. Bet that's fine because we don't compete on auth.",
      "three repos meant duplicated CI config, but each surface unblocked independently when ML/ops added a new requirement.",
    ],
    scale:
      "Designed for ~50k orders/day per vendor cluster. Postgres partitioned by vendor_id; warehouses keyed by pincode so geo-lookups are O(1). Hot path is order-create — two reads, one write. Nightly Lambdas roll up aggregations for the vendor dashboard so live reads don't have to touch history.",
    future:
      "Real-time order tracking via WebSockets through API Gateway (currently polled — fine but ugly). ML demand-forecasting per vendor so the dashboard suggests reorder quantities. Cold paths (admin tooling, monthly reports) migrating off Lambda to a long-running Fargate for cost.",
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
    heroVideo: "/reels/onecart.mp4",
    heroPoster: "/reels/onecart.jpg",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
