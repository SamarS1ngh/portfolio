import type { Project } from "@/content/projects";
import { shortCopy } from "./brief";
import { HudPanel } from "./HudPanel";
import { MilestoneTrack, StatTiles, StatusGauge } from "./parts";

// bento HUD board — replaces the old §01–§10 prose sections
export function Board({ project: p }: { project: Project }) {
  const c = shortCopy(p);
  const personal = !p.client;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
      {/* loadout strip */}
      <HudPanel index="01" label="loadout · stack + spec" className="md:col-span-2 lg:col-span-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {p.stack.map((s) => (
              <span key={s} className="border border-amber-300/40 bg-amber-300/[0.10] px-2 py-1 uppercase tracking-wider text-amber-100">
                {s}
              </span>
            ))}
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.25em]">
            <div className="flex gap-2"><dt className="text-bone/45">year</dt><dd className="text-bone">{p.year}</dd></div>
            <div className="flex gap-2"><dt className="text-bone/45">role</dt><dd className="text-bone">{p.role}</dd></div>
          </dl>
        </div>
      </HudPanel>

      <HudPanel
        index="02"
        label="the problem"
        headline={c.problem}
        detail={p.problem}
        className={personal ? "md:col-span-2 lg:col-span-2" : "md:col-span-2 lg:col-span-4"}
      />
      {personal && c.why && (
        <HudPanel index="03" label="why i built it" headline={c.why} detail={p.why} className="lg:col-span-2" />
      )}
      <HudPanel index="04" label="signal" className={"lg:col-span-2" + (personal ? "" : " md:col-span-2")}>
        <StatusGauge status={p.status} />
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300">● {p.status}</div>
      </HudPanel>

      <HudPanel
        index="05"
        label="architecture · how it's wired"
        accent="violet"
        headline={c.architecture}
        detail={p.architecture}
        className="md:col-span-2 lg:col-span-4"
      >
        {p.architectureMap && (
          <pre className="overflow-x-auto border border-violet-400/20 bg-black/70 p-4 font-mono text-[11.5px] leading-[1.5] text-violet-100 md:text-[12.5px]">
            {p.architectureMap}
          </pre>
        )}
      </HudPanel>
      <HudPanel
        index="06"
        label="the hard part"
        accent="rose"
        headline={c.challenge}
        detail={p.challenge}
        className="md:col-span-2 lg:col-span-2"
      >
        {p.challengeStats && <StatTiles items={p.challengeStats} tone="rose" />}
      </HudPanel>

      <HudPanel index="07" label={`key calls · ${c.decisions.length}`} className="md:col-span-2 lg:col-span-4">
        <ol className="grid gap-3 sm:grid-cols-2">
          {c.decisions.map((d, i) => (
            <li key={d.title} className="min-w-0 border border-amber-300/20 bg-black/40 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
                call · {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-2 font-sans text-[15px] font-medium text-bone">{d.title}</div>
              <p className="mt-1.5 font-sans text-[13.5px] leading-relaxed text-bone/65">{d.tldr}</p>
              <details className="group mt-2">
                <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.3em] text-bone/45 hover:text-amber-300">
                  <span className="group-open:hidden">▸ decrypt</span>
                  <span className="hidden group-open:inline">▾ collapse</span>
                </summary>
                <p className="mt-2 font-sans text-[13.5px] leading-relaxed text-bone/75">{d.body}</p>
              </details>
            </li>
          ))}
        </ol>
      </HudPanel>
      <HudPanel
        index="08"
        label="scale · how it holds up"
        accent="sky"
        headline={c.scale}
        detail={p.scale}
        className="md:col-span-2 lg:col-span-2"
      >
        {p.scaleStats && <StatTiles items={p.scaleStats} tone="sky" />}
      </HudPanel>

      {personal && c.tradeoffs.length > 0 && (
        <HudPanel index="09" label="tradeoffs · what i gave up" accent="bone" className="md:col-span-2 lg:col-span-6">
          <ul className="grid gap-3 md:grid-cols-2">
            {c.tradeoffs.map((t, i) => (
              <li key={i} className="min-w-0 border border-bone/10 bg-black/40 p-4">
                <div className="font-sans text-[14px] text-emerald-200">▲ {t.gain}</div>
                {t.cost && <div className="mt-1 font-sans text-[14px] text-rose-200/90">▼ {t.cost}</div>}
                <details className="group mt-2">
                  <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.3em] text-bone/45 hover:text-amber-300">
                    <span className="group-open:hidden">▸ decrypt</span>
                    <span className="hidden group-open:inline">▾ collapse</span>
                  </summary>
                  <p className="mt-2 font-sans text-[13.5px] leading-relaxed text-bone/75">{t.body}</p>
                </details>
              </li>
            ))}
          </ul>
        </HudPanel>
      )}

      <HudPanel
        index="10"
        label="roadmap · what's next"
        accent="emerald"
        headline={p.futureMilestones ? undefined : c.future}
        detail={p.futureMilestones ? undefined : p.future}
        className="md:col-span-2 lg:col-span-4"
      >
        {p.futureMilestones && <MilestoneTrack items={p.futureMilestones} />}
      </HudPanel>
      <HudPanel
        index="11"
        label={`outcome · ${p.status}`}
        headline={c.outcome}
        detail={p.outcome}
        className="md:col-span-2 lg:col-span-2"
      />
    </div>
  );
}
