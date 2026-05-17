import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "writing · samar narangi",
  description: "notes, essays, half-thoughts. archive of the things i couldn't keep in my head.",
};

const posts: { slug: string; title: string; date: string; blurb: string; draft?: boolean }[] = [
  { slug: "still-writing", title: "still writing", date: "2026-05-17", blurb: "this archive will fill as the work continues. check back.", draft: true },
];

export default function WritingIndex() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#02050f] text-bone">
      <div
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 22%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 78% 14%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 33% 67%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 86% 78%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 50% 35%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 22% 88%, #fff 0, transparent 1px),
            radial-gradient(2px 2px at 65% 50%, #fff 0, transparent 1px)
          `,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(20,40,90,0.35) 0%, transparent 65%)" }}
      />

      <header className="relative z-20 border-b border-bone/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70 md:px-10">
          <Link href="/" className="flex items-center gap-2 hover:text-amber-300">
            <span>←</span>
            <span className="text-bone">samar.dev</span>
            <span className="text-bone/30">/</span>
            <span>writing</span>
          </Link>
          <span>{posts.length} entries</span>
        </div>
      </header>

      <article className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          ▸ writing · notes · essays
        </div>
        <h1
          className="mt-3 font-light text-5xl uppercase leading-[0.9] tracking-tight text-bone md:text-7xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          archive.
        </h1>
        <p className="mt-6 max-w-2xl font-serif text-xl italic text-bone md:text-2xl">
          notes I couldn't keep in my head. essays in progress. half-thoughts I'll regret tomorrow.
        </p>

        <ul className="mt-14 space-y-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/writing/${p.slug}`}
                className="group flex items-baseline justify-between gap-6 border-b border-bone/10 py-5 transition-colors hover:border-amber-300/50"
              >
                <span className="flex items-baseline gap-4 min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 shrink-0">
                    {p.date}
                  </span>
                  <span
                    className="font-light text-2xl uppercase tracking-wider text-bone group-hover:text-amber-300 truncate"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {p.title}
                  </span>
                  {p.draft && (
                    <span className="ml-2 border border-bone/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-bone/60">
                      draft
                    </span>
                  )}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 group-hover:text-amber-300">
                  read →
                </span>
              </Link>
              <p className="mt-2 max-w-2xl font-serif italic text-bone/80">{p.blurb}</p>
            </li>
          ))}
        </ul>

        <div className="mt-20 border-t border-bone/10 pt-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40">
          new entries land when they're done · subscribe via rss (soon)
        </div>
      </article>
    </main>
  );
}
