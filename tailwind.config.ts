import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a14",
        bone: "#fafaf3",
        cream: "#f7f2e8",
        // sticker accent palette
        hot: "#ff006e",
        ember: "#fb5607",
        sun: "#ffbe0b",
        violet: "#8338ec",
        sky: "#3a86ff",
        teal: "#06d6a0",
        mint: "#80ed99",
        rose: "#ffadad",
        lemon: "#fdffb6",
        cobalt: "#0066ff",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-instrument-serif)", "Times New Roman", "serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.25em",
        ultra: "0.4em",
      },
      boxShadow: {
        sticker: "0 18px 40px -8px rgba(0,0,0,0.35), 0 4px 12px -2px rgba(0,0,0,0.2)",
        stickerHover: "0 30px 60px -10px rgba(0,0,0,0.45), 0 8px 20px -4px rgba(0,0,0,0.25)",
        glow: "0 0 40px rgba(255,0,110,0.4)",
      },
      animation: {
        "drift-slow": "drift 18s ease-in-out infinite alternate",
        "drift-med": "drift 12s ease-in-out infinite alternate-reverse",
        "drift-fast": "drift 8s ease-in-out infinite alternate",
        "spin-slow": "spin 30s linear infinite",
        "tape": "tape 30s linear infinite",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "100%": { transform: "translate(40px,-30px) scale(1.05)" },
        },
        tape: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
