"use client";

import { useEffect, useRef } from "react";

/**
 * 2D fallback for the WebGL world (Stack3D).
 *
 * Shown when a WebGL context can't be created (old iOS, in-app browsers,
 * Low Power Mode, low-memory devices). Mirrors the 7 three.js constructs as
 * lightweight animated SVG, crossfading on scroll via the same progressRef
 * and alpha curve the real scenes use — so the page reads as intentional,
 * not broken, with zero GPU use.
 */

const N = 7;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
// Matches the 3D world's per-region crossfade (see app/page.tsx regionAlpha).
function regionAlpha(i: number, f: number) {
  const d = f - i;
  if (i === 0 && d < 0.18) return 1;
  if (i === N - 1 && d > 0.82) return 1;
  if (d < -0.18 || d > 1.18) return 0;
  if (d < 0.18) return smoothstep(-0.18, 0.18, d);
  if (d > 0.82) return 1 - smoothstep(0.82, 1.18, d);
  return 1;
}

export function WorldFallback2D({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const f = clamp(progressRef.current, 0, 1) * N;
      for (let i = 0; i < N; i++) {
        const el = layerRefs.current[i];
        if (el) el.style.opacity = String(regionAlpha(i, f));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  const scenes = [
    <PlanetSVG key="r0" />,
    <NeuralSVG key="r1" />,
    <CubeSVG key="r2" />,
    <RackSVG key="r3" />,
    <ConstellationSVG key="r4" />,
    <WaveSVG key="r5" />,
    <BeaconSVG key="r6" />,
  ];

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {scenes.map((scene, i) => (
        <div
          key={i}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className="wf-layer"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          {scene}
        </div>
      ))}

      <style jsx>{`
        .wf-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: opacity;
        }
        .wf-layer :global(svg) {
          width: min(68vmin, 540px);
          height: min(68vmin, 540px);
          overflow: visible;
          filter: drop-shadow(0 0 10px rgba(125, 163, 255, 0.25));
        }
        .wf-spin {
          transform-box: fill-box;
          transform-origin: center;
          animation: wf-spin 48s linear infinite;
        }
        .wf-spin-rev {
          transform-box: fill-box;
          transform-origin: center;
          animation: wf-spin 60s linear infinite reverse;
        }
        .wf-tilt {
          transform-box: fill-box;
          transform-origin: center;
          animation: wf-tilt 16s ease-in-out infinite;
        }
        .wf-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: wf-pulse 3.2s ease-in-out infinite;
        }
        .wf-twinkle {
          animation: wf-twinkle 2.6s ease-in-out infinite;
        }
        .wf-ping {
          transform-box: fill-box;
          transform-origin: center;
          animation: wf-ping 3s ease-out infinite;
        }
        .wf-dash {
          stroke-dasharray: 6 10;
          animation: wf-dash 1.4s linear infinite;
        }
        @keyframes wf-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes wf-tilt {
          0%,
          100% {
            transform: rotate(-8deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }
        @keyframes wf-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.12);
            opacity: 1;
          }
        }
        @keyframes wf-twinkle {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes wf-ping {
          0% {
            transform: scale(0.3);
            opacity: 0.7;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        @keyframes wf-dash {
          to {
            stroke-dashoffset: -16;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-spin,
          .wf-spin-rev,
          .wf-tilt,
          .wf-pulse,
          .wf-twinkle,
          .wf-ping,
          .wf-dash {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/* ============================ SVG CONSTRUCTS ============================ */

const AQUA = "#5fc6e0";
const BLUE = "#7da3ff";
const AMBER = "#ffd54a";
const GREEN = "#10b981";
const ROSE = "#ff6b9d";
const VIOLET = "#a78bfa";

// R0 · planet + orbit rings + pins
function PlanetSVG() {
  const rings = [1.7, 1.95, 2.2];
  const pins = Array.from({ length: 6 });
  return (
    <svg viewBox="-120 -120 240 240">
      <g className="wf-spin-rev">
        {rings.map((r, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="0"
            rx={r * 34}
            ry={r * 13}
            fill="none"
            stroke={AQUA}
            strokeOpacity="0.28"
            strokeWidth="1"
            transform={`rotate(${i * 24 - 24})`}
          />
        ))}
      </g>
      <g className="wf-spin">
        <circle cx="0" cy="0" r="46" fill="#10204c" fillOpacity="0.5" stroke={BLUE} strokeOpacity="0.4" strokeWidth="1" />
        {/* meridians */}
        {[-30, 0, 30].map((t) => (
          <ellipse key={t} cx="0" cy="0" rx={46} ry={Math.max(6, 46 * Math.cos((t * Math.PI) / 90))} fill="none" stroke={AQUA} strokeOpacity="0.3" strokeWidth="0.8" transform={`rotate(${t})`} />
        ))}
        {[18, 0, -18].map((p, i) => (
          <line key={i} x1="-46" y1={p} x2="46" y2={p} stroke={AQUA} strokeOpacity="0.18" strokeWidth="0.6" />
        ))}
      </g>
      {pins.map((_, i) => {
        const a = (i / pins.length) * Math.PI * 2;
        const r = 58 + (i % 3) * 8;
        return <circle key={i} className="wf-twinkle" style={{ animationDelay: `${i * 0.3}s` }} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.42} r="2.6" fill={AMBER} />;
      })}
    </svg>
  );
}

// R1 · neural net
function NeuralSVG() {
  const nodes = Array.from({ length: 16 }).map((_, i) => {
    const ph = Math.acos(2 * (i / 15) - 1);
    const th = i * 2.39996;
    const r = 74;
    return { x: r * Math.sin(ph) * Math.cos(th), y: r * Math.cos(ph) * 0.8 };
  });
  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (dx * dx + dy * dy < 2600) edges.push([i, j]);
    }
  return (
    <svg viewBox="-110 -110 220 220">
      <g className="wf-spin">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={BLUE} strokeOpacity="0.4" strokeWidth="0.7" />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} className="wf-twinkle" style={{ animationDelay: `${(i % 6) * 0.24}s` }} cx={n.x} cy={n.y} r={i % 5 === 0 ? 3.4 : 2.2} fill={i % 5 === 0 ? AMBER : BLUE} />
        ))}
      </g>
    </svg>
  );
}

// R2 · nested wireframe cube
function CubeSVG() {
  const cube = (s: number, color: string, op: number) => {
    const p = [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
    ];
    // simple isometric projection
    const proj = p.map(([x, y, z]) => [x + z * 0.5, y - z * 0.5]);
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    return (
      <g stroke={color} strokeOpacity={op} strokeWidth="1" fill="none">
        {edges.map(([a, b], i) => (
          <line key={i} x1={proj[a][0]} y1={proj[a][1]} x2={proj[b][0]} y2={proj[b][1]} />
        ))}
      </g>
    );
  };
  return (
    <svg viewBox="-110 -110 220 220">
      <g className="wf-tilt">
        {cube(70, BLUE, 0.3)}
        <g className="wf-spin">{cube(48, AMBER, 0.45)}</g>
        <g className="wf-spin-rev">{cube(26, ROSE, 0.6)}</g>
      </g>
    </svg>
  );
}

// R3 · skill rack grid
function RackSVG() {
  const cols = 7, rows = 4, gap = 26, size = 18;
  const tiles: { x: number; y: number; c: string; d: number }[] = [];
  const palette = [BLUE, AMBER, GREEN, VIOLET, ROSE, AQUA];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      tiles.push({
        x: (c - (cols - 1) / 2) * gap,
        y: (r - (rows - 1) / 2) * gap,
        c: palette[idx % palette.length],
        d: (c + r) * 0.12,
      });
    }
  return (
    <svg viewBox="-110 -70 220 140">
      <g className="wf-tilt">
        {tiles.map((t, i) => (
          <rect key={i} className="wf-pulse" style={{ animationDelay: `${t.d}s` }} x={t.x - size / 2} y={t.y - size / 2} width={size} height={size} rx="2" fill={t.c} fillOpacity="0.18" stroke={t.c} strokeOpacity="0.6" strokeWidth="1" />
        ))}
      </g>
    </svg>
  );
}

// R4 · constellation clusters
function ConstellationSVG() {
  const clusters = [
    { cx: -46, cy: -30, c: ROSE },
    { cx: 48, cy: -24, c: BLUE },
    { cx: -40, cy: 34, c: AMBER },
    { cx: 44, cy: 32, c: GREEN },
  ];
  return (
    <svg viewBox="-110 -90 220 180">
      <g className="wf-spin">
        {clusters.map((cl, ci) => {
          const pts = Array.from({ length: 7 }).map((_, i) => {
            const a = (i / 7) * Math.PI * 2 + ci;
            const r = 8 + (i % 3) * 7;
            return { x: cl.cx + Math.cos(a) * r, y: cl.cy + Math.sin(a) * r };
          });
          return (
            <g key={ci}>
              {pts.map((p, i) => (
                <line key={i} x1={cl.cx} y1={cl.cy} x2={p.x} y2={p.y} stroke={cl.c} strokeOpacity="0.25" strokeWidth="0.6" />
              ))}
              {pts.map((p, i) => (
                <circle key={i} className="wf-twinkle" style={{ animationDelay: `${(ci + i) * 0.2}s` }} cx={p.x} cy={p.y} r="2" fill={cl.c} />
              ))}
              <circle cx={cl.cx} cy={cl.cy} r="3" fill={cl.c} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// R5 · oscilloscope wave
function WaveSVG() {
  const w = 220, steps = 120;
  const path = Array.from({ length: steps })
    .map((_, i) => {
      const x = -w / 2 + (i / (steps - 1)) * w;
      const y = Math.sin(i * 0.22) * 26 + Math.sin(i * 0.07) * 14;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const grid = [];
  for (let gx = -100; gx <= 100; gx += 20) grid.push(<line key={`v${gx}`} x1={gx} y1="-60" x2={gx} y2="60" stroke={GREEN} strokeOpacity="0.1" strokeWidth="0.5" />);
  for (let gy = -60; gy <= 60; gy += 20) grid.push(<line key={`h${gy}`} x1="-110" y1={gy} x2="110" y2={gy} stroke={GREEN} strokeOpacity="0.1" strokeWidth="0.5" />);
  return (
    <svg viewBox="-115 -70 230 140">
      {grid}
      <path d={path} fill="none" stroke={GREEN} strokeOpacity="0.85" strokeWidth="1.6" className="wf-dash" />
    </svg>
  );
}

// R6 · pulsing beacon
function BeaconSVG() {
  return (
    <svg viewBox="-110 -110 220 220">
      {[0, 1, 2].map((i) => (
        <circle key={i} className="wf-ping" style={{ animationDelay: `${i}s` }} cx="0" cy="0" r="34" fill="none" stroke={ROSE} strokeWidth="2" />
      ))}
      <circle className="wf-pulse" cx="0" cy="0" r="22" fill={ROSE} fillOpacity="0.2" stroke={ROSE} strokeOpacity="0.8" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="7" fill={AMBER} />
    </svg>
  );
}
