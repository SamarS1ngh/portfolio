"use client";

// Route-level error boundary. Without this, any uncaught client-side render
// error shows Next.js's raw "Application error: a client-side exception has
// occurred" screen. This degrades it to an on-brand recovery view with a retry.

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface it for debugging without crashing the page.
    console.error("Portfolio runtime error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#02050f",
        color: "#f5eee1",
        padding: "24px",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#ffd54a",
          }}
        >
          ▸ signal lost
        </div>
        <h1
          style={{
            marginTop: 16,
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Something glitched out here.
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(245,238,225,0.7)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          The 3D world hit a snag on your device. Reloading usually brings it
          right back.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 24,
            border: "1px solid rgba(255,213,74,0.6)",
            background: "rgba(255,213,74,0.12)",
            color: "#ffd54a",
            padding: "10px 22px",
            borderRadius: 6,
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Reload the world
        </button>
      </div>
    </div>
  );
}
