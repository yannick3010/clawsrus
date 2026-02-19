import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f0ff",
          100: "#e0e0ff",
          200: "#c7c4ff",
          300: "#a5a0ff",
          400: "#8b83ff",
          500: "#635bff",
          600: "#4b44c7",
          700: "#3d3899",
          800: "#2e2b73",
          900: "#1a1845",
        },
        navy: {
          50: "#f6f9fc",
          100: "#e3e8ee",
          200: "#c1c9d2",
          300: "#8898aa",
          400: "#6b7c93",
          500: "#425466",
          600: "#2a3f54",
          700: "#1a2b3d",
          800: "#0a2540",
          900: "#04111f",
        },
        surface: {
          0: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          700: "#334155",
          900: "#0f172a",
        },
        status: {
          success: "#059669",
          warn: "#d97706",
          error: "#dc2626",
          info: "#2563eb",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "surface-1": "0 1px 2px rgba(15, 23, 42, 0.06)",
        "surface-2": "0 8px 24px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
