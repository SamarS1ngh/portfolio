import { test } from "node:test";
import assert from "node:assert/strict";
import { firstSentence, splitTradeoff, shortCopy } from "./brief.ts";

const base = {
  problem: "Phones are noisy. Very noisy.",
  why: "I missed a message. It hurt.",
  architecture: "Three parts. A, B, C.",
  challenge: "Speed! Always speed.",
  scale: "One user.",
  future: "More stuff later. Maybe.",
  outcome: "It works? Mostly.",
  tradeoffs: [
    "On-device over cloud · free and offline. Cost: analysis takes battery. More text.",
    "Android only. iOS hides notifications.",
  ],
  decisions: [
    { title: "A", body: "Body A first. Second." },
    { title: "B", body: "Body B first. Second." },
  ],
};

test("firstSentence takes up to the first terminator", () => {
  assert.equal(firstSentence("Hello there. More."), "Hello there.");
  assert.equal(firstSentence("Speed! Always."), "Speed!");
  assert.equal(firstSentence("  no   terminator  "), "no terminator");
});

test("splitTradeoff splits head · body and Cost:", () => {
  assert.deepEqual(splitTradeoff(base.tradeoffs[0]), {
    gain: "On-device over cloud",
    cost: "analysis takes battery.",
  });
  assert.deepEqual(splitTradeoff(base.tradeoffs[1]), { gain: "Android only.", cost: undefined });
});

test("shortCopy falls back to first sentences with no brief", () => {
  const c = shortCopy(base);
  assert.equal(c.problem, "Phones are noisy.");
  assert.equal(c.why, "I missed a message.");
  assert.equal(c.architecture, "Three parts.");
  assert.equal(c.future, "More stuff later.");
  assert.equal(c.outcome, "It works?");
  assert.equal(c.decisions[1].tldr, "Body B first.");
  assert.equal(c.decisions[1].body, "Body B first. Second.");
  assert.equal(c.tradeoffs[0].body, base.tradeoffs[0]);
});

test("shortCopy prefers brief and falls back per index", () => {
  const c = shortCopy({
    ...base,
    brief: {
      problem: "Short problem.",
      tradeoffs: [{ gain: "G0", cost: "C0" }],
      decisions: ["tldr A"],
    },
  });
  assert.equal(c.problem, "Short problem.");
  assert.equal(c.challenge, "Speed!");
  assert.deepEqual([c.tradeoffs[0].gain, c.tradeoffs[0].cost], ["G0", "C0"]);
  assert.equal(c.tradeoffs[1].gain, "Android only.");
  assert.equal(c.decisions[0].tldr, "tldr A");
  assert.equal(c.decisions[1].tldr, "Body B first.");
});

test("shortCopy leaves why undefined when project has none", () => {
  const c = shortCopy({ ...base, why: "" });
  assert.equal(c.why, undefined);
});
