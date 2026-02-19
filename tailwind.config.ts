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
          50: "#F0F5EE",
          100: "#DDE8D8",
          200: "#B8CCAE",
          300: "#8DB88A",
          400: "#6B9E68",
          500: "#4A7C59",
          600: "#3D6B4A",
          700: "#2E5438",
          800: "#1F3D27",
          900: "#142918",
        },
        ink: {
          50: "#FAF9F7",
          100: "#F0EDE7",
          200: "#D8D5CE",
          300: "#A8A8A8",
          400: "#8A8A8A",
          500: "#5A5A5A",
          600: "#444444",
          700: "#333333",
          800: "#1A1A1A",
          900: "#111111",
        },
        surface: {
          0: "#ffffff",
          50: "#FAF9F7",
          100: "#F4F2EE",
          200: "#EEEDEA",
          300: "#DEDBD5",
          700: "#5A5A5A",
          900: "#1A1A1A",
        },
        status: {
          success: "#4A7C59",
          warn: "#C48A20",
          error: "#C75050",
          info: "#4A6FA5",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "surface-1": "0 1px 3px rgba(26, 26, 26, 0.04)",
        "surface-2": "0 8px 24px rgba(26, 26, 26, 0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
