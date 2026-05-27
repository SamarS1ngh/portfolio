"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  MarkerType,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type ModuleId = "sso" | "org" | "pm" | "ledger" | "wiring";

const MODULE_META: Record<
  Exclude<ModuleId, "wiring">,
  { label: string; sub: string; hex: string; border: string; bg: string; text: string }
> = {
  sso: {
    label: "SSO",
    sub: "identity · jwt",
    hex: "#fbbf24",
    border: "border-amber-300/60",
    bg: "bg-amber-300/[0.07]",
    text: "text-amber-200",
  },
  org: {
    label: "ORG",
    sub: "people · rbac",
    hex: "#34d399",
    border: "border-emerald-400/60",
    bg: "bg-emerald-400/[0.07]",
    text: "text-emerald-200",
  },
  pm: {
    label: "PM",
    sub: "tickets · sprints",
    hex: "#a78bfa",
    border: "border-violet-400/60",
    bg: "bg-violet-400/[0.07]",
    text: "text-violet-200",
  },
  ledger: {
    label: "LEDGER",
    sub: "docs · pages · wiki",
    hex: "#38bdf8",
    border: "border-sky-400/60",
    bg: "bg-sky-400/[0.07]",
    text: "text-sky-200",
  },
};

// live URLs per module · iframe sources. fill in real URLs when ready.
const MODULE_URLS: Record<Exclude<ModuleId, "wiring">, string | null> = {
  sso: "https://www.easyenterpriseos.com/",
  org: "https://organization.easyenterpriseos.com",
  pm: "https://project.easyenterpriseos.com/",
  ledger: null,
};

