export const now = {
  updated: "2026-06-26",
  location: "Hyderabad, IN",
  focus: "Teaching Jarvis to remember things. Getting RentRoll demo-ready for its first landlords.",
  building: [
    {
      title: "Long-term memory for Jarvis",
      note: "So my voice assistant remembers past conversations, my habits, and my quirks. It learns from how I work over time, so the next ask gets a sharper, more personal answer — not a fresh-start chatbot every session.",
      status: "wip",
    },
    {
      title: "RentRoll",
      note: "A landlord-first rent manager for small Indian landlords — multi-flat ledger, UPI QR rent, WhatsApp reminders, and a one-tap tenant portal. Just shipped a public no-login demo and a per-bed PG mode; next up is auto-reconcile and a year-end tax export.",
      status: "wip",
    },
  ],
  experiments: [
    {
      title: "Letting Jarvis use my apps",
      note: "Using a new standard called MCP so Jarvis can open, click, and edit things across my computer — not just chat.",
    },
    {
      title: "AI agents in n8n",
      note: "A team of small AI bots reading my email and calendar, then sorting and replying for me. Like an inbox cleaner that runs itself.",
    },
    {
      title: "Faster memory search for Jarvis",
      note: "Trying different ways to store and look up memories so Jarvis pulls the right past chat faster and more accurately as the memory grows.",
    },
    {
      title: "Auto-sending RentRoll reminders",
      note: "Wiring the WhatsApp Business API so rent reminders fire on their own at 9am, instead of the current tap-to-send link. The chasing should be the machine's job.",
    },
  ],
  deadEnds: [
    {
      title: "Running Jarvis inside a desktop app",
      note: "Tried bundling Jarvis with a Tauri shell. The background piece kept crashing. Moved it to a normal system service — works fine now.",
    },
    {
      title: "Logged-in iframe for the RentRoll demo",
      note: "Wanted to embed the live dashboard in the portfolio, logged in. Third-party cookies get blocked inside a cross-origin iframe, so it kept bouncing to login. Built a public no-login /demo route instead — works in every browser.",
    },
  ],
  reading: [
    "The Investor Who Sees the Future (manhwa)",
    "The Max-Level Player's 100th Regression (manhwa)",
  ],
  listening: "anything, honestly. Latest on repeat: Snake Charmer — Badal · Makeen (feat. Kieyomii) — Music BM",
  watching: [
    "Witch Hat Atelier (anime)",
    "Kill Blue (anime)",
    "Black Clover (anime)",
    "Bloodhounds (kdrama)",
    "Two and a Half Men (sitcom)",
  ],
  playing: [
    "Assassin's Creed — every game, in release order",
    "Dead Island 2",
  ],
  onDeck: [
    "Make Jarvis pull memories while we talk by voice.",
    "Get RentRoll in front of 10 small landlords.",
    "Ship RentRoll billing — UPI auto-reconcile + a year-end tax export.",
  ],
};
