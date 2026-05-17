export const now = {
  updated: "2026-05-16",
  location: "Hyderabad, IN",
  focus: "Teaching Jarvis to remember things. Polishing nocap for beta users.",
  building: [
    {
      title: "Long-term memory for Jarvis",
      note: "So my voice assistant remembers past conversations, my habits, and my quirks. It learns from how I work over time, so the next ask gets a sharper, more personal answer — not a fresh-start chatbot every session.",
      status: "wip",
    },
    {
      title: "nocap beta",
      note: "Mobile app that uses AI to filter your phone notifications. Fixing onboarding and making the filter smarter — it learns from your past behaviour using a memory + point-based system, so it gets better at knowing what matters with every notification you accept or dismiss.",
      status: "wip",
    },
    {
      title: "Ledger module for EEO",
      note: "A document management tool for organizations. Stores, tracks, and links documents across teams — so a contract, an invoice, or a policy has one home, one audit trail, and lives where the people who need it can find it.",
      status: "early",
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
  ],
  deadEnds: [
    {
      title: "Running Jarvis inside a desktop app",
      note: "Tried bundling Jarvis with a Tauri shell. The background piece kept crashing. Moved it to a normal system service — works fine now.",
    },
    {
      title: "Tiny on-phone AI model for nocap",
      note: "Tried putting a small AI model directly on the phone. Too big and too slow. Cloud AI (Gemini Flash) was cheaper and faster end-to-end.",
    },
  ],
  reading: [
    "The Investor Who Sees the Future (manhwa)",
    "The Max-Level Player's 100th Regression (manhwa)",
  ],
  listening: "anything, honestly. Latest on repeat: Staring at the Sun — TV on the Radio · Headlock — Imogen Heap",
  watching: [
    "Witch Hat Atelier (anime)",
    "Fire Force (anime)",
    "Bloodhounds (kdrama)",
    "Two and a Half Men (sitcom)",
  ],
  playing: [
    "Assassin's Creed — every game, in release order",
    "Dead Island 2",
  ],
  onDeck: [
    "Make Jarvis pull memories while we talk by voice.",
    "Get nocap onto 10 people's phones.",
    "Ship the first version of Ledger — record and close transactions.",
  ],
};
