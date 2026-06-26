type Shot = { src: string; label: string };

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function MacFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-bone/15 bg-[#0a0d18] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]">
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

  return (
    <div className="space-y-6">
      {/* live demo CTA */}
      <div className="flex flex-wrap items-center gap-4 border-2 border-emerald-400/45 bg-gradient-to-r from-emerald-400/[0.12] via-emerald-400/[0.05] to-transparent px-4 py-4">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-200">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          live · public demo
        </span>
        <span className="font-sans text-sm text-bone/85">
          A real, populated workspace — no login, no sign-up. Click around the actual app.
        </span>
        <a
          href={demoUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-2 rounded-full border-2 border-emerald-400/60 bg-emerald-400/15 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-50 shadow-[0_0_24px_-6px_rgba(52,211,153,0.7)] transition hover:bg-emerald-400/25"
        >
          ▸ open live demo
          <span aria-hidden>↗</span>
        </a>
      </div>

      {/* screenshots */}
      {shots && shots.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((s) => (
            <figure key={s.src}>
              <MacFrame url={host}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={s.label}
                  loading="lazy"
                  className="w-full bg-white"
                />
              </MacFrame>
              <figcaption className="mt-2 font-mono text-[11px] leading-snug tracking-wide text-bone/60">
                {s.label}
              </figcaption>
            </figure>
          ))}
        </div>
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

      {/* keep `name` referenced for alt/aria semantics */}
      <span className="sr-only">{name} — live demo and captures</span>
    </div>
  );
}
