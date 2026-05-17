"use client";

import { useEffect, useState } from "react";

const items = [
  { id: "splash", label: "↑", title: "top" },
  { id: "whoami", label: "who", title: "whoami" },
  { id: "work", label: "work", title: "work" },
  { id: "toolkit", label: "kit", title: "toolkit" },
  { id: "frequencies", label: "freq", title: "frequencies" },
  { id: "status", label: "now", title: "status / now" },
  { id: "pingback", label: "ping", title: "pingback" },
];

export function StickerNav() {
  const [active, setActive] = useState("splash");

  useEffect(() => {
    const onScroll = () => {
      let current = "splash";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) current = it.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed left-1/2 top-4 z-[120] -translate-x-1/2">
      <ul className="flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-1.5 backdrop-blur-xl shadow-sticker">
        <li className="px-2 font-display text-[11px] font-medium uppercase tracking-widest text-bone">
          ◆ samar
        </li>
        <li className="mx-1 h-4 w-px bg-white/15" />
        {items.slice(1).map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              title={it.title}
              className={`block rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-all ${
                active === it.id
                  ? "bg-hot text-white shadow-glow"
                  : "text-bone/60 hover:bg-white/10 hover:text-bone"
              }`}
            >
              {it.label}
            </a>
          </li>
        ))}
        <li className="mx-1 h-4 w-px bg-white/15" />
        <li>
          <kbd className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-bone/80">
            ⌘K
          </kbd>
        </li>
      </ul>
    </nav>
  );
}
