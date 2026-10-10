import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, projects, type Project } from "@/content/projects";
import { regions } from "@/components/world/regions";
import { HeroReel } from "./_hero/HeroReel";
import { ProjectDemoSlot } from "./_demos/ProjectDemoSlot";
import { LiveShowcase, ShotGallery } from "./LiveShowcase";
import { NotchfyShowcase } from "./_notchfy/NotchfyShowcase";
import { Board } from "./_board/Board";

const SLUGS_WITH_DEMO = new Set(["jarvis", "nocap", "eeo-modules"]);

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getProject(params.slug);
  if (!p) return { title: "not found · samar.dev" };
  return {
    title: `${p.name} · mission brief · samar singh`,
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
      <header className="relative z-20 border-b border-bone/15 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1720px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/85 md:px-8">
          <Link href="/" className="flex items-center gap-2 hover:text-amber-300">
            <span>←</span>
            <span className="text-bone">samar.dev</span>
            <span className="hidden text-bone/40 sm:inline">/</span>
            <span className="hidden sm:inline">fabrication yards</span>
          </Link>
          <span className="hidden sm:inline">brief · {String(idx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
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

        <div className="relative mx-auto max-w-[1720px] px-4 pt-10 pb-12 md:px-8 md:pt-14 md:pb-16 lg:pt-20 lg:pb-20 2xl:pt-24 2xl:pb-28">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/80">
            <div className="flex flex-wrap items-center gap-2">
              <span>▸ mission brief · {p.slug}</span>
              {!SLUGS_WITH_DEMO.has(p.slug) && p.client && (
                <span className="inline-flex items-center gap-1.5 rounded-sm border-2 border-amber-300/70 bg-amber-300/[0.15] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-amber-100 shadow-[0_0_24px_-4px_rgba(255,213,107,0.6)]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#ffd54a] animate-pulse" />
                  freelance build · paid client work
                </span>
              )}
            </div>
            <span className="text-amber-300">[ declassified ]</span>
          </div>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/85">
            [{p.year}] · {p.role}
          </div>

          <h1
            className="mt-3 font-light uppercase leading-[0.9] tracking-tight text-bone"
            style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2rem, 6vw, 8.5rem)" }}
          >
            {p.name}
          </h1>

          <h2
            className="mt-6 font-light text-xl uppercase tracking-tight text-bone md:text-2xl"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {p.blurb}.
          </h2>

          <div className="mt-5 max-w-2xl space-y-3 font-sans text-[15px] leading-relaxed text-bone md:text-base">
            {p.tagline.split(/(?<=[.!?])\s+/).map((sentence, i) => (
              <p key={i}>{sentence}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em]">
            {p.tags.map((t) => (
              <span key={t} className="border border-amber-300/40 bg-amber-300/[0.10] px-2 py-1 uppercase tracking-wider text-amber-100">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Notchfy — product explainer: the notch in use, scene by scene */}
      {p.slug === "notchfy" && (
        <section className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
          <WideSection index="00" label="field log · live site + how it's used">
            <div className="space-y-12">
              <LiveShowcase liveUrl={p.liveUrl ?? ""} name={p.name} cta={p.liveCta} />
              <NotchfyShowcase />
            </div>
          </WideSection>
        </section>
      )}

      {/* Screens — live embed + real product captures, when present */}
      {p.liveUrl && !SLUGS_WITH_DEMO.has(p.slug) && p.slug !== "notchfy" && (
        <section className="relative z-10 mx-auto w-full max-w-[1720px] px-4 py-12 md:px-8 md:py-16">
          <WideSection index="00" label="field log · live demo + screens">
            <LiveShowcase liveUrl={p.liveUrl} shots={p.shots} name={p.name} cta={p.liveCta} />
          </WideSection>
        </section>
      )}

      {/* Wide showcase — interactive simulator when it exists. Skip §00 entirely for
          client builds without a public-friendly demo (NDA). */}
      {SLUGS_WITH_DEMO.has(p.slug) && (
        <section className="relative z-10 mx-auto w-full max-w-[1720px] px-4 py-12 md:px-8 md:py-16">
          <WideSection index="00" label="play · interactive simulator">
            <div className="space-y-4">
              <ProjectDemoSlot slug={p.slug} />
              <ExternalLinks
                liveUrl={p.liveUrl}
                repo={p.repo}
                playstoreUrl={p.playstoreUrl}
              />
            </div>
          </WideSection>
        </section>
      )}

      {/* Screens only — real captures for projects without a live URL or simulator */}
      {!p.liveUrl && !SLUGS_WITH_DEMO.has(p.slug) && p.shots && p.shots.length > 0 && (
        <section className="relative z-10 mx-auto w-full max-w-[1720px] px-4 py-12 md:px-8 md:py-16">
          <WideSection index="00" label="field log · screens">
            <div className="space-y-4">
              <ShotGallery shots={p.shots} frameUrl={p.name.toLowerCase()} name={p.name} />
              <ExternalLinks repo={p.repo} playstoreUrl={p.playstoreUrl} />
            </div>
          </WideSection>
        </section>
      )}

      {/* Confident client-build dossier · anonymized freelance work only */}
      {!SLUGS_WITH_DEMO.has(p.slug) && p.client && (
        <section className="relative z-10 mx-auto w-full max-w-[1720px] px-4 pt-8 pb-12 md:px-8 md:pt-12 md:pb-20">
          <ClientDossier project={p} />
        </section>
      )}

      {/* Wide body — uses the full canvas, mixes column shapes for liveliness */}
      <article className="relative z-10 mx-auto max-w-[1280px] px-4 pb-20 md:px-8">
        <div className="mb-16">
          <Board project={p} />
        </div>

        <nav className="grid gap-3 md:grid-cols-2">
          <Link
            href={`/work/${prev.slug}`}
            className="group border-2 border-bone/15 bg-[#04060e]/80 p-5 transition-all hover:border-amber-300/50 hover:bg-amber-300/[0.06]"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">← prev mission</div>
            <div
              className="mt-2 font-light text-2xl uppercase tracking-tight text-bone group-hover:text-amber-300"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {prev.name}
            </div>
            <div className="mt-1 font-sans text-sm text-bone/85">{prev.blurb}</div>
          </Link>
          <Link
            href={`/work/${next.slug}`}
            className="group border-2 border-bone/15 bg-[#04060e]/80 p-5 text-right transition-all hover:border-amber-300/50 hover:bg-amber-300/[0.06]"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">next mission →</div>
            <div
              className="mt-2 font-light text-2xl uppercase tracking-tight text-bone group-hover:text-amber-300"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {next.name}
            </div>
            <div className="mt-1 font-sans text-sm text-bone/85">{next.blurb}</div>
          </Link>
        </nav>

        <div className="mt-14 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-300/15 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-amber-200 hover:bg-amber-300/25"
          >
            ◐ return to world
          </Link>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/75 hover:text-amber-300"
          >
            ↳ came here from the resume? grab the full pdf
          </a>
        </div>
      </article>
    </main>
  );
}

function ExternalLinks({
  liveUrl,
  repo,
  playstoreUrl,
}: {
  liveUrl?: string;
  repo?: string;
  playstoreUrl?: string;
}) {
  if (!liveUrl && !repo && !playstoreUrl) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-amber-300/50 bg-amber-300/[0.10] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-100 transition hover:bg-amber-300/20"
        >
          ▸ live · {(() => { try { return new URL(liveUrl).hostname.replace(/^www\./, ""); } catch { return liveUrl; } })()}
          <span aria-hidden>↗</span>
        </a>
      )}
      {repo && (
        <a
          href={repo}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-bone/20 bg-bone/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/90 transition hover:border-amber-300/40 hover:text-amber-300"
        >
          ▸ source · github
          <span aria-hidden>↗</span>
        </a>
      )}
      {playstoreUrl && (
        <a
          href={playstoreUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-bone/20 bg-bone/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/90 transition hover:border-amber-300/40 hover:text-amber-300"
        >
          ▸ install · play store
          <span aria-hidden>↗</span>
        </a>
      )}
    </div>
  );
}

function WideSection({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-full border border-amber-300/50 bg-amber-300/[0.06] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
          §{index}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">{label}</span>
        <span className="h-px flex-1 bg-bone/15" />
      </div>
      {children}
    </section>
  );
}

// ─── ClientDossier · anonymized client-build hero block ───────────────

const ACCENT_TONES: Record<string, { hex: string; border: string; bg: string; text: string }> = {
  amber: { hex: "#ffd54a", border: "border-amber-300/55", bg: "bg-amber-300/[0.08]", text: "text-amber-200" },
  emerald: { hex: "#34d399", border: "border-emerald-400/55", bg: "bg-emerald-400/[0.08]", text: "text-emerald-200" },
  violet: { hex: "#a78bfa", border: "border-violet-400/55", bg: "bg-violet-400/[0.08]", text: "text-violet-200" },
  sky: { hex: "#38bdf8", border: "border-sky-400/55", bg: "bg-sky-400/[0.08]", text: "text-sky-200" },
  rose: { hex: "#fb7185", border: "border-rose-400/55", bg: "bg-rose-400/[0.08]", text: "text-rose-200" },
};

function ClientDossier({ project: p }: { project: Project }) {
  const metrics = p.heroMetrics ?? [];
  const ts = p.testimonials ?? [];

  return (
    <div className="space-y-4">
      {/* prominent freelance stamp */}
      <div className="flex flex-wrap items-center gap-3 border-2 border-amber-300/55 bg-gradient-to-r from-amber-300/[0.12] via-amber-300/[0.06] to-transparent px-4 py-3">
        <span className="inline-flex items-center gap-2 rounded-sm border border-amber-300/65 bg-amber-300/25 px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.32em] text-amber-50 shadow-[0_0_20px_-2px_rgba(255,213,107,0.55)]">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_10px_#ffd54a] animate-pulse" />
          freelance build · paid client work
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-100/85">
          {p.role.replace(/^freelance\s+/, "")}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50">
          {p.client?.named ? "public client · live site" : "anonymized · client identity protected"}
        </span>
      </div>

      {/* status / context row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/55 bg-emerald-400/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-100">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          live · in production
        </span>
        {p.client?.industry && (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200">
            <span>▸ client</span>
            <span className="text-bone/40">·</span>
            <span>{p.client.industry}</span>
          </span>
        )}
        {p.client?.region && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/75">
            <span className="text-bone/45">▸</span>
            {p.client.region}
          </span>
        )}
        {p.client?.engagement && (
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60">
            · {p.client.engagement}
          </span>
        )}
      </div>

      {/* hero metrics */}
      {metrics.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map((m) => {
            const a = ACCENT_TONES[m.accent ?? "amber"];
            return (
              <div
                key={m.k}
                className="relative overflow-hidden border-2 bg-[#04060e]/96 px-5 py-5 backdrop-blur-sm"
                style={{
                  borderColor: a.hex + "55",
                  boxShadow: `0 0 32px -12px ${a.hex}80`,
                }}
              >
                <div
                  className="font-mono text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: a.hex }}
                >
                  {m.k}
                </div>
                <div
                  className="mt-2 font-light text-5xl uppercase leading-none tracking-tight text-bone md:text-6xl"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {m.v}
                </div>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full"
                  style={{ background: `radial-gradient(circle, ${a.hex}22, transparent 70%)` }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* testimonial cards · 2 portraits, vertical */}
      {ts.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-bone/65">
            <span>▸ testimonials · client side</span>
            <span className="text-bone/45">
              illustrated · paraphrased · identifying details removed
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ts.map((t, i) => {
              const a = ACCENT_TONES[t.accent];
              return (
                <article
                  key={i}
                  className={`flex h-full flex-col items-center border-2 ${a.border} ${a.bg} px-5 py-6 text-center backdrop-blur-sm md:px-6 md:py-7`}
                >
                  {/* portrait · small circle, centered */}
                  <div
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2"
                    style={{
                      borderColor: a.hex,
                      boxShadow: `0 0 16px -2px ${a.hex}80`,
                    }}
                  >
                    <img
                      src={`https://randomuser.me/api/portraits/${t.photo.gender}/${t.photo.id}.jpg`}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* role chip */}
                  <span
                    className={`mt-3 inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] ${a.border} ${a.bg} ${a.text}`}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: a.hex, boxShadow: `0 0 6px ${a.hex}` }}
                    />
                    {t.role}
                  </span>

                  {/* quote body */}
                  <blockquote className="mt-4 font-sans text-[15px] leading-relaxed text-bone">
                    <span style={{ color: a.hex }} className="text-xl font-bold">
                      “
                    </span>
                    {t.quote}
                    <span style={{ color: a.hex }} className="text-xl font-bold">
                      ”
                    </span>
                  </blockquote>

                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <span className="inline-block h-px w-5 bg-bone/40" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/55">
                      client-side voice
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarBlock({ initials, hex }: { initials: string; hex: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width="80"
      height="80"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <radialGradient id={`avg-${initials}`} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor={hex} stopOpacity="0.95" />
          <stop offset="100%" stopColor={hex} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="76"
        height="76"
        rx="12"
        fill={`url(#avg-${initials})`}
        stroke={hex}
        strokeOpacity="0.9"
        strokeWidth="1.5"
      />
      {/* scan-line texture */}
      <rect
        x="2"
        y="2"
        width="76"
        height="76"
        rx="12"
        fill="url(#avg-lines)"
        opacity="0.18"
      />
      <pattern id="avg-lines" patternUnits="userSpaceOnUse" width="6" height="6">
        <path d="M 0 6 L 6 0" stroke="#000" strokeWidth="0.5" />
      </pattern>
      <text
        x="40"
        y="50"
        textAnchor="middle"
        fontSize="28"
        fontFamily="var(--font-space-grotesk), system-ui"
        fontWeight="300"
        fill="#04060e"
        style={{ letterSpacing: "0.04em" }}
      >
        {initials}
      </text>
    </svg>
  );
}
