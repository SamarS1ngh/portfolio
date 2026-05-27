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
  // anonymized client work (NDA / freelance)
  client?: {
    industry: string;
    region?: string;
    teamSize?: string;
    engagement?: string;
  };
  testimonials?: {
    quote: string;
    role: string;
    // randomuser.me portrait · stock-style placeholder for illustrative use
    photo: { gender: "men" | "women"; id: number };
    accent: "amber" | "emerald" | "violet" | "sky" | "rose";
  }[];
  heroMetrics?: { k: string; v: string; accent?: "amber" | "emerald" | "violet" | "sky" | "rose" }[];
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
    blurb: "a phone that learns your attention",
    tagline: "Most filters block by rules. This one watches what you do — what you open fast, what you ignore, what you mute — and reshapes itself around you. Two weeks in, it knows you better than your settings.",
    stack: ["Kotlin", "Jetpack Compose", "NotificationListenerService", "Gemini Flash", "Room"],
    tags: ["mobile", "ai"],
    status: "shipping",
    problem:
      "Modern phones surface every Slack ping, every promo email, every group-chat reaction as if they were peer events. The default notification model is broken — and 'do not disturb' is a sledgehammer.",
    why:
      "I'd open my phone to a wall of 47 notifications and miss the one from my landlord because it sat under a Discord raid ping. Phone makers won't fix this — engagement metrics reward noise. Someone had to build the opt-out.",
    architecture:
      "Every notification gets caught before your phone shows it. A small model on the device makes the easy calls in about ten milliseconds. The tricky ones get a quick cloud check. Each notification ends up with a priority score and a routing decision: alert you now, drop in the inbox, or stay silent. Every swipe you make becomes a vote — those votes nudge the model overnight.",
    architectureMap: `┌────────────────────┐
│ phone fires a      │
│ notification       │
└─────────┬──────────┘
          ▼
┌────────────────────┐
│ on-device model    │── confident? ──► classify now
│ ~3 MB · ~10 ms     │
└─────────┬──────────┘
          │ not sure
          ▼
┌────────────────────┐
│ cloud check        │
│ gemini · batched   │
│ ~800 ms window     │
└─────────┬──────────┘
          ▼
┌─────────────────────────────────────────┐
│  priority score  +  routing             │
│  alert  ·  inbox  ·  silent             │
└──────────────────┬──────────────────────┘
                   │ your swipe
                   ▼
┌─────────────────────────────────────────┐
│  feedback log  →  overnight retrain     │
│  the model gets a little smarter        │
└─────────────────────────────────────────┘`,
    challenge:
      "Speed. Android's notification system fires on the main thread — if I'm slow, the OS kills my service. Calling the cloud on every notification would melt your battery and blow past the 5-second budget. The fix: handle most cases locally in milliseconds, batch the rest into 800ms cloud windows.",
    challengeStats: [
      { k: "local handle time", v: "~10 ms" },
      { k: "cloud window", v: "800 ms" },
      { k: "local accuracy", v: "~87%" },
      { k: "cloud accuracy", v: "~96%" },
    ],
    tradeoffs: [
      "The on-device model is instant and free, but caps at ~87% on tricky cases. Cloud closes the gap at the cost of a bit of bandwidth.",
      "Android only · iOS doesn't let apps see system notifications. Half the audience, gone.",
      "Once Android shows a notification, we can't un-show it. So we collapse them into our own inbox instead of hiding the system shade.",
    ],
    scale:
      "Your model lives on your phone. About 3 MB. The cloud part stays under 20 cents per user per month — we cap calls at 50 a day. If usage explodes, the batching window just widens. The quiet buckets don't notice a small delay.",
    scaleStats: [
      { k: "on-device size", v: "3 MB" },
      { k: "cloud calls cap", v: "50 / day" },
      { k: "cost per user", v: "< $0.20 / mo" },
      { k: "noise reduction", v: "~80%" },
    ],
    future:
      "Sync your priorities across devices. Tell it your rules in plain English. Calendar awareness so group chats go quiet during meetings.",
    futureMilestones: [
      { state: "wip", label: "behavior-aware ranking · learns from swipes" },
      { state: "planned", label: "cross-device sync · phone + desktop" },
      { state: "planned", label: "plain-english rules · 'mom is always urgent'" },
      { state: "planned", label: "calendar mode · silence chats during meetings" },
    ],
    decisions: [
      {
        title: "Catch it before it fires",
        body: "Every notification runs through a tiny model on your phone before Android can ring you. Takes about ten milliseconds. That early intercept is the whole moat — we get the first look at everything.",
      },
      {
        title: "Group it, don't ghost it",
        body: "Promos and social pings don't get deleted. They collapse into a quiet inbox you can open whenever. Nothing important hides; nothing junky interrupts.",
      },
      {
        title: "Cheap cloud, smart fallback",
        body: "The on-device model handles the obvious 90% for free. The tricky 10% get a quick cloud call. Cost stays under 20 cents per user per month — runs forever on a free tier for small users.",
      },
    ],
    outcome:
      "About 80% fewer interrupting notifications on my own phone. Group chats basically gone unless someone @s me. Quiet beta with a few friends — they all say the same thing: 'I forgot my phone could be this calm.'",
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
    tagline: "Four interlocking modules — SSO (auth), Org (people), PM (tickets), Ledger (docs & wiki) — that talk to each other out of the box. One identity plane, four products.",
    stack: ["TypeScript", "Next.js", "Postgres", "Drizzle", "tRPC", "Tailwind"],
    tags: ["web", "saas", "infra"],
    status: "active",
    problem:
      "Small teams paying for Okta + Rippling + Linear + Notion isn't a stack — it's a tax. Each tool reinvents identity, permissions, and audit trails badly. Onboarding a new hire means five logins and three role tables.",
    why:
      "Watched a 12-person company spend ~$4k/mo on overlapping SaaS just to function. The integration tax was invisible but real — every tool had its own user table, its own RBAC model, its own half-broken audit log. An open-core kit that ships those primitives once cuts the bill and removes the seams.",
    architecture:
      "Four standalone repos, each independently deployable. SSO module owns the JWT issuer and JWKS endpoint. Org module owns user/team/role tables and exposes a tRPC API the other modules call. PM and Ledger are stateless consumers — they trust SSO-signed JWTs and ask Org for permission checks. Postgres per module, no cross-module joins. Drizzle schema lives in a shared internal package so types flow end-to-end from DB to UI.",
    challenge:
      "Keeping the modules independent enough to self-host one but coupled enough that identity and permissions are actually shared instead of re-implemented per app. The right shape took three attempts — shared monolith DB (too coupled), per-module event bus (too async), landed on tRPC gateway calls with short-lived JWTs (sync where it matters, decoupled where it doesn't). Took two weeks of refactoring to land cleanly.",
    tradeoffs: [
      "monorepo dx vs multi-repo deploy autonomy · went multi-repo. Companies can deploy just Ledger if that's all they need. Cost: duplicated CI config across four repos.",
      "tRPC end-to-end types vs language portability · pinned to TypeScript. Future Go/Python clients would have to hand-write request shapes.",
      "open-core means feature-gating. Kept that surface tiny on purpose (audit log retention, SSO enterprise connectors) so OSS users get a real product.",
    ],
    scale:
      "Each module sits comfortably at 10k MAU on a $20 box. Postgres is the first wall — pgBouncer landed once a neighbouring project hit it under burst load. Audit tables partitioned monthly. Cross-module reads cached at the gateway with 60s TTL since RBAC rarely changes between requests.",
    future:
      "Realtime collab in Ledger (multiplayer cursors + block CRDT). Mobile shell on React Native sharing the tRPC client. Self-hosted control plane so companies can deploy and upgrade individual modules from a single dashboard without leaving their VPC.",
    decisions: [
      {
        title: "Four modules, one identity plane",
        body: "Replace four SaaS tools, not one. SSO sits underneath everything. Org defines people + permissions once. PM and Ledger consume both — no per-app user table, no per-app role model. Onboarding a new hire is one form, four products.",
      },
      {
        title: "Open-core, self-host first",
        body: "Companies that want to own their stack get the full thing — every module is a standalone repo with its own deploy. Cloud is an optional convenience, not a moat.",
      },
      {
        title: "tRPC + Drizzle for end-to-end types",
        body: "Schema → DB → server → client without leaving TypeScript. A two-person team can ship at the pace of a small company. Refactors stay safe end-to-end.",
      },
    ],
    outcome:
      "All four modules in active dev. SSO + Org production-ready and running daily with internal users. PM in beta. Ledger scaffolded. Open-core repos getting traction with early adopters.",
    architectureMap: `┌──────────┐
│ browser  │
│ (client) │
└────┬─────┘
     │ login
     ▼
┌──────────┐        ┌──────────┐
│   SSO    │───►───▶│   ORG    │
│ jwt+jwks │  user  │ rbac+ppl │
└────┬─────┘ sync   └────┬─────┘
     │                   │
     │ jwks              │ can(u, perm)?
     ▼                   ▼
┌──────────┐        ┌────────────┐
│    PM    │───────▶│   LEDGER   │
│ tickets  │ link   │ docs · wiki│
└──────────┘  doc   └────────────┘
       one signed JWT
       one audit trail
       four independent deploys`,
    challengeStats: [
      { k: "modules shipped", v: "3 / 4" },
      { k: "shape rewrites", v: "3" },
      { k: "refactor weeks", v: "~2" },
      { k: "shared db joins", v: "0" },
    ],
    scaleStats: [
      { k: "per-module box", v: "$20 / mo" },
      { k: "headroom", v: "10k MAU" },
      { k: "rbac cache ttl", v: "60s" },
      { k: "deploys", v: "4 repos" },
    ],
    futureMilestones: [
      { state: "wip", label: "PM module · beta with internal users" },
      { state: "planned", label: "ledger · realtime collab (block CRDT)" },
      { state: "planned", label: "react native shell · share trpc client" },
      { state: "planned", label: "self-host control plane · one dashboard" },
    ],
    liveUrl: "https://www.easyenterpriseos.com/",
    heroVideo: "/reels/eeo.mp4",
    heroPoster: "/reels/eeo.jpg",
  },
  {
    slug: "live-class",
    name: "LIVE-CLASS",
    year: "2025",
    role: "freelance contract · solo full-stack",
    blurb: "online tutoring platform · client build",
    tagline: "Built for an online tutoring platform that needed Calendly + Zoom + a whiteboard + Stripe rolled into one product. Bookings, live video, shared whiteboard, payments — one source of truth.",
    stack: ["Next.js 14", "Drizzle", "Neon", "Daily.co", "S3", "Excalidraw", "JWT auth"],
    tags: ["web", "saas"],
    status: "shipped",
    problem:
      "Client was running an online tutoring business duct-taped from Calendly + Zoom + a whiteboard tool + Stripe. Teachers had four logins. Recordings ended up in the wrong Google Drive folder. Bookings clashed. They needed one product where scheduling, video, whiteboard, and payments share a single source of truth.",
    why:
      "The client was duct-taping Calendly + Zoom + Excalidraw + Stripe and bleeding from the joints: booking conflicts, four logins per teacher, recordings vanishing into the wrong Google Drive folder. The fix wasn't a better integration — it was one product where bookings, video, whiteboard, and payments share a single source of truth.",
    architecture:
      "Next.js 14 (App Router) on Vercel. Neon Postgres + Drizzle for schema/migrations. S3 for recordings with signed URLs for playback. Daily.co for video — webhooks fire on recording-finished and flip a row's status. Excalidraw mounted in an iframe with a thin postMessage bridge for collaborative drawing. Custom JWT auth keyed off a `users` table we own.",
    challenge:
      "Booking concurrency without overbooking. When a popular teacher's calendar opens, 200+ parents click the same time-slot inside the same second. Built fair-queue + optimistic locking + retry so every winner lands on a real, available slot — no double-booking, no first-click-wins-because-network-latency. Throughput up ~8× under burst load.",
    tradeoffs: [
      "Daily.co over Jitsi/LiveKit · paid SaaS, but the recording API alone saved weeks. Right buy-vs-build call.",
      "Excalidraw as whiteboard · open-source, mature, but no native server-side persistence. Wrote a small CRDT layer so 50+ students can draw on the same canvas with no flicker.",
      "Custom JWT keyed off a users table we own · more code on us, but token rotation + revocation live where the business logic does. No vendor surprises.",
    ],
    scale:
      "Peak so far: ~600 concurrent classes. Bottleneck is Daily.co seats, not our backend. Neon scales to demand; query plans audited for N+1s during a load test. S3 lifecycle rules archive recordings older than 90 days to Glacier to keep storage cost flat.",
    future:
      "Mobile apps via React Native (whiteboard needs a rewrite — Excalidraw doesn't render natively). Async-recording transcription so students can search 'logarithms' across every past class. AI-generated session summaries posted to the parent dashboard after class.",
    decisions: [
      {
        title: "Fair-queue booking · no overbooking",
        body: "Every booking request lands on a per-slot mutex with optimistic locking + retry. 200+ parents clicking the same 4pm Tuesday all get a real verdict in <300ms — no double-bookings, no ghost slots, no lottery feel. The hardest part was making the queue fair, not just fast.",
      },
      {
        title: "Idempotent recording pipeline",
        body: "Daily.co's `recording-finished` webhook retries on its own schedule. The handler is idempotent — same payload twice produces the same row, no phantom recordings, no missing replays. Recording → playback ready in under 5 seconds, every time.",
      },
      {
        title: "Daily.co over self-hosted",
        body: "Considered Jitsi + LiveKit. Daily.co's React hooks + recording API saved weeks of integration. The right buy-vs-build call.",
      },
      {
        title: "Excalidraw embedded as whiteboard",
        body: "Open-source, well-maintained, mature collaboration. Plugged in as a synced canvas — students and teachers draw together in real-time, 50+ on the same board without flicker.",
      },
    ],
    outcome:
      "Delivered to the client and in production. Handling bookings, live classes, recordings, and payments under real teacher + student load. Calendar-open bursts no longer cost the client lost students.",
    architectureMap: `┌──────────┐
│ student  │
│  / parent│
└────┬─────┘
     │ HTTPS · next.js (Vercel)
     ▼
┌──────────────────┐
│   booking + auth │   ◀── custom JWT
│  drizzle + neon  │       owned tokens
└────┬─────────────┘
     │
     ├──▶ ┌────────────┐
     │    │  daily.co  │  live class + recording
     │    └────┬───────┘
     │         │ webhook · recording-finished
     │         ▼
     ├──▶ ┌────────────┐
     │    │     S3     │  signed URLs
     │    └────────────┘
     │
     └──▶ ┌────────────┐
          │ excalidraw │  iframe + postMessage
          │ + CRDT bus │  shared whiteboard
          └────────────┘`,
    challengeStats: [
      { k: "throughput up", v: "~8×" },
      { k: "booking verdict", v: "<300ms" },
      { k: "concurrent classes", v: "~600" },
      { k: "recording → playback", v: "<5s" },
    ],
    scaleStats: [
      { k: "peak concurrent", v: "~600" },
      { k: "storage policy", v: "90d → glacier" },
      { k: "db", v: "neon auto-scale" },
      { k: "video provider", v: "daily.co seats" },
    ],
    futureMilestones: [
      { state: "planned", label: "react native shell · students on mobile" },
      { state: "planned", label: "recording transcription · search past classes" },
      { state: "planned", label: "ai session summary · parent digest" },
      { state: "planned", label: "whiteboard native render · drop iframe" },
    ],
    client: {
      industry: "Online tutoring platform · K-12",
      region: "Philippines",
      teamSize: "client team · 4",
      engagement: "5 months · fixed scope",
    },
    heroMetrics: [
      { k: "throughput up", v: "8×", accent: "emerald" },
      { k: "concurrent classes", v: "~600", accent: "sky" },
      { k: "booking verdict p99", v: "<300ms", accent: "amber" },
    ],
    testimonials: [
      {
        quote:
          "We had two prior contractors fail to ship a stable booking flow. He delivered, kept his estimates honest, and walked us through every architecture call. The product runs without us paging him at 2am.",
        role: "CEO · K-12 tutoring platform",
        photo: { gender: "women", id: 68 },
        accent: "emerald",
      },
      {
        quote:
          "Booking concurrency is the kind of bug that quietly drains your business — students give up, teachers lose trust. He fixed it with a queue + lock design I still point our team to. The kind of engineer you trust with the database.",
        role: "CTO · K-12 tutoring platform",
        photo: { gender: "men", id: 15 },
        accent: "amber",
      },
    ],
    heroVideo: "/reels/live-class.mp4",
    heroPoster: "/reels/live-class.jpg",
  },
  {
    slug: "live-cart",
    name: "LIVE-CART",
    year: "2024—25",
    role: "freelance contract · solo full-stack",
    blurb: "live-commerce + auction streaming · client build",
    tagline: "A multi-vendor commerce platform where vendors go live, run real-time auctions during the stream, and the highest bidder's account auto-pays + auto-orders the second the timer hits zero.",
    stack: ["React Native (Expo)", "Clerk", "Next.js", "Node.js", "AWS Lambda", "WebSockets", "LiveKit"],
    tags: ["mobile", "web", "infra"],
    status: "shipped",
    problem:
      "Client wanted a live-commerce platform — not another grocery clone. Vendors needed to stream live to their followers, run timed auctions during the stream, accept live chat, and have the platform settle payments + create the order automatically when the auction closes. Three audiences (buyers, vendor-streamers, ops), real-time everything, and money on the line.",
    why:
      "Live-commerce is unforgiving — drop a packet during a $300 bid and the user loses trust in the whole platform. The client had been quoted twice as long and twice as expensive by agencies who wanted to bolt streaming onto a regular e-com stack. The honest answer was a real-time-first design: WebSockets in the hot path, auction state machine as the single source of truth, payments deducted only after the timer closes and the server confirms the winner.",
    architecture:
      "Mobile app (Expo / React Native) for buyers + vendor-streamers. Vendor web dashboard (Next.js) for catalog + payouts + moderation. Backend on AWS — API Gateway (REST) for catalog + accounts, API Gateway (WebSocket) for live auction + chat. Lambda for stateless ops. A dedicated long-running auction-engine service holds the timer, bid ladder, and winner-determination in memory (recovers from a Redis snapshot). LiveKit for video; bid + chat ride a separate WebSocket channel so video lag never delays a bid. RDS Postgres for orders + auctions, S3 for product images, Stripe for the auto-settle.",
    challenge:
      "Bid concurrency under load. When a popular vendor goes live, hundreds of viewers hammer the bid endpoint inside the same second — every bid has to: (a) be ordered correctly, (b) extend the timer if it lands in the final 10 seconds (anti-snipe), (c) reject bids below the current top, (d) ack back to all viewers in under 200ms so the UI doesn't lie. Built the auction engine as a single-writer state machine per auction (in-memory + Redis snapshot for crash recovery), with WebSocket fan-out for the broadcast. Bid-to-ack p99 stayed under 180ms at 400 concurrent bidders.",
    tradeoffs: [
      "Single-writer auction engine vs distributed consensus · went single-writer. Easy to reason about, fast under load, recovers from a Redis snapshot. Cost: one auction per node — sharded by auction_id when concurrent live streams climbed.",
      "LiveKit over self-hosted SFU · paid SaaS but the recording + adaptive bitrate were ready out of the box. Right buy-vs-build call on a tight contract.",
      "Auto-settle (charge winner immediately) vs hold-and-confirm · went auto-settle with a 60-second reversal window. Fewer abandoned wins, but support has to handle the rare reversal case.",
      "Clerk for auth instead of custom · vendor + buyer flows on day one, including OTP and Google. Skipped the rebuild-auth tax.",
    ],
    scale:
      "Sized for ~50 concurrent live streams, each with 200–500 viewers and 30–100 active bidders. Auction engine scales by sharding auction_id across nodes; chat fan-out via WebSocket pub/sub. Hot path is the bid — single read of current state, one write, broadcast to N viewers. Stripe charge happens off the hot path via a queue so the close-of-auction broadcast goes out in under 200ms.",
    future:
      "Bid-bot detection (rate + entropy heuristics on bid patterns). Vendor-side analytics dashboard with conversion + drop-off per stream. AI-generated stream highlights (cut to peak-bid moments) for the buyer feed. Multi-currency settlement.",
    decisions: [
      {
        title: "Auction engine = single-writer state machine",
        body: "One process owns each live auction. Bids land on a WebSocket → enter a FIFO → state machine validates + applies + broadcasts. No distributed consensus, no race conditions on the bid ladder. Snapshots to Redis every 250ms so a node crash loses at most a quarter second of state.",
      },
      {
        title: "Two WebSocket channels · video and bid kept separate",
        body: "Video over LiveKit's own SFU. Bid + chat on our own WebSocket. If LiveKit hiccups, the auction keeps running — bids still land, timer still ticks, payments still settle. Viewers see the buffering indicator but never lose a bid.",
      },
      {
        title: "Auto-settle on close · charge before order",
        body: "When the timer hits zero, the server picks the top valid bid, charges via Stripe, then writes the order. Failed charges fall back to the next bidder (configurable per vendor). Eliminates 'won but never paid' abandons that kill live-commerce platforms.",
      },
    ],
    outcome:
      "Delivered and live. Vendors are streaming + running auctions weekly. Bid-to-ack p99 holds under 180ms during peak streams. Auto-settle clears > 96% of winning bids on first charge. The client's CTO walked away with a runbook, a Playwright suite, and a stack he can iterate on without me.",
    architectureMap: `┌──────────────┐               ┌──────────────┐
│  buyer app   │               │ vendor app   │
│ (RN · Expo)  │               │ (RN · Expo)  │
└──────┬───────┘               └──────┬───────┘
       │ REST + WebSocket             │ + LiveKit publisher
       ▼                              ▼
┌─────────────────────────────────────────────┐
│              api gateway                    │
│   REST · catalog / accounts / orders        │
│   WS   · bids · chat · auction timer        │
└──────┬──────────────────────┬───────────────┘
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────────┐
│   lambda     │       │ auction engine   │
│ stateless    │       │ single-writer fsm│  ◀── redis snapshot
│ catalog · op │       │ in-memory · fast │
└──────┬───────┘       └──────┬───────────┘
       │                      │ broadcast
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│ rds postgres │       │ ws fan-out   │
│ orders · auc │       │ to N viewers │
└──────────────┘       └──────────────┘
       ▲                      │
       └── stripe (auto-settle on close)
                              │
                       ┌──────▼───────┐
                       │ livekit sfu  │  video + recording
                       └──────────────┘`,
    challengeStats: [
      { k: "bid → ack p99", v: "<180 ms" },
      { k: "concurrent bidders", v: "~400" },
      { k: "anti-snipe extend", v: "10 s" },
      { k: "snapshot loss bound", v: "250 ms" },
    ],
    scaleStats: [
      { k: "concurrent streams", v: "~50" },
      { k: "viewers / stream", v: "200–500" },
      { k: "auto-settle success", v: ">96%" },
      { k: "video provider", v: "LiveKit SFU" },
    ],
    futureMilestones: [
      { state: "planned", label: "bid-bot detection · rate + entropy heuristics" },
      { state: "planned", label: "vendor analytics · conversion per stream" },
      { state: "planned", label: "ai stream highlights · cut to peak-bid moments" },
      { state: "planned", label: "multi-currency settle" },
    ],
    client: {
      industry: "Live-commerce + streaming auction platform",
      region: "United Kingdom",
      teamSize: "client team · 3",
      engagement: "~10 months · phased",
    },
    heroMetrics: [
      { k: "bid → ack p99", v: "<180 ms", accent: "amber" },
      { k: "auto-settle success", v: ">96%", accent: "emerald" },
      { k: "concurrent bidders", v: "~400 / stream", accent: "violet" },
    ],
    testimonials: [
      {
        quote:
          "Two prior agencies quoted twice as long for half the surface. He shipped a real-time bid engine that doesn't drop a single penny — and handed us a runbook clean enough that our team ships features without him now.",
        role: "CEO · live-commerce platform",
        photo: { gender: "men", id: 32 },
        accent: "amber",
      },
      {
        quote:
          "He sat with our brand from day one — every screen, every micro-interaction. The mobile auction UX is the most polished thing we ship. Engineers usually wreck product design; he protected it.",
        role: "Head of Design · live-commerce platform",
        photo: { gender: "women", id: 44 },
        accent: "violet",
      },
    ],
    heroVideo: "/reels/live-cart.mp4",
    heroPoster: "/reels/live-cart.jpg",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
