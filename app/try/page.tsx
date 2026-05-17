import Link from "next/link";

const opts = [
  {
    href: "/try/deep-stack",
    code: "D",
    title: "DEEP STACK ★ NEW",
    sub: "fusion of B + C. 7 chambers, scroll-dive through z-depth, each scene expresses a facet.",
    bg: "#02050f",
    accent: "#ffd54a",
  },
  {
    href: "/try/cinema",
    code: "A",
    title: "CINEMA CHAPTERS",
    sub: "letterbox film. big serif. one ambient 3D centerpiece per chapter.",
    bg: "#050505",
    accent: "#fafaf3",
  },
  {
    href: "/try/observatory",
    code: "B",
    title: "OBSERVATORY ORBIT",
    sub: "drag a 3D planet. 6 project pins orbit. click to engage.",
    bg: "#020714",
    accent: "#7da3ff",
  },
  {
    href: "/try/spatial",
    code: "C",
    title: "SPATIAL · INFINITE ZOOM",
    sub: "panels float in 3D z-space. scroll = fly through depth layers.",
    bg: "#07070a",
    accent: "#a78bfa",
  },
];

export default function TryIndex() {
  return (
    <main className="min-h-screen bg-ink p-6 md:p-12">
      <header className="mx-auto max-w-6xl">
        <div className="font-mono text-[10px] uppercase tracking-widest text-bone/60">
          ▸ prototypes · try-mode
        </div>
        <h1 className="mt-3 font-display text-3xl font-light uppercase tracking-tight text-bone md:text-5xl">
          three takes. live previews.
        </h1>
        <p className="mt-3 max-w-2xl font-serif text-lg italic text-bone/70 md:text-xl">
          Each one is real — interact with it, scroll it, drag it. Pick the one that feels like the actual site you want to live with.
        </p>
      </header>

      <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {opts.map((o) => (
          <Link
            key={o.href}
            href={o.href}
            className="group block overflow-hidden rounded-2xl border border-white/10 transition-all hover:-translate-y-1 hover:border-white/30"
            style={{ background: o.bg }}
          >
            <div className="flex aspect-[4/3] flex-col justify-between p-6">
              <div className="flex items-start justify-between">
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: o.accent }}
                >
                  · option {o.code}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  try ↗
                </span>
              </div>
              <div>
                <h2
                  className="font-display text-2xl font-light uppercase leading-tight tracking-wide md:text-3xl"
                  style={{ color: o.accent }}
                >
                  {o.title}
                </h2>
                <p className="mt-3 font-serif text-sm italic leading-snug text-white/80">
                  {o.sub}
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-white/60">
              ↵ open prototype
            </div>
          </Link>
        ))}
      </div>

      <footer className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-widest text-bone/40">
        <Link href="/" className="hover:text-bone">← current site (placeholder)</Link>
      </footer>
    </main>
  );
}
