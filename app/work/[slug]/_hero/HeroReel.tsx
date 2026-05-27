"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src?: string;
  poster?: string;
  liveUrl?: string;
  repo?: string;
  playstoreUrl?: string;
  projectName: string;
};

export function HeroReel({ src, poster, liveUrl, repo, playstoreUrl, projectName }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [errored, setErrored] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    if (!src) {
      setErrored(true);
      return;
    }
    setHasVideo(true);
  }, [src]);

  return (
    <div className="space-y-4">
      <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-amber-300/20 bg-black shadow-[0_0_60px_-20px_rgba(255,215,107,0.35)]">
        {hasVideo && !errored ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls
            onError={() => setErrored(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <ReelPending name={projectName} expectedPath={src} />
        )}

        {/* Subtle frame highlights — only show on real video */}
        {hasVideo && !errored && (
          <>
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-amber-300/10 transition group-hover:ring-amber-300/30" />
            <div className="pointer-events-none absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-300/70">
              ▸ reel · live
            </div>
          </>
        )}
      </div>

      {(liveUrl || repo || playstoreUrl) && (
        <div className="flex flex-wrap items-center gap-2">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-300/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200 transition hover:bg-amber-300/20"
            >
              ▸ live · {prettyHost(liveUrl)}
              <span aria-hidden>↗</span>
            </a>
          )}
          {repo && (
            <a
              href={repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-bone/20 bg-bone/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/85 transition hover:border-amber-300/40 hover:text-amber-300"
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
              className="inline-flex items-center gap-2 rounded-full border border-bone/20 bg-bone/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/85 transition hover:border-amber-300/40 hover:text-amber-300"
            >
              ▸ install · play store
              <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function prettyHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ReelPending({ name, expectedPath }: { name: string; expectedPath?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_center,rgba(255,215,107,0.05)_0%,transparent_60%)]">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300 shadow-[0_0_8px_#ffd76b]" />
        reel · uplink pending
      </div>
      <div className="font-light text-2xl uppercase tracking-wider text-bone/90" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        {name}
      </div>
      {expectedPath && (
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-bone/30">
          drop file at {expectedPath}
        </div>
      )}
    </div>
  );
}
