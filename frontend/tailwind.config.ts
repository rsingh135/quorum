import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0A0A0F",
          panel: "#2A3F5F",
        },
        gold: {
          DEFAULT: "#C9A84C",
          muted: "rgba(201, 168, 76, 0.2)",
        },
        affirm: "#2ECC71",
        reverse: "#E74C3C",
        ink: {
          DEFAULT: "#E8E6DF",
          muted: "rgba(232, 230, 223, 0.72)",
          faint: "rgba(232, 230, 223, 0.45)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0px",
        xs: "2px",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "2px",
        xl: "2px",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(201,168,76,0.25), 0 10px 30px rgba(0,0,0,0.55)",
        lift: "0 18px 40px rgba(0,0,0,0.55)",
        glowAffirm: "0 0 0 1px rgba(46,204,113,0.35), 0 0 22px rgba(46,204,113,0.18)",
        glowReverse: "0 0 0 1px rgba(231,76,60,0.35), 0 0 22px rgba(231,76,60,0.18)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.35s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

