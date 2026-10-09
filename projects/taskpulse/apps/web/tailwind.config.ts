import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1020",
        panel: "#131A2E",
        raised: "#1A2340",
        line: "#243050",
        fg: "#E6EAF5",
        muted: "#8A94B2",
        indigo: { DEFAULT: "#6366F1", soft: "#818CF8" },
        cyan: { DEFAULT: "#22D3EE" },
        amber: { DEFAULT: "#F59E0B" },
        rose: { DEFAULT: "#F43F5E" },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
