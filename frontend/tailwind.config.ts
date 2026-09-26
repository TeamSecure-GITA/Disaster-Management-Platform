import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c16",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "rgba(15, 23, 42, 0.75)",
          foreground: "#f8fafc",
        },
        popover: {
          DEFAULT: "#0f172a",
          foreground: "#f8fafc",
        },
        primary: {
          DEFAULT: "#0284c7",
          foreground: "#ffffff",
          glow: "#38bdf8",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#94a3b8",
        },
        muted: {
          DEFAULT: "#0f172a",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#06b6d4",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        border: "rgba(148, 163, 184, 0.15)",
        input: "rgba(30, 41, 59, 0.8)",
        ring: "#38bdf8",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(56, 189, 248, 0.3)",
        "glow-danger": "0 0 25px -5px rgba(239, 68, 68, 0.35)",
        "glow-warning": "0 0 25px -5px rgba(245, 158, 11, 0.35)",
        "glow-success": "0 0 25px -5px rgba(16, 185, 129, 0.35)",
      },
      animation: {
        pulse_fast: "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        radar: "radarSweep 3s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
