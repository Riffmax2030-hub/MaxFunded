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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
        neon: {
          DEFAULT: "#ccff00",
          hover: "#b3e600",
          glow: "rgba(204, 255, 0, 0.35)",
          muted: "rgba(204, 255, 0, 0.12)",
        },
        dark: {
          950: "#070809",
          900: "#0c0e12",
          850: "#12151c",
          800: "#181d26",
          750: "#1f2532",
          700: "#273040",
        }
      },
      boxShadow: {
        'neon': '0 0 25px rgba(204, 255, 0, 0.35)',
        'neon-lg': '0 0 45px rgba(204, 255, 0, 0.5)',
        'neon-sm': '0 0 12px rgba(204, 255, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
