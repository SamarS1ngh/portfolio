"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projects } from "@/content/projects";

const sections = [
  { id: "splash", label: "top — splash", anchor: "#splash" },
  { id: "whoami", label: "whoami — about", anchor: "#whoami" },
  { id: "work", label: "work — projects", anchor: "#work" },
  { id: "toolkit", label: "toolkit — stack", anchor: "#toolkit" },
  { id: "frequencies", label: "frequencies — interests", anchor: "#frequencies" },
  { id: "status", label: "status — now", anchor: "#status" },
  { id: "pingback", label: "pingback — contact", anchor: "#pingback" },
];

const externals = [
  { label: "github — @samarnarangi", href: "https://github.com/samarnarangi" },
  { label: "x — @samarnarangi", href: "https://x.com/samarnarangi" },
  { label: "linkedin", href: "https://linkedin.com/in/samarnarangi" },
  { label: "email — hello@samar.dev", href: "mailto:hello@samar.dev" },
  { label: "resume.pdf", href: "/resume.pdf" },
];

export function CommandPalette() {
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

  const jump = (anchor: string) => {
    setOpen(false);
    if (anchor.startsWith("#")) {
      document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(anchor);
    }
  };

  const external = (href: string) => {
    setOpen(false);
    if (href.startsWith("http") || href.startsWith("mailto")) {
      window.location.href = href;
    } else {
      router.push(href);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-ink/70 p-4 pt-[12vh] backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-ink shadow-stickerHover"
      >
        <Command className="font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-hot/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-bone/80">
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint" />
              query — samar.dev
            </span>
            <span className="text-bone/40">esc to close</span>
          </div>

          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="text-hot text-lg">⌖</span>
            <Command.Input
              autoFocus
              placeholder="search — section · project · channel"
              className="flex-1 bg-transparent text-base text-bone outline-none placeholder:text-bone/40"
            />
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-bone/40">
              nothing found
            </Command.Empty>

            <Command.Group heading="sections" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-bone/40">
              {sections.map((s) => (
                <Command.Item
                  key={s.id}
                  value={`section ${s.label}`}
                  onSelect={() => jump(s.anchor)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-bone aria-selected:bg-hot aria-selected:text-white"
                >
                  <span className="opacity-60">§</span>
                  <span>{s.label}</span>
                  <span className="ml-auto opacity-40">↵</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="work" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-bone/40">
              {projects.map((p) => (
                <Command.Item
                  key={p.slug}
                  value={`work ${p.name} ${p.blurb} ${p.tags.join(" ")}`}
                  onSelect={() => external(`/work/${p.slug}`)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-bone aria-selected:bg-violet aria-selected:text-white"
                >
                  <span className="opacity-60">▸</span>
                  <span className="font-medium">{p.name}</span>
                  <span className="opacity-60 text-sm">— {p.blurb}</span>
                  <span className="ml-auto opacity-40">→</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="elsewhere" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-bone/40">
              {externals.map((e) => (
                <Command.Item
                  key={e.label}
                  value={`external ${e.label}`}
                  onSelect={() => external(e.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-bone aria-selected:bg-sky aria-selected:text-white"
                >
                  <span className="opacity-60">↗</span>
                  <span>{e.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-bone/40">
            <span>⌘K · query</span>
            <span>↑↓ navigate · ↵ go</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
