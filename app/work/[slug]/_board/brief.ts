import type { Project } from "@/content/projects";

export type BriefSource = Pick<
  Project,
  "problem" | "why" | "architecture" | "challenge" | "scale" | "future" | "outcome" | "tradeoffs" | "decisions" | "brief"
>;

export type ShortCopy = {
  problem: string;
  why?: string;
  architecture: string;
  challenge: string;
  scale: string;
  future: string;
  outcome: string;
  tradeoffs: { gain: string; cost?: string; body: string }[];
  decisions: { title: string; tldr: string; body: string }[];
};

export function firstSentence(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  const m = t.match(/^(.+?[.!?])(\s|$)/);
  return m ? m[1] : t;
}

// long tradeoffs read "headline · body. Cost: downside." — fall back to the first sentence
export function splitTradeoff(t: string): { gain: string; cost?: string } {
  const [head, ...rest] = t.split(" · ");
  if (rest.length === 0) return { gain: firstSentence(t), cost: undefined };
  const tail = rest.join(" · ");
  const at = tail.indexOf("Cost:");
  return { gain: head.trim(), cost: at >= 0 ? firstSentence(tail.slice(at + 5)) : undefined };
}

export function shortCopy(p: BriefSource): ShortCopy {
  const b = p.brief ?? {};
  return {
    problem: b.problem ?? firstSentence(p.problem),
    why: p.why ? b.why ?? firstSentence(p.why) : undefined,
    architecture: b.architecture ?? firstSentence(p.architecture),
    challenge: b.challenge ?? firstSentence(p.challenge),
    scale: b.scale ?? firstSentence(p.scale),
    future: b.future ?? firstSentence(p.future),
    outcome: b.outcome ?? firstSentence(p.outcome),
    tradeoffs: p.tradeoffs.map((body, i) => ({ ...(b.tradeoffs?.[i] ?? splitTradeoff(body)), body })),
    decisions: p.decisions.map((d, i) => ({
      title: d.title,
      tldr: b.decisions?.[i] ?? firstSentence(d.body),
      body: d.body,
    })),
  };
}
