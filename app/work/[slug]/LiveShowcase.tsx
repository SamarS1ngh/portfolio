"use client";

import { useEffect, useState } from "react";

type Shot = { src: string; label: string };

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function MacFrame({
  url,
  children,
  onClick,
}: {
  url: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`overflow-hidden rounded-xl border border-bone/15 bg-[#0a0d18] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] ${
        onClick
          ? "group cursor-zoom-in transition-transform duration-200 hover:-translate-y-1 hover:border-amber-300/40"
          : ""
      }`}
    >
      <div className="flex items-center gap-3 border-b border-bone/10 bg-[#11141f] px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-bone/10 bg-black/40 px-3 py-1">
          <span className="truncate font-mono text-[11px] text-bone/70">{url}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

export function LiveShowcase({
  liveUrl,
  shots,
  name,
}: {
  liveUrl: string;
  shots?: Shot[];
  name: string;
}) {
  const base = liveUrl.endsWith("/") ? liveUrl : liveUrl + "/";
  const demoUrl = base + "demo";
  const host = hostOf(liveUrl);
  const [active, setActive] = useState<Shot | null>(null);

  // close lightbox on Escape
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <div className="space-y-6">
      {/* live demo CTA — high-contrast, prominent */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-400/70 bg-emerald-500/[0.14] p-6 shadow-[0_0_60px_-12px_rgba(52,211,153,0.55)] md:p-7">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.35), transparent 70%)" }}
        />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-400/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-100">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#34d399] animate-pulse" />
              live · public demo
            </span>
            <h3
              className="mt-3 font-light text-2xl uppercase leading-tight tracking-tight text-bone md:text-3xl"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Try the real app — no login
            </h3>
            <p className="mt-2 max-w-xl font-sans text-[15px] leading-relaxed text-bone md:text-base">
              A real, populated workspace with live data. No sign-up, no password — just
              click in and look around the actual product.
            </p>
          </div>
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-400 px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.28em] text-[#04140d] shadow-[0_8px_30px_-6px_rgba(52,211,153,0.8)] transition hover:bg-emerald-300"
          >
            ▸ open live demo
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>

      {/* screenshots — click to preview */}
      {shots && shots.length > 0 && (
        <>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55">
            ▸ screens · click any to enlarge
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shots.map((s) => (
              <figure key={s.src}>
                <MacFrame url={host} onClick={() => setActive(s)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    alt={s.label}
                    loading="lazy"
                    className="w-full bg-white transition-opacity duration-200 group-hover:opacity-90"
                  />
                </MacFrame>
                <figcaption className="mt-2 font-mono text-[11px] leading-snug tracking-wide text-bone/60">
                  {s.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}

      <div className="text-right">
        <a
          href={liveUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55 hover:text-amber-300"
        >
          marketing site ↗ {host}
        </a>
      </div>

      {/* lightbox */}
      {active && (
        <div
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-10"
        >
          <button
            onClick={() => setActive(null)}
            aria-label="Close preview"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-bone/25 bg-black/50 font-mono text-lg text-bone/80 transition hover:border-amber-300/60 hover:text-amber-300"
          >
            ✕
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-6xl overflow-auto rounded-xl border border-bone/20 bg-[#0a0d18] shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.src} alt={active.label} className="w-full bg-white" />
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-bone/70">
            {active.label}
          </p>
        </div>
      )}

      <span className="sr-only">{name} — live demo and captures</span>
    </div>
  );
}
