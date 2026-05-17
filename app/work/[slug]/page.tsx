import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, projects } from "@/content/projects";
import { regions } from "@/components/world/regions";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getProject(params.slug);
  if (!p) return { title: "not found · samar.dev" };
  return {
    title: `${p.name} · mission brief · samar narangi`,
    description: p.tagline,
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const p = getProject(params.slug);
  if (!p) notFound();
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#02050f] text-bone">
      {/* Starfield bg */}
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
            radial-gradient(2px 2px at 65% 50%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 95% 45%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 5% 50%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 40% 12%, #fff 0, transparent 1px),
            radial-gradient(1px 1px at 60% 88%, #fff 0, transparent 1px),
            radial-gradient(2px 2px at 25% 40%, #ffd76b 0, transparent 1px)
          `,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(20,40,90,0.35) 0%, transparent 65%)" }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(45deg, transparent 0 30px, rgba(125,163,255,0.4) 30px 31px, transparent 31px 60px)" }}
      />

      {/* Top HUD */}
      <header className="relative z-20 border-b border-bone/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70 md:px-10">
          <Link href="/" className="flex items-center gap-2 hover:text-amber-300">
            <span>←</span>
            <span className="text-bone">samar.dev</span>
            <span className="text-bone/30">/</span>
            <span>fabrication yards</span>
          </Link>
          <span>brief · {String(idx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            {p.status}
          </span>
        </div>
      </header>

      {/* Masthead */}
      <section className="relative z-10 overflow-hidden border-b border-bone/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute -left-10 bottom-10 h-60 w-60 rounded-full bg-violet-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-20 md:px-10 md:pt-24 md:pb-28">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60">
            <span>▸ mission brief · {p.slug}</span>
            <span className="text-amber-300/80">[ declassified ]</span>
          </div>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/70">
            [{p.year}] · {p.role}
          </div>

          <h1
            className="mt-3 font-light text-5xl uppercase leading-[0.9] tracking-tight text-bone md:text-7xl lg:text-[120px]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {p.name}
          </h1>

          <p className="mt-6 max-w-3xl font-serif text-2xl italic text-bone/95 md:text-3xl">
            {p.tagline}
          </p>

          <div className="mt-8 flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em]">
            {p.tags.map((t) => (
              <span key={t} className="border border-amber-300/30 bg-amber-300/[0.08] px-2 py-1 text-amber-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <article className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
        {/* Stack */}
        <Section index="01" label="loadout · stack">
          <ul className="flex flex-wrap gap-2 font-mono text-sm">
            {p.stack.map((s) => (
              <li key={s} className="border border-bone/15 bg-bone/[0.04] px-3 py-1.5 text-bone/90 hover:border-amber-300/30">
                {s}
              </li>
            ))}
          </ul>
        </Section>

        {/* Problem */}
        <Section index="02" label="problem · threat assessment">
          <p className="font-serif text-xl leading-[1.65] text-bone md:text-2xl">
            {p.problem}
          </p>
        </Section>

        {/* Decisions */}
        <Section index="03" label="decisions · execution log">
          <ol className="space-y-8">
            {p.decisions.map((d, i) => (
              <li key={i} className="rounded-2xl border border-bone/10 bg-bone/[0.03] p-6 backdrop-blur-sm md:p-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
                  decision · {String(i + 1).padStart(2, "0")} / {String(p.decisions.length).padStart(2, "0")}
                </div>
                <h3
                  className="mt-2 font-light text-2xl uppercase tracking-wider text-bone md:text-3xl"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {d.title}
                </h3>
                <p className="mt-3 font-serif text-lg leading-[1.7] text-bone md:text-xl md:leading-[1.65]">
                  {d.body}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Outcome */}
        <section className="mb-16 rounded-3xl border-2 border-amber-300/60 bg-amber-300/[0.06] p-8 md:p-10">
          <div className="mb-4 inline-block rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200">
            §04 · outcome · status report
          </div>
          <p className="font-serif text-2xl leading-snug text-bone md:text-3xl">
            {p.outcome}
          </p>
        </section>

        {/* Prev/Next */}
        <nav className="grid gap-3 md:grid-cols-2">
          <Link
            href={`/work/${prev.slug}`}
            className="group rounded-2xl border border-bone/10 bg-bone/[0.03] p-6 transition-all hover:border-amber-300/40 hover:bg-amber-300/[0.04]"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">← prev mission</div>
            <div
              className="mt-2 font-light text-2xl uppercase tracking-wider text-bone group-hover:text-amber-300"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {prev.name}
            </div>
            <div className="mt-1 font-serif italic text-bone/70">{prev.blurb}</div>
          </Link>
          <Link
            href={`/work/${next.slug}`}
            className="group rounded-2xl border border-bone/10 bg-bone/[0.03] p-6 text-right transition-all hover:border-amber-300/40 hover:bg-amber-300/[0.04]"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">next mission →</div>
            <div
              className="mt-2 font-light text-2xl uppercase tracking-wider text-bone group-hover:text-amber-300"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {next.name}
            </div>
            <div className="mt-1 font-serif italic text-bone/70">{next.blurb}</div>
          </Link>
        </nav>

        <div className="mt-14 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-300/10 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-amber-200 hover:bg-amber-300/20"
          >
            ◐ return to world
          </Link>
        </div>
      </article>
    </main>
  );
}

function Section({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-full border border-amber-300/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          §{index}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">{label}</span>
        <span className="h-px flex-1 bg-bone/10" />
      </div>
      {children}
    </section>
  );
}
