import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#07161C",
        panel: "#0D222B",
        raised: "#12303B",
        line: "#1C3F4C",
        fg: "#E7F3F5",
        muted: "#86A3AD",
        accent: { DEFAULT: "#2DD4BF", dark: "#14B8A6" },
        info: "#38BDF8",
        warm: "#FBBF24",
        coral: "#FB7185",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
