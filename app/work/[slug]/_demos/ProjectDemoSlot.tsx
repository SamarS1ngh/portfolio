"use client";

import dynamic from "next/dynamic";

const Loading = () => (
  <div className="grid h-[420px] place-items-center rounded-2xl border border-bone/10 bg-bone/[0.03] font-mono text-[11px] uppercase tracking-[0.3em] text-bone/40">
    <div className="flex items-center gap-3">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300 shadow-[0_0_8px_#ffd76b]" />
      booting demo
    </div>
  </div>
);

const demos = {
  jarvis: dynamic(() => import("./JarvisDemo"), { ssr: false, loading: Loading }),
} as const;

export function ProjectDemoSlot({ slug }: { slug: string }) {
  const Demo = demos[slug as keyof typeof demos];
  if (!Demo) return null;
  return <Demo />;
}
