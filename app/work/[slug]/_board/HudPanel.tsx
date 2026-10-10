"use client";

import type { ReactNode } from "react";
import { Decrypt } from "./Decrypt";
import { RevealContext, useReveal } from "./useReveal";

export type Accent = "amber" | "violet" | "rose" | "sky" | "emerald" | "bone";

export const ACCENT: Record<Accent, { border: string; text: string; dot: string; bracket: string }> = {
  amber: { border: "border-amber-300/25", text: "text-amber-300", dot: "bg-amber-300 shadow-[0_0_8px_#ffd54a]", bracket: "border-amber-300" },
  violet: { border: "border-violet-400/25", text: "text-violet-200", dot: "bg-violet-400 shadow-[0_0_8px_#a78bfa]", bracket: "border-violet-400" },
  rose: { border: "border-rose-400/25", text: "text-rose-200", dot: "bg-rose-400 shadow-[0_0_8px_#fb7185]", bracket: "border-rose-400" },
  sky: { border: "border-sky-400/25", text: "text-sky-200", dot: "bg-sky-400 shadow-[0_0_8px_#38bdf8]", bracket: "border-sky-400" },
  emerald: { border: "border-emerald-400/25", text: "text-emerald-200", dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]", bracket: "border-emerald-400" },
  bone: { border: "border-bone/15", text: "text-bone", dot: "bg-bone shadow-[0_0_8px_#fafaf3]", bracket: "border-bone/70" },
};

const CORNERS = [
  "left-0 top-0 border-l-2 border-t-2 origin-top-left",
  "right-0 top-0 border-r-2 border-t-2 origin-top-right",
  "left-0 bottom-0 border-l-2 border-b-2 origin-bottom-left",
  "right-0 bottom-0 border-r-2 border-b-2 origin-bottom-right",
];

export function HudPanel({
  index,
  label,
  accent = "amber",
  headline,
  detail,
  className = "",
  children,
}: {
  index: string;
  label: string;
  accent?: Accent;
  headline?: string;
  detail?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { ref, phase } = useReveal<HTMLElement>();
  const a = ACCENT[accent];
  const hidden = phase === "armed";

  return (
    <RevealContext.Provider value={phase}>
      <section
        ref={ref}
        className={`relative min-w-0 border ${a.border} bg-[#04060e]/90 p-5 transition-[opacity,transform] duration-500 ease-out md:p-6 ${
          hidden ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        } ${className}`}
      >
        {CORNERS.map((c) => (
          <span
            key={c}
            aria-hidden
            className={`pointer-events-none absolute h-3 w-3 ${a.bracket} ${c} transition-transform delay-150 duration-300 ${
              hidden ? "scale-0" : "scale-100"
            }`}
          />
        ))}

        <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em]">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.dot}`} />
          <span className={a.text}>§{index}</span>
          <span className="text-bone/60">{label}</span>
          <span className="h-px flex-1 bg-bone/10" />
        </div>

        {headline && (
          <h3
            className="mt-4 break-words font-light text-xl leading-snug tracking-tight text-bone transition-[clip-path] delay-200 duration-700 ease-out md:text-2xl"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              clipPath: hidden ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
            }}
          >
            {headline}
          </h3>
        )}

        {children && <div className="mt-4">{children}</div>}

        {detail && <Decrypt id={`decrypt-${index}`} text={detail} />}
      </section>
    </RevealContext.Provider>
  );
}
