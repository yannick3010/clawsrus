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
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
