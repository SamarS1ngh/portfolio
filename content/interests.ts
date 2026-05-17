export type Interest = {
  title: string;
  tag: string;
  note: string;
};

export const interests: Record<"anime" | "games" | "art" | "science", Interest[]> = {
  anime: [
    { title: "Cyberpunk: Edgerunners", tag: "trigger · 2022", note: "ten episodes of pure kinetic poetry." },
    { title: "Ghost in the Shell", tag: "1995", note: "the original question — what makes you, you?" },
    { title: "Steins;Gate", tag: "2011", note: "engineer-brained time travel done right." },
    { title: "Vinland Saga", tag: "wit / mappa", note: "growth arc that earns every chapter." },
    { title: "Code Geass", tag: "sunrise · 2006", note: "chess at world-scale, with mecha." },
    { title: "Death Note", tag: "2006", note: "two geniuses, one notebook, infinite tension." },
  ],
  games: [
    { title: "Death Stranding", tag: "kojima", note: "a game about connection, hidden in a hiking sim." },
    { title: "Cyberpunk 2077", tag: "cdpr", note: "the city itself is the protagonist." },
    { title: "Outer Wilds", tag: "mobius", note: "best game i've ever played. play blind." },
    { title: "Disco Elysium", tag: "za/um", note: "the most-written game ever made." },
    { title: "Hades", tag: "supergiant", note: "death loop done right." },
    { title: "The Witcher 3", tag: "cdpr", note: "side quests with main-quest weight." },
  ],
  art: [
    { title: "Syd Mead", tag: "futurist", note: "the man who drew the iron man aesthetic before it had a name." },
    { title: "Moebius", tag: "jean giraud", note: "linework as architecture." },
    { title: "Hayao Miyazaki", tag: "ghibli", note: "the gold standard for worldbuilding." },
    { title: "Beeple", tag: "digital", note: "everydays as a discipline." },
    { title: "Hokusai", tag: "edo", note: "wave that never gets old." },
    { title: "Studio Trigger", tag: "anime", note: "color, motion, and zero restraint." },
  ],
  science: [
    { title: "Artificial Intelligence", tag: "field", note: "currently obsessed with persistent-memory architectures." },
    { title: "Astrophysics", tag: "field", note: "black holes as data structures." },
    { title: "Quantum Computing", tag: "field", note: "still pre-paradigmatic. fascinating." },
    { title: "Neuroscience", tag: "field", note: "we are simulating brains we don't yet understand." },
    { title: "The Beginning of Infinity", tag: "deutsch", note: "explanations as the only thing that matters." },
    { title: "Designing Data-Intensive Apps", tag: "kleppmann", note: "still the best systems book on the shelf." },
  ],
};

export const heroes = [
  { name: "Tony Stark", note: "iterate in the basement, defend the world at lunch." },
  { name: "Howard Hughes", note: "engineer who built it, then flew it." },
  { name: "Carmack", note: "first principles, every time." },
];
