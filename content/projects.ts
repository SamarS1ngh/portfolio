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
    // client is named publicly (live site linked) — dossier drops the "anonymized" stamp
    named?: boolean;
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
  // overrides for the live CTA banner (see LiveShowcase) — omit for apps with a public /demo
  liveCta?: { badge?: string; title?: string; body?: string; button?: string; path?: string };
  playstoreUrl?: string;
  heroVideo?: string;
  heroPoster?: string;
  // real product screenshots — rendered as a gallery on the brief page
  shots?: { src: string; label: string }[];
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
};

export const projects: Project[] = [
  {
    slug: "notchfy",
    name: "Notchfy",
    year: "2026—",
    role: "solo · macOS · product + business",
    blurb: "the MacBook notch, turned into a dashboard",
    tagline: "The notch is a chunk of dead screen you look at all day. Notchfy turns it into a live control center — hover over it and 24 modules drop down: clipboard, file shelf, timers, Stripe revenue, Claude Code usage, now playing, and MacMate, an AI that answers how-do-I-do-this-on-a-Mac questions. A native Swift app I built, signed, and sell myself.",
    stack: ["Swift", "SwiftUI", "AppKit", "Apple Foundation Models", "Sparkle", "Lemon Squeezy", "Vercel"],
    tags: ["saas", "ai"],
    status: "shipping",
    problem:
      "Half the things I check all day — the time, what's playing, how much a deploy cost, whether a sale came in, where that file I just downloaded went — each live in a different app. Every check is a context switch: Cmd-Tab, find the window, look, come back. Meanwhile every notched MacBook has a black strip at the top of the screen that does nothing at all.",
    why:
      "I wanted the glance without the switch: move the mouse up, see it, move away, it's gone. And I wanted to know what it takes to ship a real paid desktop product end to end — not just the app, but the signing, the licensing, the update channel, the store page, the refund policy. Notchfy is both.",
    architecture:
      "A borderless, transparent window sits exactly over the notch and stays on top of everything. A small core module (plain Swift, unit-tested) works out the notch's real size from the screen's safe-area insets — or draws a fake notch on Macs that don't have one — and a hover state machine decides when to open and close. Each feature is its own self-contained module behind a common descriptor, so modules can be toggled, reordered, and themed independently. Everything runs on the Mac: API keys live in the Keychain, data stays local, and the only network calls are the ones a user turns on. Around the app sits the business layer: a Lemon Squeezy license gate, Developer ID signing and Apple notarization, Sparkle for over-the-air updates, and a static marketing site on Vercel that hosts the update feed.",
    architectureMap: `           mouse moves to the top of the screen
                         │
                         ▼
          ┌──────────────────────────────┐
          │  notch engine (core, tested) │
          │  geometry · hover state      │
          │  real notch or simulated     │
          └──────────────┬───────────────┘
                         │ expand
                         ▼
   ┌────────────────────────────────────────────────┐
   │  floating panel · 24 modules · 6 themes        │
   │  home · clipboard · shelf · captures · timers  │
   │  revenue · analytics · claude usage · weather  │
   │  now playing · ambience · MacMate AI · …       │
   └───────┬──────────────────┬─────────────────────┘
           │                  │
   live activities      notification mirror
   volume · brightness  other apps' alerts,
   battery · bluetooth  shown in the notch

   ── business layer ──────────────────────────────
   license gate (Lemon Squeezy) · notarized build
   Sparkle OTA updates · notchfy.com on Vercel`,
    challenge:
      "Making a window that has no business existing behave like part of the OS. The notch panel has no title bar, no safe area, and resizes itself constantly — and on macOS 26/27 that combination made SwiftUI and AppKit fight. SwiftUI kept re-calculating safe-area insets that didn't exist, AppKit kept re-running layout, and the app crashed with 'more Update Constraints passes than there are views'. The fix was to stop letting the frameworks guess: pin the insets to zero and drive the window size by hand. Drag-and-drop had the same shape of bug — dragging a file over the notch expands it, the expansion moves the view under the cursor, which fires more enter/exit events, which expands it again. One expand per drag session broke the loop. The theme across all of it: a notch app lives in the gaps the OS was never designed for, so every assumption the frameworks make has to be checked.",
    challengeStats: [
      { k: "modules", v: "24" },
      { k: "themes", v: "6" },
      { k: "commits", v: "460+" },
      { k: "first commit → launch", v: "~2.5 weeks" },
    ],
    tradeoffs: [
      "Direct sale over the Mac App Store · the App Store sandbox would kill the clipboard history, notification mirroring, and system stats — the features that make it worth paying for. Cost: I own everything Apple would have handled — signing, notarization, licensing, updates, and payments.",
      "One-time price over a subscription · $5 for the first 100 buyers, then $12, once. A notch utility doesn't feel like a monthly bill, and 'no subscription' is a selling point. Cost: no recurring revenue; growth has to come from new buyers.",
      "Private macOS APIs where public ones don't exist · now-playing info, display brightness, and the Notification Center database have no public API. Using them makes the features possible. Cost: they're undocumented and can break on any macOS update, so each is built best-effort and fails quietly.",
      "On-device AI first, your own key second · MacMate uses Apple's on-device model when the Mac supports it — free and private. Otherwise it uses the buyer's own Claude, OpenAI, Gemini, or Grok key. Cost: I can't promise one answer quality, but I never pay per question and never see a user's data.",
    ],
    scale:
      "Scale here is per-Mac, not per-server — the work is keeping a background app light enough to forget about. The Claude Code usage reader caches each session log by path, modified time, and size, so it only re-reads the files that changed. Volume and brightness changes are coalesced so dragging a slider gives one banner, not fifty. Polling runs at low priority off the main thread, and the app opts out of App Nap so its timers stay on time while it sits in the background. There's no backend: the only server is a static site.",
    scaleStats: [
      { k: "backend", v: "none" },
      { k: "telemetry", v: "zero" },
      { k: "Swift", v: "~14.7k lines" },
      { k: "macOS", v: "14+ · Apple silicon + Intel" },
    ],
    future:
      "First paying customers, then let their feedback pick the next modules. Wider testing across Mac models and external monitors, where notch geometry gets messy. And keeping the private-API features alive through each new macOS release.",
    futureMilestones: [
      { state: "done", label: "notch engine · real + simulated notch, hover state machine" },
      { state: "done", label: "24 modules · 6 themes · MacMate AI" },
      { state: "done", label: "license gate · notarized build · Sparkle OTA updates" },
      { state: "done", label: "notchfy.com live · Lemon Squeezy checkout" },
      { state: "wip", label: "launch · first 100 buyers at $5" },
      { state: "planned", label: "next modules from customer feedback" },
    ],
    decisions: [
      {
        title: "Test the engine without the UI",
        body: "Notch geometry and hover logic live in a separate Swift package with no AppKit in it: given screen measurements, where is the notch; given mouse events, should it be open. That's the part every other feature depends on, so it's the part with unit tests — and the app's UI layer just feeds it real mouse movement.",
      },
      {
        title: "The license works offline",
        body: "A buyer enters their Lemon Squeezy key once and it's bound to that Mac. After that the app trusts the stored key and re-checks it online in the background — and only locks itself if the server actually answers 'invalid'. A flaky connection never locks out someone who paid. No store secret ships in the app; the license endpoints only need the key itself.",
      },
      {
        title: "Mirror notifications without stealing focus",
        body: "Other apps' notifications are read from macOS's own notification database and shown in the notch — except when you're already in the app that sent them. Browsers are the exception to the exception: a WhatsApp Web alert comes from a website, not from Chrome, so it still shows while Chrome is in front.",
      },
      {
        title: "Ship the business, not just the binary",
        body: "Paid desktop software needs more than code: a Developer ID certificate, Apple notarization, signed over-the-air updates so buyers aren't stuck on v1, a license system, a checkout, privacy and refund pages. Building all of it myself was the point — the release script goes build → notarize → staple → sign the update → publish the feed in one command.",
      },
    ],
    outcome:
      "Live at notchfy.com with Lemon Squeezy checkout: $5 for the first 100 buyers, then $12, one-time. Version 1.1 ships signed, notarized, licensed, and updates itself over the air. Built solo — app, engine, 24 modules, licensing, release pipeline, and the marketing site — in about two and a half weeks from first commit to launch. Honest status: just launched, no sales numbers to show yet.",
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
    liveUrl: "https://www.notchfy.com/",
    liveCta: {
      badge: "live · on sale",
      title: "Visit notchfy.com",
      body: "The real store page: every module, every theme, and the checkout. $5 for the first 100 buyers, then $12. One-time, no subscription.",
      button: "open notchfy.com",
      path: "",
    },
  },
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
    repo: "https://github.com/SamarS1ngh",
    heroVideo: "/reels/nocap.mp4",
    heroPoster: "/reels/nocap.jpg",
  },
  {
    slug: "flowstate",
    name: "flowstate",
    year: "2026—",
    role: "solo · android · on-device ML",
    blurb: "a music app that listens to the music",
    tagline: "Every streaming app picks your next song by watching what people click. None of them have heard the song. flowstate runs a small neural network on the phone that listens to the actual audio — so the queue matches how things sound, not what an algorithm thinks you'll tap.",
    stack: ["React Native", "TypeScript", "Kotlin", "ExoPlayer", "MusiCNN", "SQLite", "OkHttp"],
    tags: ["mobile", "ai"],
    status: "active",
    problem:
      "\"Smart\" shuffle isn't smart, it's social. YouTube Music's improved recommendations and Spotify's Smart Shuffle both work the same way underneath — people who liked this also liked that, weighted by skips, trending, and whatever the platform is being paid to push. It has never heard a single one of these songs. So mid-gym-session it drops a ballad. Mid-focus-block it drops a party track. The songs are all mine. They just don't belong next to each other.",
    why:
      "This broke the three times I actually care about music: the gym, deep-focus work, and a room full of people. Each needs a *consistent* mood held for an hour — exactly the thing a click-based recommender can't promise, because it doesn't know what a song sounds like. I got tired of playing DJ with my thumb between sets, so I built the thing I wanted: an app that hears the music and keeps the room where I put it.",
    architecture:
      "Three parts. First, it pulls in my own library — my playlists, my liked songs — straight from my account. Second, a small music model listens to each track's real audio and turns it into a fingerprint of how that song *sounds*: its energy, texture, mood. Those fingerprints live in a tiny database on the phone. Third, when a song is playing, the app looks for the next one whose fingerprint sits closest to it — so the mood holds instead of lurching. A dial decides how close is close enough. The whole thing runs on the phone: no server picks anything, and it keeps working offline. Analysis of the library happens quietly in the background while the screen is off.",
    architectureMap: `┌──────────────┐          ┌──────────────────────┐
│  my own      │          │  on-device listener  │
│  library     │─────────►│  hears each track    │
│  1210 songs  │          │  → a "sound print"   │
└──────────────┘          └──────────┬───────────┘
                                     │ stored locally
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
          ┌───────────────────┐            ┌────────────────────┐
          │   mood chips      │            │  LOCK ◄────► DRIFT │
          │ happy · chill     │            │  how far the queue │
          │ aggressive · dance│            │  may wander from   │
          │ acoustic · party  │            │  the current vibe  │
          └─────────┬─────────┘            └─────────┬──────────┘
                    └───────────────┬────────────────┘
                                    ▼
                        ┌───────────────────────┐
                        │      next song        │
                        │  chosen by SOUND —    │
                        │  never by what other  │
                        │  people clicked on    │
                        └───────────────────────┘`,
    challenge:
      "Making it keep working when the phone is in your pocket. Skipping from the lock-screen notification worked about three times, then died — and four plausible fixes later it still died. The real answer only showed up when I stopped reading my own code and measured on the device: a plain network request from JavaScript never comes back while the app is backgrounded. Not slow, not an error — it just never returns. Meanwhile the audio player streamed fine, because that part is native. Swapping to a different HTTP library would have changed nothing; on React Native they all funnel into the same place. I ended up writing the networking layer in Kotlin so it runs on threads the system doesn't park. That's the same reason Spotify works in your pocket — it isn't privileged, it just doesn't ask JavaScript to do the fetching.",
    challengeStats: [
      { k: "songs analyzed", v: "770 / 770" },
      { k: "background skips", v: "20 / 20" },
      { k: "before the fix", v: "~3, then stall" },
      { k: "native modules written", v: "3" },
    ],
    tradeoffs: [
      "On-device model over a cloud API · the phone does the listening, so it costs nothing per song, works offline, and no audio ever leaves the device. Cost: analyzing a big library takes real time and battery, which is why it runs as a background job with battery and Wi-Fi guards rather than blocking the UI.",
      "React Native for the app, Kotlin for anything touching the OS · the UI moved fast, but every hard bug in this project lived exactly on that seam. Honest read: for a solo Android-only build, straight Kotlin would probably have been the cleaner call — I'd still take the trade for what the seam taught me.",
      "An unofficial API for the library · it gets me my real playlists and real liked songs, which is the whole point. Cost: it's reverse-engineered, so it can break, and some catalog entries are unplayable and need a search fallback to find a working copy of the same recording.",
      "Stop on a failed song instead of auto-skipping · the old behaviour churned through five tracks and errored anyway. Stopping is louder but honest — a broken song is the listener's to skip, not the app's to hide.",
    ],
    scale:
      "Built for one library, not a million users. Everything scales with song count, not traffic: a fingerprint per track in a local database, queue picks that stay instant across a 1200-song library, and a background analyzer that chews through the backlog once and then only sees new songs. No server, no accounts, no per-user cost — the ceiling is the phone's storage, and it's nowhere near it.",
    scaleStats: [
      { k: "library size", v: "1,210 songs" },
      { k: "analysis", v: "one-time, then incremental" },
      { k: "server cost", v: "$0" },
      { k: "unit tests", v: "232" },
    ],
    future:
      "Smarter mood regions learned from my own thumbs instead of fixed presets. A proper 'build me an hour of this' session mode for gym and focus blocks. Crossfade and tempo-aware transitions so a party set never has a dead half-second. And wider device testing — Android manufacturers all treat background work differently, and right now this is tuned on one phone.",
    futureMilestones: [
      { state: "done", label: "vibe engine · queues built from audio, on-device" },
      { state: "done", label: "background analysis · runs with the screen off" },
      { state: "done", label: "lock-screen control · fixed via native networking" },
      { state: "planned", label: "session mode · hold a mood for a set length" },
      { state: "planned", label: "tempo-aware transitions + crossfade" },
    ],
    decisions: [
      {
        title: "Listen to the audio, not the clicks",
        body: "The model reads the waveform, not the genre tag or the play count. That's the whole reason a mellow track by a heavy band lands next to other mellow tracks — the fingerprint describes how it *sounds*, so mood holds across artists and genres that a tag-based system would never put together.",
      },
      {
        title: "A dial, not a switch",
        body: "Lock ◄──► Drift decides how tightly the queue clings to the current vibe. Locked, it's one sustained mood — that's the gym and focus setting. Drifting, it wanders on purpose and surprises me. Same library, completely different session, one control.",
      },
      {
        title: "Prove the model's input before trusting its output",
        body: "Audio becomes a mel-spectrogram before the network ever sees it, and getting that conversion subtly wrong breaks everything silently — no crash, just quietly wrong results. I rewrote the decoder in Kotlin for speed, then wrote a parity test asserting it matches the reference implementation. \"I ran a model\" means nothing if you're feeding it the wrong numbers.",
      },
      {
        title: "Anything that must work while locked lives in native",
        body: "The next track's stream is handed to the player in advance, so a song ends and the next begins with no JavaScript involved at all. Same principle behind the Kotlin networking layer. JavaScript runs ahead of time; it's never on the critical path at the moment the phone is asleep.",
      },
    ],
    outcome:
      "Daily driver. 1,210 songs in, 770 liked tracks fully analyzed, and vibe shuffle is how I actually listen — gym sets hold their energy, focus blocks stay flat, and party mode stops swerving. Lock-screen and notification controls work backgrounded (20/20 verified on-device, against ~3 before the native rewrite), plus offline downloads, real likes that write back to my account, and a separate radio mode for when I do want the endless algorithmic feed. Honest status: alpha, one device, one user — built as a personal and educational project on an unofficial API, not a product.",
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
    repo: "https://github.com/SamarS1ngh",
    shots: [
      { src: "/shots/flowstate/library.png", label: "library · playlists pulled from my own account" },
      { src: "/shots/flowstate/playlist-vibe-shuffle.png", label: "playlist · 770 songs, 770 analyzed — vibe shuffle or radio" },
      { src: "/shots/flowstate/player-mood-chips.png", label: "player · mood chips, drift dial, and a doesn't-fit signal" },
    ],
  },
  {
    slug: "rent-roll",
    name: "RentRoll",
    year: "2026—",
    role: "solo · full-stack · product",
    blurb: "rent operations for small Indian landlords",
    tagline: "The landlord who owns 8 flats runs them from a notebook and a panic-scroll through WhatsApp on the 5th. RentRoll is the ledger that chases rent for them — every flat, every tenant, every month, in one screen.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Drizzle", "Neon Postgres", "NextAuth v5", "Tailwind v4", "S3"],
    tags: ["web", "saas"],
    status: "active",
    problem:
      "Small landlords — 3 to 15 flats — are too big for memory and too small for property managers. They track rent in a notebook or an Excel tab, chase late payers by hand in WhatsApp, and rebuild the whole year from scratch at tax time. The marketplace apps (NoBroker and friends) help them *find* a tenant; nobody helps them *run the place* after move-in. That after-move-in gap is the whole product.",
    why:
      "I watched it happen up close: rent is owed by eight people on eight different days, someone pays half now and half later, one transfer is missing, and the landlord is scrolling chat history at midnight trying to remember who's clear. It's not a hard problem — it's an un-built one, because it's unglamorous and the buyer doesn't search for software. I wanted the boring tool that makes the 5th-of-the-month stop being a chore.",
    architecture:
      "Two faces, one ledger. Landlords get a dashboard; tenants get a thin portal — both read the same data. The spine is a clean hierarchy: a property holds flats, a flat holds a tenancy, a tenancy generates monthly rent invoices, and payments settle against those invoices. A daily cron job wakes up, mints that month's invoices, and fires reminders over email and WhatsApp so the landlord never has to remember. Tenants don't sign up — the landlord sends an invite link, the tenant taps it and claims their flat. Money moves over a UPI QR generated per invoice, so there's no payment-gateway tax on day one. Auth, file storage for documents, and a guest demo mode round it out.",
    architectureMap: `┌──────────────┐         ┌──────────────┐
│  landlord    │         │   tenant     │
│  dashboard   │         │   portal     │
└──────┬───────┘         └──────┬───────┘
       │   one shared ledger    │
       ▼                        ▼
┌─────────────────────────────────────────┐
│  property ─► flat ─► tenancy ─► invoice  │
│                              └─► payment │
└───────────────┬─────────────────────────┘
                │
   ┌────────────┼─────────────┐
   ▼            ▼             ▼
┌────────┐ ┌──────────┐ ┌──────────────┐
│ UPI QR │ │ daily    │ │ invite/claim │
│ per    │ │ cron:    │ │ link · tenant│
│ invoice│ │ invoice  │ │ onboards in  │
│        │ │ +remind  │ │ one tap      │
└────────┘ └────┬─────┘ └──────────────┘
                │ email + WhatsApp
                ▼
         landlord stops chasing`,
    challenge:
      "Modelling one schema that fits both a whole-flat rental and a per-bed PG / co-living room without forking the codebase. A 2BHK let to one family and a 6-bed sharing room are the same primitive — a tenancy — but one bills a flat and the other bills a bed. Landed on an occupancy mode on the flat (whole vs shared) plus a capacity and a bed label on the tenancy, so the ledger, invoicing, and reminders all stay identical whether you rent rooms or beds. One model, two very different businesses.",
    challengeStats: [
      { k: "domain tables", v: "11" },
      { k: "feature modules", v: "9" },
      { k: "audiences served", v: "2" },
      { k: "occupancy modes", v: "whole + bed" },
    ],
    tradeoffs: [
      "Manual-UPI-first over a payment gateway · a QR plus a mark-paid flag gets a landlord collecting rent on day one with zero Razorpay/Stripe onboarding. Cost: reconciliation is a tap, not automatic — the gateway (and auto-match) is a deliberate later step, not a launch blocker.",
      "WhatsApp via a wa.me deep link, not the Business API · ships the reminder loop now without Meta template approval. The link pre-fills the message; the API that sends it unattended is the next upgrade, gated behind real users, not built on spec.",
      "Invite-and-claim onboarding over tenant self-signup · landlords own the data and tenants join in one tap, but it means building a token + claim flow instead of leaning on a signup form.",
    ],
    scale:
      "Built landlord-shaped, not viral-shaped: one landlord with tens of flats and tenants, not millions of anonymous users. The heavy lifting is a once-a-day cron, not a hot request path, so cost is near-flat — serverless Postgres on Neon, object storage for documents, and UPI rails that charge nothing per transfer. The realistic ceiling is the daily job's runtime as invoice count grows, which batches cleanly long before it's a wall.",
    future:
      "WhatsApp Business API so reminders send themselves at 9am. UPI auto-reconcile — match the money that lands in the account to the invoice it pays, no tap. A one-button year-end income export shaped for India's 'Income from House Property' tax head. Razorpay for landlords who want cards + autopay. A built-in referral nudge, since one happy landlord knows ten others.",
    futureMilestones: [
      { state: "done", label: "PG / co-living mode · bill by the bed" },
      { state: "wip", label: "billing · UPI QR + manual mark-paid" },
      { state: "planned", label: "whatsapp business api · auto-send reminders" },
      { state: "planned", label: "auto-reconcile + year-end tax export" },
    ],
    decisions: [
      {
        title: "One ledger, two audiences",
        body: "Landlord dashboard and tenant portal are two doors into the same data — a property holds flats, a flat holds a tenancy, a tenancy bills invoices, payments settle them. No second user table, no syncing two views of 'who owes what'. The ledger is the single source of truth and everything else is a window onto it.",
      },
      {
        title: "Let the robot chase the rent",
        body: "A daily cron job generates each month's invoices and fires email + WhatsApp reminders on its own. The whole pitch is 'stop chasing rent in WhatsApp' — so the chasing had to be the machine's job, not a button the landlord remembers to press.",
      },
      {
        title: "Same schema rents a flat or a bed",
        body: "A flat carries an occupancy mode — whole or shared — and a tenancy can point at a single bed with a label and a capacity. PG and co-living owners (higher pain, higher willingness to pay) run on the exact same invoicing and reminder code as a family renting a 2BHK. One model unlocked a second market.",
      },
    ],
    outcome:
      "Core loop works end to end on a live demo: create a property, add flats, invite a tenant who claims in one tap, auto-generate invoices, collect over UPI, and remind by WhatsApp — plus complaints, notices, and document storage. PG-by-the-bed mode shipped. Honest status: pre-revenue, with billing hardening and the auto-send / auto-reconcile upgrades as the road to the first paying landlord.",
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
    repo: "https://github.com/SamarS1ngh",
    liveUrl: "https://rent-manager-weld.vercel.app/",
    shots: [
      { src: "/shots/rent-roll/dashboard.png", label: "landlord dashboard · month at a glance + 6-month chart" },
      { src: "/shots/rent-roll/rent.png", label: "rent · who owes what, with UPI + whatsapp reminder" },
      { src: "/shots/rent-roll/tenant-portal-upi.png", label: "tenant portal · scan-to-pay UPI QR + payment history" },
      { src: "/shots/rent-roll/tenants.png", label: "tenants · status, dues & open issues per person" },
      { src: "/shots/rent-roll/properties.png", label: "properties · flats + occupancy on one page" },
      { src: "/shots/rent-roll/tenant-record.png", label: "tenant record · india fields, deposit, app invite" },
      { src: "/shots/rent-roll/complaints.png", label: "complaints · who reported it & where" },
      { src: "/shots/rent-roll/claim-onboarding.png", label: "onboarding · tenant claims their flat in one tap" },
    ],
  },
  {
    slug: "negotiator-noir",
    name: "Negotiator Noir",
    year: "2026—",
    role: "solo · design + code + art direction",
    blurb: "a manipulation duel in noir comic ink",
    tagline:
      "You sit across a table from one person at a time — read their mood, deduce their hidden agenda, find the lever that moves them — inside a six-chapter crime story. Secretly, it's a negotiation course: every mission drills one real principle, from BATNA to moral hazard, and the debrief names it only after you've used it.",
    stack: ["TypeScript", "Vite", "Capacitor", "Vitest", "zero frameworks", "AI concept art"],
    tags: ["web", "mobile"],
    status: "active",
    problem:
      "Games about persuasion reduce it to a dice roll or a 'charisma 7' skill check. And the real material — negotiation, leverage, power dynamics — lives in dry business books nobody finishes. Nothing actually makes you practise reading a person under pressure.",
    why:
      "I was learning this stuff anyway — negotiation, economics, power — and the lessons only stuck when I used them. So I built the trainer I wanted: a noir thriller where the only weapon is the other person's psychology, and the debrief tells you the name of the move you just pulled.",
    architecture:
      "Three clean layers. The story is pure data — 35+ mission files, each a branching scene with forks, requirement flags, and outcomes that rewrite the world. The rules are pure functions — the corkboard of people around a target (everyone carries a disposition from enemy to ally), the campaign state (money, faction standing, bonds, a ledger of what you did), all deterministic reducers covered by tests. The UI is hand-rolled TypeScript that just renders state — no React, no game engine. Capacitor wraps the same bundle into an Android app.",
    architectureMap: `┌────────────────────────────────┐
│  content · 35+ mission files   │
│  branching beats · outcomes    │
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│  domain · pure reducers        │
│  board · campaign · mission    │
│  money · bonds · factions      │
└───────────────┬────────────────┘
                ▼
┌────────────────────────────────┐
│  ui · hand-rolled TS panels    │
│  corkboard · duel · debrief    │
└───────────────┬────────────────┘
                │ debrief names the move
                ▼
     ┌───────────────────────┐
     │ codex · the black book│
     │ 19 principles learned │
     └───────────────────────┘`,
    challenge:
      "Choices that matter without a combinatorial explosion. Every mission ending bends the world — someone turned, someone burned, a faction cooled — and later chapters have to read that state and react. The fix was a flag ledger plus small numeric scales (bonds 0–4, faction standing 0–4) instead of forking whole storylines: outcomes write flags, scenes read them, and one set of missions serves many different pasts.",
    challengeStats: [
      { k: "chapters", v: "6" },
      { k: "mission scenes", v: "35+" },
      { k: "principles taught", v: "19" },
      { k: "frameworks used", v: "0" },
    ],
    tradeoffs: [
      "No engine, no framework · the whole game is data + reducers + hand-built panels. Tiny bundle, total control — but every speech bubble, meter, and corkboard pin was made by hand.",
      "Authored branching over simulation · hand-written forks read better than any generated dialogue, but every path costs writing. The flag system keeps the explosion in check.",
      "AI art under strict art direction · concept art in hours instead of weeks, but consistency is the fight — took a corrected crisp-ink pass and a per-opponent lighting system to make it feel like one book.",
    ],
    scale:
      "Single-player and fully offline — no server, no accounts. Saves are checkpoints on the device. The only thing that grows is content, so the ceiling is writing time, not infrastructure.",
    future:
      "Lock the art style across the full cast, finish the panel art for every chapter, then ship the Android build through Capacitor. After that: more opponents, and a new-game-plus that remixes missions against what your codex says you've already mastered.",
    futureMilestones: [
      { state: "done", label: "full 6-chapter campaign · learning engine · saves" },
      { state: "done", label: "playable prologue · interactive reads for the cast" },
      { state: "wip", label: "art lock · crisp comic ink + per-opponent lighting" },
      { state: "planned", label: "android release via capacitor" },
    ],
    decisions: [
      {
        title: "A teaching engine wearing a thriller's skin",
        body: "Every mission is built around one real principle — interests-not-positions, anchoring, moral hazard, walk-away power. You use it under pressure first; the debrief names it afterwards, plain-words version first, real term anchored to it second. The codex ('the black book') collects only what you've actually used.",
      },
      {
        title: "Pure reducers, dumb UI",
        body: "The board, the campaign, the missions — all deterministic functions that take state and return new state, covered by tests. The UI never decides anything; it just draws. That made saves trivial (serialize the state) and made the game testable like a library.",
      },
      {
        title: "Two-layer moves — the angle, then the words",
        body: "Your turn is a read and a gamble twice over: pick the angle (disarm, press, bribe, push), then the exact words. Prep on the corkboard unlocks approaches — walk in blind and options are literally missing from the table.",
      },
    ],
    outcome:
      "The full six-chapter campaign runs end to end — corkboard, duels, consequences, codex — with checkpointed saves and a playable prologue. Honest status: pre-release. The screens below are concept art and UI mockups from the art-direction phase, being locked before the final art pass.",
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
    repo: "https://github.com/SamarS1ngh/negotiator-noir",
    shots: [
      { src: "/shots/negotiator-noir/duel-screen.png", label: "duel screen mockup · mood, composure, a live tell + the two-layer move" },
      { src: "/shots/negotiator-noir/opponent-kingpin.jpg", label: "the old kingpin · crisp-ink art direction" },
      { src: "/shots/negotiator-noir/opponent-femme.jpg", label: "the femme fatale · per-opponent lighting palette" },
      { src: "/shots/negotiator-noir/opponent-wary.jpg", label: "the dangerous one · style test" },
    ],
  },
  {
    slug: "wallpaper-controller",
    name: "Wallpaper Controller",
    year: "2026",
    role: "solo · android",
    blurb: "a fresh lock screen every time you wake your phone",
    tagline:
      "Pick a set of lock screen images, and every time the screen turns off the next one loads — so every wake is a new wallpaper. No accounts, no ads, no internet permission. 786 lines of Kotlin and one trick: the rotation lives inside a live wallpaper, so Android keeps it alive for free.",
    stack: ["Kotlin", "Android Views", "WallpaperService", "TileService", "RecyclerView"],
    tags: ["mobile"],
    status: "shipping",
    problem:
      "Android happily varies your home wallpaper but has no built-in way to rotate the lock screen. The apps that fake it run foreground services with permanent notifications, beg for battery-optimization exemptions, and still get killed — or they demand network access and show ads for what is, at heart, a 'change picture' job.",
    why:
      "I wanted one small thing: a different wallpaper every time I wake my phone. Every existing option either died in the background or asked for permissions a wallpaper app has no business asking for. It's a weekend-sized problem — so I built the version that respects the phone.",
    architecture:
      "The whole app rides on one insight: Android keeps a live wallpaper's process alive because it has to draw your screen. So the home wallpaper is a minimal live-wallpaper engine drawing a static bitmap — and that engine registers a screen-off receiver. Screen turns off → the store picks the next image in your lock set → one WallpaperManager call sets it on the lock screen. By the time you look at your phone again, the new wallpaper is already there. A Quick Settings tile and a 'next now' button drive the same path by hand, and a small diagnostics log records every change.",
    architectureMap: `        screen turns off
               │
               ▼
┌───────────────────────────────┐
│ live wallpaper engine         │
│ draws the home image          │
│ system keeps it alive         │
└──────────────┬────────────────┘
               ▼
┌───────────────────────────────┐
│ wallpaper store               │
│ next image in the lock set    │
└──────────────┬────────────────┘
               ▼
┌───────────────────────────────┐
│ WallpaperManager · FLAG_LOCK  │
│ new lock wallpaper is set     │
└───────────────────────────────┘
   ▲                      │
   │ same path            ▼
 QS tile · next now   diagnostics log`,
    challenge:
      "Surviving in the background without cheating. Android kills background apps by design, and the usual workarounds — a foreground service with a permanent notification, battery-exemption prompts, boot receivers — are exactly what makes these apps gross, and exactly what Play review flags. The live wallpaper is the one legal foothold: the system keeps it alive to draw the screen, and the rotation rides along at zero extra cost. Turn the live wallpaper off and rotation simply stops — nothing runs behind your back.",
    challengeStats: [
      { k: "total kotlin", v: "786 loc" },
      { k: "permissions", v: "1" },
      { k: "internet access", v: "none" },
      { k: "background services", v: "0" },
    ],
    tradeoffs: [
      "Rotation needs the live wallpaper active · turn it off and cycling stops. An honest failure mode — no zombie process trying to outsmart the OS.",
      "The engine draws a static bitmap, not an animation · zero battery drama, but the home wallpaper can't do live effects. Wrong app for that.",
      "Images are copied into private storage · costs duplicate bytes, but needs no storage permission, originals can be deleted freely, and uninstall wipes everything.",
    ],
    scale:
      "Everything is on-device — there is nothing to scale except the image set. No backend, no analytics, no crash reporter phoning home. The Play data-safety form is one word: none.",
    future:
      "Get through Play review — the v1.6 release bundle, store listing, and privacy policy are done. After that, only what real users ask for: shuffle order and time-based rotation are the obvious candidates.",
    futureMilestones: [
      { state: "done", label: "lock rotation on screen-off · quick settings tile" },
      { state: "done", label: "v1.6 release bundle · store listing · privacy policy" },
      { state: "wip", label: "google play submission" },
      { state: "planned", label: "shuffle + scheduled rotation · if users ask" },
    ],
    decisions: [
      {
        title: "The live wallpaper is the legal foothold",
        body: "The system keeps a live wallpaper running because it draws your screen — so the screen-off receiver that advances the lock image lives inside that engine. No foreground service, no permanent notification, no battery-exemption begging. The one process Android promises not to kill is the one doing the work.",
      },
      {
        title: "No internet permission, so privacy is provable",
        body: "The app doesn't promise not to phone home — it can't. There is no INTERNET permission in the manifest, so 'no data leaves your device' is checkable by anyone who can read an APK, not a privacy-policy pinky swear.",
      },
      {
        title: "Copy, don't reference",
        body: "Picked images are copied into app-private storage. No media-library permission, no broken wallpapers when you clean your gallery, and uninstalling removes every byte the app ever touched.",
      },
    ],
    outcome:
      "Daily driver on my own phone — every wake is a fresh wallpaper, and the diagnostics log shows the cycle firing on every screen-off. v1.6 is built as a signed release bundle with the Play listing and privacy policy written; the submission itself is the last step.",
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
    repo: "https://github.com/SamarS1ngh/wallpaper-controller",
    shots: [
      { src: "/shots/wallpaper-controller/home.png", label: "home · pick the home image + span toggle + set as live wallpaper" },
      { src: "/shots/wallpaper-controller/lock-rotation.png", label: "lock rotation · the set, next-now, QS tile tip + diagnostics" },
    ],
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
    slug: "dr-magnet",
    name: "Dr. Magnet",
    year: "2026",
    role: "freelance contract · solo full-stack",
    blurb: "patient-acquisition site for a healthcare marketing agency · client build",
    tagline: "A high-converting landing site for a healthcare marketing agency that runs Meta + Google ads for doctors, clinics and hospitals. Every visitor is paid ad traffic — so the page is built to load fast on a phone, prove results, and turn a doctor into a qualified lead.",
    stack: ["TanStack Start", "React 19", "Vite", "Tailwind v4", "shadcn/ui", "Zod", "Google Sheets API", "Meta Pixel + Conversions API"],
    tags: ["web"],
    status: "shipped",
    problem:
      "The agency sells one thing: more patients for doctors. Their own website had to practice what they preach. Traffic arrives from paid Meta and Google ads, mostly on mobile, and every rupee spent on a click that bounces is wasted. They needed a site that looks premium (not a generic hospital template), shows real campaign proof, and hands the sales team leads that are already qualified.",
    why:
      "Doctors are skeptical buyers. They've been burned by agencies that promise leads and deliver junk. So the site leads with proof — real ad-dashboard screenshots, real WhatsApp messages from clinics, real client logos — and asks for enough detail up front that a sales call starts with context instead of cold questions.",
    architecture:
      "One server-rendered React app. The home page is a long sales page — hero with a video sales letter, the Magnet Framework (M-A-G-N-E-T steps), a founder section, dashboard carousel, chat-screenshot testimonials, client logos, FAQ. Every call-to-action funnels to a /book page with a 10-field qualifying form. On submit, a typed server function validates the lead and appends it as a row in the agency's Google Sheet, so the sales team works from a spreadsheet they already know. The same submit fires a 'Lead' event to Meta twice — once from the browser pixel and once from the server — tagged with one shared ID so Meta counts it once.",
    architectureMap: `┌───────────────┐   meta / google ad click
│ doctor · phone│ ─────────────────────────┐
└───────┬───────┘                          ▼
        │                         ┌──────────────────┐
        │  SSR sales page         │  home · VSL,     │
        └────────────────────────►│  proof, framework│
                                  └────────┬─────────┘
                                           │ every CTA
                                           ▼
                                  ┌──────────────────┐
                                  │ /book · 10-field │
                                  │ qualifying form  │
                                  └────────┬─────────┘
                    ┌──────────────────────┼────────────────────┐
                    ▼                      ▼                    ▼
           ┌────────────────┐   ┌───────────────────┐  ┌────────────────┐
           │ server fn · zod│   │ browser pixel     │  │ server CAPI    │
           │ → google sheet │   │ Lead · event_id X │  │ Lead · event_id│
           │ (sales team)   │   └─────────┬─────────┘  │ X · hashed ph  │
           └────────────────┘             └──── meta dedupes ─┘`,
    challenge:
      "Page speed on paid traffic. The first build shipped 36 elements — including the hero headline and the video poster — at opacity 0, waiting for JavaScript to fade them in, and every video testimonial eagerly loaded a full Vimeo player. On a mid-range phone the headline showed up late and the page weighed ~4MB. Fixed it by rendering everything visible on the server and only animating below-the-fold sections after hydration, loading the video poster (the biggest paint) eagerly with high priority, and swapping each Vimeo embed for a thumbnail that only mounts the player on tap.",
    challengeStats: [
      { k: "mobile LCP", v: "4.9s → ~3s" },
      { k: "page weight", v: "4MB → 1MB" },
      { k: "hidden-on-load elements", v: "36 → 0 above fold" },
      { k: "vimeo JS per embed", v: "~500KB → on tap" },
    ],
    tradeoffs: [
      "Google Sheets as the lead store over a database + admin panel · zero new tools for the sales team, no dashboard to build or maintain. Cost: no dedupe or lead status inside the site — the sheet is the CRM.",
      "Server-side Conversions API on top of the browser pixel · more moving parts, but ad blockers and iOS privacy drop a big share of pixel events. Shared event IDs keep Meta from double-counting.",
      "Long single sales page over a multi-page site · matches how paid traffic behaves (land, scroll, decide) and keeps every CTA one tap from /book.",
      "Screenshots of real dashboards and chats over polished case-study copy · uglier than a designed stat card, but far more believable to a skeptical doctor.",
    ],
    scale:
      "It's a marketing site, so scale here means ad spend, not concurrency — the thing that breaks is conversion rate, not servers. Pages are server-rendered and light enough for mid-range Android on mobile data. Lead writes are one append per submit to Google Sheets; Meta events go out fire-and-forget so a slow Graph API never blocks the thank-you screen.",
    future:
      "Dedicated case-study pages per speciality (dermatology, IVF, aesthetics) for ad-group-specific landing. Auto WhatsApp follow-up the moment a lead lands in the sheet. Feed booked-appointment events back to Meta so campaigns optimise for patients who actually show up, not just form fills.",
    futureMilestones: [
      { state: "done", label: "qualifying form → google sheet" },
      { state: "done", label: "pixel + conversions API · deduped" },
      { state: "done", label: "mobile perf pass · LCP ~3s" },
      { state: "planned", label: "per-speciality case-study pages" },
      { state: "planned", label: "whatsapp auto follow-up on new lead" },
      { state: "planned", label: "offline conversions · booked appointments → meta" },
    ],
    decisions: [
      {
        title: "Qualify before the call",
        body: "The form asks for speciality, monthly revenue, marketing budget, timeline, biggest challenge and what they've tried. Ten fields is a lot — on purpose. Doctors who fill it are serious, and the sales team opens every call already knowing the clinic.",
      },
      {
        title: "One event, two senders, one count",
        body: "Each conversion gets a random event ID. The browser pixel sends it; a server function sends the same event to Meta's Conversions API with SHA-256 hashed phone and name (Indian numbers normalised to +91 first). Meta sees two copies with one ID and keeps one — better match rates without inflated numbers.",
      },
      {
        title: "Visible on the server, animated after",
        body: "Scroll-reveal animations used to hide content until JS loaded. Now the server ships it visible and only below-the-fold sections get hidden after hydration, then fade in on scroll. Same polish, no blank hero.",
      },
      {
        title: "Mobile-first, sticky booking bar",
        body: "Most visitors are on phones. A sticky bottom bar with a countdown and a Book Now button follows the scroll, and a full responsive audit fixed clipping, overflowing carousels and cut-off headings from small phones up to wide desktops.",
      },
    ],
    outcome:
      "Live at drmagnet.in as the landing page for the agency's paid Meta + Google campaigns. Leads land in the sales team's Google Sheet with full qualifying context, and conversions report back to Meta from both browser and server.",
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
    client: {
      industry: "Healthcare marketing agency",
      region: "India",
      teamSize: "solo build",
      engagement: "~1 month · fixed scope",
      named: true,
    },
    heroMetrics: [
      { k: "mobile LCP", v: "~3s", accent: "emerald" },
      { k: "page weight", v: "1MB", accent: "sky" },
      { k: "qualifying fields / lead", v: "10", accent: "rose" },
    ],
    liveUrl: "https://www.drmagnet.in/",
    liveCta: {
      badge: "live · in production",
      title: "Visit the live site",
      body: "The real site, serving the agency's ad traffic right now. Scroll the sales page, then open the booking form.",
      button: "open drmagnet.in",
      path: "",
    },
    shots: [
      { src: "/shots/dr-magnet/hero-vsl.png", label: "hero · headline + video sales letter" },
      { src: "/shots/dr-magnet/magnet-framework.png", label: "the magnet framework · six-step method" },
      { src: "/shots/dr-magnet/results-dashboards.png", label: "results · real google + meta ads dashboards" },
      { src: "/shots/dr-magnet/client-chats.png", label: "testimonials · real clinic whatsapp chats" },
      { src: "/shots/dr-magnet/client-logos-faq.png", label: "client logos + FAQ" },
      { src: "/shots/dr-magnet/booking-form.png", label: "/book · 10-field qualifying form → google sheet" },
      { src: "/shots/dr-magnet/mobile-hero.png", label: "mobile · sticky countdown + book-now bar" },
    ],
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
