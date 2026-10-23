"use client";

import { Canvas } from "@react-three/fiber";
import { Component, type ReactNode, useEffect, useState } from "react";

type CanvasProps = React.ComponentProps<typeof Canvas>;

// Does this browser actually give us a WebGL context?
// Older iOS (<15 = no WebGL2), in-app browsers (Instagram/FB WKWebView),
// low-power mode, and low-memory / context-exhausted devices can all fail here.
function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

// Catches a synchronous throw during Canvas mount (e.g. three.js
// "Error creating WebGL context") so it degrades to the fallback
// instead of taking down the whole React tree.
class CanvasErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false };
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  componentDidCatch(err: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("SafeCanvas: WebGL render failed, showing fallback —", err);
    }
  }
  render() {
    return this.state.crashed ? this.props.fallback : this.props.children;
  }
}

/**
 * Drop-in replacement for @react-three/fiber <Canvas> that never white-screens
 * the page when WebGL is unavailable or context creation fails.
 *
 * Three layers of defense:
 *  1. Pre-check WebGL support before mounting — skip straight to fallback.
 *  2. Error boundary around <Canvas> — catches context-creation throws.
 *  3. webglcontextlost handler — survives mid-session GPU eviction.
 */
export function SafeCanvas({
  children,
  fallback = null,
  gl,
  onCreated,
  ...rest
}: CanvasProps & { fallback?: ReactNode }) {
  const [supported, setSupported] = useState<boolean | null>(null);

  // Decide on the client after mount (callers already load this via next/dynamic ssr:false).
  useEffect(() => setSupported(webglAvailable()), []);

  if (supported === null) return null;
  if (!supported) return <>{fallback}</>;

  return (
    <CanvasErrorBoundary fallback={fallback}>
      <Canvas
        gl={{
          // Safer context attributes for mobile / in-app / low-power:
          failIfMajorPerformanceCaveat: false,
          powerPreference: "default",
          antialias: true,
          alpha: true,
          ...(gl as object), // caller can still override any of the above
        }}
        onCreated={(state) => {
          // Prevent a lost context (low-power throttling, backgrounded tab,
          // memory pressure) from permanently killing the canvas.
          state.gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => e.preventDefault(),
            false,
          );
          onCreated?.(state);
        }}
        {...rest}
      >
        {children}
      </Canvas>
    </CanvasErrorBoundary>
  );
}
