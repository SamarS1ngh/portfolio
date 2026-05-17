"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projects } from "@/content/projects";
import { regions } from "@/components/world/regions";

type Props = {
  onTravel: (idx: number) => void;
  onToggleInfo: () => void;
  onClearLog?: () => void;
  showInfo: boolean;
};

export function CommandPalette({ onTravel, onToggleInfo, onClearLog, showInfo }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden border-2 border-amber-300/40 bg-[#04060e]/97 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
      >
        <span className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-l-2 border-t-2 border-amber-300" />
        <span className="pointer-events-none absolute -top-px -right-px h-3 w-3 border-r-2 border-t-2 border-amber-300" />
        <span className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-l-2 border-b-2 border-amber-300" />
        <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-r-2 border-b-2 border-amber-300" />

        <Command className="font-sans">
          <div className="flex items-center justify-between border-b border-amber-300/30 bg-amber-300/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200">
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              command · console
            </span>
            <span className="text-amber-300/60">[ esc to close ]</span>
          </div>

          <div className="flex items-center gap-3 border-b border-bone/10 px-4 py-3">
            <span className="text-amber-300 text-lg">$</span>
            <Command.Input
              autoFocus
              placeholder="travel · engage · jump · search …"
              className="flex-1 bg-transparent text-base text-bone outline-none placeholder:text-bone/40"
            />
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-bone/50">
              no matches
            </Command.Empty>

            <Command.Group heading="travel" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.3em] [&_[cmdk-group-heading]]:text-bone/40">
              {regions.map((r, i) => (
                <Command.Item
                  key={r.code}
                  value={`travel ${r.code} ${r.region} ${r.title}`}
                  onSelect={() => run(() => onTravel(i))}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-bone aria-selected:bg-amber-300/15 aria-selected:text-amber-200"
                >
                  <span className="w-6 text-amber-300/70">{r.glyph}</span>
                  <span className="font-mono text-xs text-bone/60">{r.code}</span>
                  <span className="font-medium">{r.region}</span>
                  <span className="ml-auto font-mono text-xs text-bone/40">↵ jump</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="engage · open mission" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.3em] [&_[cmdk-group-heading]]:text-bone/40">
              {projects.map((p) => (
                <Command.Item
                  key={p.slug}
                  value={`engage ${p.slug} ${p.name} ${p.blurb} ${p.tags.join(" ")}`}
                  onSelect={() => run(() => router.push(`/work/${p.slug}`))}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-bone aria-selected:bg-violet-400/15 aria-selected:text-violet-200"
                >
                  <span className="text-violet-300">›</span>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-sm text-bone/60">— {p.blurb}</span>
                  <span className="ml-auto font-mono text-xs text-bone/40">↗</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="actions" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.3em] [&_[cmdk-group-heading]]:text-bone/40">
              <Command.Item
                value="toggle info panel show hide"
                onSelect={() => run(onToggleInfo)}
                className="flex cursor-pointer items-center gap-3 px-3 py-2 text-bone aria-selected:bg-sky-400/15 aria-selected:text-sky-200"
              >
                <span className="text-sky-300">⊞</span>
                <span>{showInfo ? "hide info panel" : "show info panel"}</span>
                <span className="ml-auto font-mono text-xs text-bone/40">[ I ]</span>
              </Command.Item>
              {onClearLog && (
                <Command.Item
                  value="clear log terminal reset"
                  onSelect={() => run(onClearLog)}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-bone aria-selected:bg-sky-400/15 aria-selected:text-sky-200"
                >
                  <span className="text-sky-300">↻</span>
                  <span>clear log</span>
                </Command.Item>
              )}
              <Command.Item
                value="open writing notes"
                onSelect={() => run(() => router.push("/writing"))}
                className="flex cursor-pointer items-center gap-3 px-3 py-2 text-bone aria-selected:bg-sky-400/15 aria-selected:text-sky-200"
              >
                <span className="text-sky-300">📜</span>
                <span>open writing</span>
                <span className="ml-auto font-mono text-xs text-bone/40">/writing</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="elsewhere" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.3em] [&_[cmdk-group-heading]]:text-bone/40">
              {[
                { label: "github · @samarnarangi", href: "https://github.com/samarnarangi" },
                { label: "x · @samarnarangi", href: "https://x.com/samarnarangi" },
                { label: "linkedin", href: "https://linkedin.com/in/samarnarangi" },
                { label: "email · hello@samar.dev", href: "mailto:hello@samar.dev" },
              ].map((e) => (
                <Command.Item
                  key={e.label}
                  value={`open ${e.label}`}
                  onSelect={() => run(() => { window.location.href = e.href; })}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-bone aria-selected:bg-emerald-400/15 aria-selected:text-emerald-200"
                >
                  <span className="text-emerald-300">↗</span>
                  <span>{e.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-bone/10 bg-bone/[0.02] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">
            <span>⌘K · command console</span>
            <span>↑↓ navigate · ↵ run</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
