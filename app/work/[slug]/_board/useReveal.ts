"use client";

import { createContext, useEffect, useRef, useState } from "react";

// ssr = rendered visible on the server; armed = hidden, waiting to scroll in; shown = revealed
export type RevealPhase = "ssr" | "armed" | "shown";
export const RevealContext = createContext<RevealPhase>("shown");

export function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<RevealPhase>("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setPhase("shown");
      return;
    }
    setPhase("armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPhase("shown");
          io.disconnect();
        }
      },
      // any sliver past the bottom 10% counts — a ratio threshold can never fire on a panel taller than the screen
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, phase };
}
