"use client";

import { useContext, useEffect, useState } from "react";
import { ACCENT, type Accent } from "./HudPanel";
import { RevealContext } from "./useReveal";

// counts the first number in a value ("1,210 songs", "20 / 20", "$0") up from zero on reveal
export function CountUp({ value }: { value: string }) {
  const phase = useContext(RevealContext);
  const m = value.match(/^(\D*?)(\d[\d,]*\.?\d*)(.*)$/);
  const target = m ? parseFloat(m[2].replace(/,/g, "")) : NaN;
  const decimals = m && m[2].includes(".") ? m[2].split(".")[1].length : 0;
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (phase !== "shown" || !Number.isFinite(target) || target === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let start = 0;
    let raf = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / 800);
      setN(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
      else setN(null);
    };
    // the first frame sets 0, so a page that never paints still shows the real value
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, target]);

  if (!m || n === null) return <>{value}</>;
  const shown = n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <>
      {m[1]}
      {shown}
      {m[3]}
    </>
  );
}

export function StatTiles({ items, tone }: { items: { k: string; v: string }[]; tone: Accent }) {
  const a = ACCENT[tone];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <div key={it.k} className={`min-w-0 border ${a.border} bg-black/40 px-3 py-2`}>
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/50">{it.k}</div>
          <div
            className={`mt-1 break-words font-light text-lg leading-tight tracking-tight ${a.text}`}
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <CountUp value={it.v} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusGauge({ status }: { status: string }) {
  const stages = [
    { key: "active", label: "build" },
    { key: "shipping", label: "ship" },
    { key: "shipped", label: "live" },
    { key: "archived", label: "rest" },
  ];
  const activeIdx = stages.findIndex((s) => s.key === status);
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {stages.map((s, i) => (
          <span
            key={s.key}
            className={`h-2 flex-1 ${
              activeIdx >= 0 && i <= activeIdx
                ? i === activeIdx
                  ? "bg-amber-300 shadow-[0_0_6px_#ffd54a]"
                  : "bg-amber-300/70"
                : "bg-bone/15"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.25em]">
        {stages.map((s, i) => (
          <span
            key={s.key}
            className={i === activeIdx ? "text-amber-200" : i < activeIdx ? "text-amber-300/55" : "text-bone/35"}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const MILESTONE = {
  done: { bar: "bg-emerald-400", dot: "●", text: "text-emerald-200", dotc: "text-emerald-300" },
  wip: { bar: "bg-amber-300", dot: "◐", text: "text-amber-100", dotc: "text-amber-300 motion-safe:animate-pulse" },
  planned: { bar: "bg-bone/15", dot: "○", text: "text-bone/70", dotc: "text-bone/40" },
} as const;

// horizontal track on md+, stacked on phones
export function MilestoneTrack({ items }: { items: { state: "planned" | "wip" | "done"; label: string }[] }) {
  return (
    <ol className="grid gap-3 md:grid-flow-col md:auto-cols-fr md:gap-2">
      {items.map((m, i) => {
        const s = MILESTONE[m.state];
        return (
          <li key={i} className="min-w-0">
            <span className={`block h-1 ${s.bar}`} />
            <div className="mt-2 flex items-start gap-2">
              <span className={`font-mono text-[12px] ${s.dotc}`}>{s.dot}</span>
              <span className={`break-words font-mono text-[11px] leading-snug ${s.text}`}>{m.label}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
