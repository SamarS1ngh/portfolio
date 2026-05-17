"use client";

const KEY = "samar.world.v1";

type Saved = {
  visited: number[];
  quests: string[];
  konami: boolean;
};

export function loadSaved(): Saved {
  if (typeof window === "undefined") return { visited: [0], quests: [], konami: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { visited: [0], quests: [], konami: false };
    const parsed = JSON.parse(raw);
    return {
      visited: Array.isArray(parsed.visited) ? parsed.visited : [0],
      quests: Array.isArray(parsed.quests) ? parsed.quests : [],
      konami: !!parsed.konami,
    };
  } catch {
    return { visited: [0], quests: [], konami: false };
  }
}

export function saveState(s: Saved) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function readUrlRegion(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const sp = new URLSearchParams(window.location.search);
    const r = sp.get("r");
    if (!r) return null;
    const m = r.match(/^[Rr]?(\d+)$/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    if (isNaN(n)) return null;
    return n;
  } catch {
    return null;
  }
}

export function writeUrlRegion(idx: number) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("r", `R${idx}`);
    window.history.replaceState({}, "", url.toString());
  } catch {}
}