export default function EEODemo() {
  const [tab, setTab] = useState<ModuleId>("sso");
  const meta = tab !== "wiring" ? MODULE_META[tab] : null;
  // reload counter per tab · cross-origin iframes can't be navigated via JS,
  // so we remount the iframe (which resets it to its initial URL).
  const [reloadKey, setReloadKey] = useState<Record<string, number>>({});
  const bumpReload = (t: ModuleId) =>
    setReloadKey((k) => ({ ...k, [t]: (k[t] ?? 0) + 1 }));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-bone/15 bg-gradient-to-b from-slate-900/70 to-slate-950/85 p-4 backdrop-blur-md md:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(125,163,255,0.5) 0 1px, transparent 1px 3px)",
        }}
      />

      {/* HUD */}
      <div className="relative flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-300/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-100">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#ffd54a] animate-pulse" />
          enterpriseos · web sim
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55">
          ▸ live mock data · no backend hits
        </span>
        <a
          href="https://www.easyenterpriseos.com/"
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-bone/25 bg-bone/[0.05] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/85 transition hover:border-amber-300/50 hover:text-amber-300"
        >
          open live ↗
        </a>
      </div>

      {/* Tab bar · big, clickable, flashy */}
      <div className="relative mt-4 flex flex-wrap gap-2">
        {(Object.keys(MODULE_META) as Exclude<ModuleId, "wiring">[]).map((id) => {
          const m = MODULE_META[id];
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`group relative flex items-center gap-2.5 overflow-hidden rounded-md border-2 px-4 py-2.5 font-mono uppercase transition-all duration-200 hover:-translate-y-0.5 ${
                active
                  ? `${m.border} ${m.bg} ${m.text}`
                  : "border-bone/20 bg-bone/[0.04] text-bone/80 hover:border-bone/40 hover:bg-bone/[0.07] hover:text-bone"
              }`}
              style={{
                boxShadow: active
                  ? `0 0 24px -4px ${m.hex}, inset 0 1px 0 ${m.hex}40`
                  : undefined,
              }}
            >
              {/* hover sweep */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-500 group-hover:translate-x-full"
              />
              {/* active accent stripe (left) */}
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-1"
                  style={{
                    background: m.hex,
                    boxShadow: `0 0 8px ${m.hex}`,
                  }}
                />
              )}
              <span
                className={`relative inline-block h-2 w-2 rounded-full ${
                  active ? "animate-pulse" : ""
                }`}
                style={{
                  background: m.hex,
                  boxShadow: active
                    ? `0 0 8px ${m.hex}, 0 0 14px ${m.hex}80`
                    : `0 0 4px ${m.hex}60`,
                }}
              />
              <span className="relative text-[13px] font-extrabold tracking-[0.22em]">
                {m.label}
              </span>
              <span
                className={`relative text-[10px] tracking-[0.22em] ${
                  active ? "text-bone/70" : "text-bone/50"
                }`}
              >
                · {m.sub}
              </span>
              {/* active glyph */}
              {active ? (
                <span
                  className="relative ml-0.5 text-[10px] font-bold"
                  style={{ color: m.hex }}
                >
                  ▸
                </span>
              ) : (
                <span className="relative ml-0.5 text-[10px] text-bone/40 transition group-hover:text-bone/80">
                  ↗
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setTab("wiring")}
          className={`group relative flex items-center gap-2.5 overflow-hidden rounded-md border-2 px-4 py-2.5 font-mono uppercase transition-all duration-200 hover:-translate-y-0.5 ${
            tab === "wiring"
              ? "border-bone/50 bg-bone/[0.1] text-bone"
              : "border-bone/20 bg-bone/[0.04] text-bone/80 hover:border-bone/40 hover:bg-bone/[0.07] hover:text-bone"
          }`}
          style={{
            boxShadow:
              tab === "wiring"
                ? "0 0 24px -4px rgba(250,250,243,0.45), inset 0 1px 0 rgba(250,250,243,0.18)"
                : undefined,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-500 group-hover:translate-x-full"
          />
          {tab === "wiring" && (
            <span
              aria-hidden
              className="absolute left-0 top-0 h-full w-1 bg-bone/85 shadow-[0_0_8px_rgba(250,250,243,0.7)]"
            />
          )}
          <span
            className={`relative inline-block h-2 w-2 rounded-full bg-bone/80 ${
              tab === "wiring" ? "animate-pulse" : ""
            }`}
            style={{
              boxShadow:
                tab === "wiring"
                  ? "0 0 8px rgba(250,250,243,0.9), 0 0 14px rgba(250,250,243,0.5)"
                  : "0 0 4px rgba(250,250,243,0.4)",
            }}
          />
          <span className="relative text-[13px] font-extrabold tracking-[0.22em]">
            WIRING
          </span>
          <span
            className={`relative text-[10px] tracking-[0.22em] ${
              tab === "wiring" ? "text-bone/70" : "text-bone/50"
            }`}
          >
            · how it connects
          </span>
          {tab === "wiring" ? (
            <span className="relative ml-0.5 text-[10px] font-bold text-bone">▸</span>
          ) : (
            <span className="relative ml-0.5 text-[10px] text-bone/40 transition group-hover:text-bone/80">
              ↗
            </span>
          )}
        </button>
      </div>

      {/* Active module panel */}
      <div
        className={`relative mt-4 rounded-xl border-2 bg-[#04060e]/95 p-3 backdrop-blur-sm md:p-4 ${
          meta ? meta.border : "border-bone/25"
        }`}
        style={{
          boxShadow: meta ? `0 0 30px -10px ${meta.hex}55` : undefined,
        }}
      >
        {/* mini browser chrome */}
        {(() => {
          const url =
            tab === "wiring"
              ? "https://stack.easyenterpriseos.com"
              : MODULE_URLS[tab] ?? `https://${tab}.easyenterpriseos.com`;
          const isLive = tab !== "wiring" && MODULE_URLS[tab] !== null;
          return (
            <div className="mb-3 flex items-center gap-2 border-b border-bone/10 pb-2.5">
              <span className="h-2 w-2 rounded-full bg-rose-400/70" />
              <span className="h-2 w-2 rounded-full bg-amber-300/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
              {isLive && (
                <div className="ml-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => bumpReload(tab)}
                    title="reload"
                    aria-label="reload iframe"
                    className="grid h-6 w-6 place-items-center rounded border border-bone/15 bg-bone/[0.04] font-mono text-[11px] text-bone/80 transition hover:border-amber-300/50 hover:text-amber-300"
                  >
                    ↻
                  </button>
                  <button
                    type="button"
                    onClick={() => bumpReload(tab)}
                    title="home · reset iframe to module URL"
                    aria-label="home"
                    className="grid h-6 w-6 place-items-center rounded border border-bone/15 bg-bone/[0.04] font-mono text-[11px] text-bone/80 transition hover:border-amber-300/50 hover:text-amber-300"
                  >
                    ⌂
                  </button>
                </div>
              )}
              <div className="ml-1 flex-1 truncate rounded border border-bone/15 bg-bone/[0.04] px-2 py-1 font-mono text-[10px] text-bone/75">
                <span className={isLive ? "text-emerald-300" : "text-amber-300"}>
                  ●
                </span>{" "}
                {url}
              </div>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.3em] ${
                  isLive ? "text-emerald-300" : "text-amber-300/80"
                }`}
              >
                {isLive ? "live · iframe" : "pending · mock"}
              </span>
              {isLive && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-bone/20 bg-bone/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-bone/80 hover:border-amber-300/50 hover:text-amber-300"
                >
                  open ↗
                </a>
              )}
            </div>
          );
        })()}

        {tab !== "wiring" ? (
          MODULE_URLS[tab] ? (
            <>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded border border-amber-300/35 bg-amber-300/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-100">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#ffd54a]" />
                  iframed preview · google login + a few flows are blocked inside frames
                </span>
                <a
                  href={MODULE_URLS[tab] ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-amber-300/55 bg-amber-300/15 px-2 py-0.5 font-semibold text-amber-200 transition hover:bg-amber-300/25"
                >
                  open in new tab for full access ↗
                </a>
              </div>
              <iframe
                key={`${tab}-${reloadKey[tab] ?? 0}`}
                src={MODULE_URLS[tab] ?? ""}
                title={`${MODULE_META[tab].label} module`}
                className="block h-[820px] max-h-[85vh] w-full rounded border border-bone/15 bg-white"
                loading="lazy"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                referrerPolicy="no-referrer"
              />
            </>
          ) : (
            <LedgerPreview meta={MODULE_META[tab]} />
          )
        ) : (
          <WiringPanel />
        )}
      </div>

      {/* persistent footer · live trace */}
      <LiveTrace tab={tab} />
    </div>
  );
}

// ─── SSO ───────────────────────────────────────────────────────────

function LedgerPreview({
  meta,
}: {
  meta: typeof MODULE_META["ledger"];
}) {
  const features: { state: "wip" | "planned"; label: string; sub: string }[] = [
    { state: "wip", label: "Block editor", sub: "Headings, lists, code, embeds, slash commands." },
    { state: "wip", label: "Page tree", sub: "Nested pages with drag-to-reorder." },
    { state: "wip", label: "Full-text search", sub: "Search across every page and tag." },
    { state: "planned", label: "Realtime collab", sub: "Multiplayer cursors and block-level CRDT." },
    { state: "planned", label: "Wired into PM and Org", sub: "Attach a spec to any ticket. Uses Org's RBAC — no separate role table." },
    { state: "planned", label: "Markdown import / export", sub: "Bring docs from Notion or Obsidian. Round-trip out." },
  ];

  return (
    <div className="flex h-[820px] max-h-[85vh] w-full flex-col overflow-hidden rounded-md border border-sky-400/25 bg-sky-400/[0.04]">
      {/* header */}
      <div className="border-b border-sky-400/20 px-6 py-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: meta.hex, boxShadow: `0 0 8px ${meta.hex}` }}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-sky-200">
            ledger · docs and wiki
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-300/55 bg-amber-300/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-100">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#ffd54a] animate-pulse" />
            work in progress
          </span>
        </div>
        <h3
          className="mt-3 font-light text-3xl uppercase tracking-tight text-bone md:text-4xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          A Notion-style workspace, wired into the rest.
        </h3>
        <p className="mt-3 max-w-2xl font-sans text-[15px] leading-relaxed text-bone/85">
          Block editor, nested pages, full-text search, realtime collab.
          Permissions come from Org. PM tickets can hang a spec doc right next
          to them. No separate user table — same login, same roles.
        </p>
      </div>

      {/* feature list — vertical, readable */}
      <ul className="flex-1 divide-y divide-bone/10 overflow-y-auto">
        {features.map((f, i) => {
          const isWip = f.state === "wip";
          return (
            <li key={i} className="flex items-start gap-3 px-6 py-3">
              <span
                className={`mt-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                  isWip
                    ? "border border-amber-300/55 bg-amber-300/15 text-amber-200"
                    : "border border-bone/25 bg-bone/[0.04] text-bone/65"
                }`}
              >
                {isWip ? "◐" : "○"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-sans text-[15px] font-medium text-bone">
                    {f.label}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
                      isWip ? "text-amber-300" : "text-bone/45"
                    }`}
                  >
                    {isWip ? "in progress" : "planned"}
                  </span>
                </div>
                <div className="mt-0.5 font-sans text-[13.5px] leading-relaxed text-bone/70">
                  {f.sub}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Wiring · React Flow architecture graph ──────────────────────

function ModuleFlowNode({ data }: NodeProps) {
  const d = data as { id: Exclude<ModuleId, "wiring"> };
  const meta = MODULE_META[d.id];
  return (
    <div
      className={`relative w-[170px] rounded-md border-2 ${meta.border} ${meta.bg} px-3 py-2.5 backdrop-blur-sm`}
      style={{ boxShadow: `0 0 20px -8px ${meta.hex}` }}
    >
      <Handle type="target" position={Position.Left} style={{ background: meta.hex, width: 6, height: 6, border: "none" }} />
      <Handle type="source" position={Position.Right} style={{ background: meta.hex, width: 6, height: 6, border: "none" }} />
      <Handle type="target" position={Position.Top} style={{ background: meta.hex, width: 6, height: 6, border: "none" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: meta.hex, width: 6, height: 6, border: "none" }} />
      <div className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: meta.hex }}>
        ▸ module
      </div>
      <div
        className="mt-0.5 font-light text-xl uppercase leading-none tracking-tight text-bone"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {meta.label}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-bone/65">
        {meta.sub}
      </div>
    </div>
  );
}

function ClientFlowNode() {
  return (
    <div className="w-[140px] rounded-md border-2 border-bone/45 bg-bone/[0.06] px-3 py-2 backdrop-blur-sm">
      <Handle type="source" position={Position.Right} style={{ background: "#fafaf3", width: 6, height: 6, border: "none" }} />
      <Handle type="target" position={Position.Right} id="t-right" style={{ background: "#fafaf3", width: 6, height: 6, border: "none" }} />
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone/75">▸ client</div>
      <div
        className="mt-0.5 font-light text-lg uppercase leading-none tracking-tight text-bone"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        browser
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-bone/65">
        tRPC · JWT
      </div>
    </div>
  );
}

const flowNodeTypes = {
  module: ModuleFlowNode,
  client: ClientFlowNode,
};

// clean left-to-right pipeline · minimal crossings
const FLOW_NODES: Node[] = [
  { id: "browser", type: "client", position: { x: -340, y: 100 }, data: {}, draggable: false },
  { id: "sso", type: "module", position: { x: -60, y: -40 }, data: { id: "sso" }, draggable: false },
  { id: "org", type: "module", position: { x: -60, y: 220 }, data: { id: "org" }, draggable: false },
  { id: "pm", type: "module", position: { x: 240, y: -40 }, data: { id: "pm" }, draggable: false },
  { id: "ledger", type: "module", position: { x: 240, y: 220 }, data: { id: "ledger" }, draggable: false },
];

type FlowEdgeDef = { id: string; source: string; target: string; label: string; color: string };

// only 5 essential relations · all left-to-right or top-to-bottom
const FLOW_EDGES: FlowEdgeDef[] = [
  { id: "browser-sso", source: "browser", target: "sso", label: "login → jwt", color: "#fbbf24" },
  { id: "sso-org", source: "sso", target: "org", label: "provision user", color: "#fbbf24" },
  { id: "org-pm", source: "org", target: "pm", label: "rbac (write?)", color: "#34d399" },
  { id: "org-ledger", source: "org", target: "ledger", label: "rbac (read?)", color: "#34d399" },
  { id: "pm-ledger", source: "pm", target: "ledger", label: "attach doc", color: "#a78bfa" },
];

function WiringPanel() {
  const edges: Edge[] = FLOW_EDGES.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: true,
    label: e.label,
    labelStyle: {
      fill: e.color,
      fontFamily: "var(--font-geist-mono), monospace",
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: "0.05em",
    },
    labelBgStyle: { fill: "#02050f", fillOpacity: 0.95 },
    labelBgPadding: [4, 2] as [number, number],
    labelBgBorderRadius: 3,
    style: { stroke: e.color, strokeWidth: 1.2, strokeOpacity: 0.7 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: e.color,
      width: 14,
      height: 14,
    },
  }));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/80">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#ffd54a]" />
          core request pipeline · left to right
        </span>
        <span className="text-bone/55">
          every PM/Ledger call also verifies JWT via SSO jwks
        </span>
      </div>

      <div
        className="rounded-md border border-bone/15 bg-black/40 overflow-hidden"
        style={{ height: 540 }}
      >
        <ReactFlow
          nodes={FLOW_NODES}
          edges={edges}
          nodeTypes={flowNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
        >
          <Background variant={BackgroundVariant.Dots} color="#475569" gap={18} size={1} />
        </ReactFlow>
      </div>

      {/* dark theme overrides for react-flow */}
      <style jsx global>{`
        .react-flow__edge-text {
          fill: currentColor;
        }
        .react-flow__edge-textbg {
          fill: #02050f;
          fill-opacity: 0.95;
        }
        .react-flow__handle {
          opacity: 0;
        }
        .react-flow__attribution {
          display: none;
        }
      `}</style>
    </div>
  );
}

