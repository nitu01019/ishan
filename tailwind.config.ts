import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "rgb(var(--bg-primary-rgb) / <alpha-value>)",
          card: "rgb(var(--bg-card-rgb) / <alpha-value>)",
          "card-alt": "rgb(var(--bg-card-alt-rgb) / <alpha-value>)",
        },
        accent: {
          green: "rgb(var(--accent-green-rgb) / <alpha-value>)",
          teal: "rgb(var(--accent-teal-rgb) / <alpha-value>)",
          cyan: "rgb(var(--accent-cyan-rgb) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary-rgb) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
          muted: "rgb(var(--text-muted-rgb) / <alpha-value>)",
        },
        border: {
          glow: "rgb(var(--accent-green-rgb) / 0.15)",
          "glow-hover": "rgb(var(--accent-green-rgb) / 0.4)",
        },
        // Keep these hardcoded — they're not theme-dependent
        star: {
          orange: "#F59E0B",
        },
        // shadcn compat
        primary: {
          DEFAULT: "rgb(var(--accent-green-rgb) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--bg-card-alt-rgb) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "#EF4444",
        },
        ring: "rgb(var(--accent-green-rgb) / <alpha-value>)",
        input: "#374151",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 25px rgba(0,0,0,0.4)",
        green: "0 0 20px rgb(var(--accent-green-rgb) / 0.15)",
        "green-lg": "0 0 40px rgb(var(--accent-green-rgb) / 0.2)",
        "green-xl": "0 0 60px rgb(var(--accent-green-rgb) / 0.25)",
      },
      animation: {
        "scroll-left": "scroll-left 30s linear infinite",
        "scroll-right": "scroll-right 35s linear infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "spotlight": "spotlight 2s ease .75s 1 forwards",
        "shine": "shine var(--duration) infinite linear",
        "mesh-move": "mesh-move 20s ease-in-out infinite",
        "mesh-move-reverse": "mesh-move-reverse 25s ease-in-out infinite",
      },
      keyframes: {
        "scroll-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "scroll-right": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.08" },
          "50%": { opacity: "0.15" },
        },
        "spotlight": {
          "0%": { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%,-40%) scale(1)" },
        },
        "shine": {
          "0%": { "background-position": "0% 0%" },
          "50%": { "background-position": "100% 100%" },
          to: { "background-position": "0% 0%" },
        },
        "mesh-move": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        "mesh-move-reverse": {
          "0%, 100%": { "background-position": "100% 0%" },
          "50%": { "background-position": "0% 100%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
