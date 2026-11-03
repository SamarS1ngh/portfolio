"use client";

// Last-resort boundary: catches errors thrown in the root layout itself, which
// app/error.tsx cannot. Must render its own <html>/<body>.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#02050f",
          color: "#f5eee1",
          padding: "24px",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
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
            Reloading usually brings it right back.
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
      </body>
    </html>
  );
}
