import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: "#1C0A00",
          50: "#4A2E20",
          100: "#3D2318",
          200: "#2E1A10",
          300: "#1C0A00",
          400: "#140700",
          500: "#0D0500",
        },
        cream: {
          DEFAULT: "#F5ECD7",
          50: "#FDFAF4",
          100: "#FAF5E8",
          200: "#F5ECD7",
          300: "#EDE0C4",
          400: "#DDD0B0",
        },
        caramel: {
          DEFAULT: "#C8882A",
          50: "#F5E6CC",
          100: "#EED9A8",
          200: "#D9B56E",
          300: "#C8882A",
          400: "#A86E1F",
          500: "#8A5A18",
        },
        sage: {
          DEFAULT: "#6B7C5E",
          50: "#E8ECE5",
          100: "#D1D9CC",
          200: "#B3C0AB",
          300: "#6B7C5E",
          400: "#55634A",
          500: "#404B37",
        },
        smoke: {
          DEFAULT: "#2E2E2E",
          50: "#F5F5F5",
          100: "#E0E0E0",
          200: "#B0B0B0",
          300: "#808080",
          400: "#2E2E2E",
          500: "#1A1A1A",
        },
        foam: {
          DEFAULT: "#FDFAF4",
        },
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        md: "6px",
      },
      keyframes: {
        "scroll-down": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "50%": { transform: "translateY(8px)", opacity: "0.5" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "scroll-down": "scroll-down 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
