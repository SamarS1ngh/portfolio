export type Interest = {
  title: string;
  tag: string;
  note?: string;
};

export const interests: Record<"anime" | "manga" | "games" | "music" | "shows", Interest[]> = {
  anime: [
    { title: "Witch Hat Atelier", tag: "currently watching" },
    { title: "Kill Blue", tag: "currently watching" },
    { title: "Black Clover", tag: "currently watching" },
  ],
  manga: [
    { title: "The Investor Who Sees the Future", tag: "manhwa · current" },
    { title: "The Max-Level Player's 100th Regression", tag: "manhwa · current" },
  ],
  games: [
    {
      title: "Assassin's Creed",
      tag: "playing",
      note: "Trying to finish every game in chronological order of release.",
    },
    { title: "Dead Island 2", tag: "playing" },
  ],
  music: [
    {
      title: "Snake Charmer",
      tag: "Badal",
      note: "Latest on repeat.",
    },
    {
      title: "Makeen (feat. Kieyomii)",
      tag: "Music BM",
      note: "Latest on repeat.",
    },
  ],
  shows: [
    { title: "Bloodhounds", tag: "kdrama" },
    { title: "Two and a Half Men", tag: "sitcom" },
  ],
};

export const heroes = [
  { name: "Tony Stark", note: "iterate in the basement, defend the world at lunch." },
  { name: "Howard Hughes", note: "engineer who built it, then flew it." },
  { name: "Carmack", note: "first principles, every time." },
];