// ─── Shared bits ───────────────────────────────────────────────────

function StatBlock({
  label,
  value,
  hex,
}: {
  label: string;
  value: string;
  hex: string;
}) {
  return (
    <div
      className="rounded border bg-bone/[0.04] px-2.5 py-2"
      style={{ borderColor: `${hex}55` }}
    >
      <div className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: hex }}>
        {label}
      </div>
      <div
        className="mt-1 font-light text-xl uppercase tracking-tight text-bone"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {value}
      </div>
    </div>
  );
}

function LiveTrace({ tab }: { tab: ModuleId }) {
  type Entry = {
    ts: string;
    method: string;
    path: string;
    status: number;
    ms: number;
  };
  const POOL: Record<ModuleId, Entry[]> = {
    sso: [
      { ts: "14:23:01", method: "POST", path: "/sso/login", status: 200, ms: 142 },
      { ts: "14:23:02", method: "GET", path: "/sso/.well-known/jwks", status: 200, ms: 12 },
      { ts: "14:23:14", method: "POST", path: "/sso/refresh", status: 200, ms: 22 },
      { ts: "14:23:27", method: "POST", path: "/sso/passkey/enroll", status: 201, ms: 88 },
    ],
    org: [
      { ts: "14:23:02", method: "POST", path: "/org/whoami", status: 200, ms: 18 },
      { ts: "14:23:09", method: "POST", path: "/org/can/u:42/pm.write", status: 200, ms: 22 },
      { ts: "14:23:18", method: "GET", path: "/org/teams", status: 200, ms: 34 },
      { ts: "14:23:24", method: "POST", path: "/org/can/u:08/ledger.write", status: 200, ms: 19 },
    ],
    pm: [
      { ts: "14:24:01", method: "POST", path: "/pm/tickets", status: 201, ms: 87 },
      { ts: "14:24:08", method: "GET", path: "/pm/sprints/14", status: 200, ms: 26 },
      { ts: "14:24:18", method: "POST", path: "/pm/tickets/SAM-247/close", status: 200, ms: 64 },
    ],
    ledger: [
      { ts: "14:25:33", method: "GET", path: "/ledger/pages/p:2147", status: 200, ms: 64 },
      { ts: "14:25:42", method: "POST", path: "/ledger/blocks", status: 201, ms: 38 },
      { ts: "14:25:51", method: "GET", path: "/ledger/search?q=onboarding", status: 200, ms: 92 },
    ],
    wiring: [
      { ts: "14:26:01", method: "GET", path: "/_health/all-modules", status: 200, ms: 8 },
      { ts: "14:26:09", method: "GET", path: "/sso/.well-known/jwks", status: 200, ms: 4 },
      { ts: "14:26:09", method: "POST", path: "/org/can/u:42/pm.write", status: 200, ms: 19 },
    ],
  };

  const [log, setLog] = useState<Entry[]>([]);

  useEffect(() => {
    const entries = POOL[tab];
    let cancelled = false;
    setLog([]);
    entries.forEach((entry, i) => {
      setTimeout(() => {
        if (!cancelled) setLog((l) => [...l, entry].slice(-6));
      }, 400 + i * 650);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="relative mt-4 rounded-xl border border-bone/15 bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300">
        <span>[ live trace · {tab === "wiring" ? "stack" : tab} ]</span>
        <span className="flex items-center gap-1 text-emerald-300">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          streaming
        </span>
      </div>
      <div className="space-y-1 font-mono text-[10.5px]">
        {log.length === 0 && (
          <div className="text-bone/40">awaiting requests…</div>
        )}
        {log.map((e, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span className="text-bone/40">{e.ts}</span>
            <span
              className={
                e.method === "GET"
                  ? "text-sky-300"
                  : e.method === "POST"
                  ? "text-emerald-300"
                  : "text-amber-300"
              }
            >
              {e.method}
            </span>
            <span className="flex-1 truncate text-bone/85">{e.path}</span>
            <span
              className={
                e.status < 300
                  ? "text-emerald-300"
                  : e.status < 400
                  ? "text-amber-300"
                  : "text-rose-300"
              }
            >
              {e.status}
            </span>
            <span className="text-bone/55">{e.ms}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}
