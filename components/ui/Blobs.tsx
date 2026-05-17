"use client";

type Blob = {
  color: string;
  top: string;
  left?: string;
  right?: string;
  size: number;
  anim?: "slow" | "med" | "fast";
  blur?: number;
};

export function Blobs({ blobs }: { blobs: Blob[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`blob animate-drift-${b.anim ?? "slow"}`}
          style={{
            background: b.color,
            top: b.top,
            left: b.left,
            right: b.right,
            width: b.size,
            height: b.size,
            filter: `blur(${b.blur ?? 60}px)`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
