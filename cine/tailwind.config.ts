import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/server/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          background: "#141414",
          accent: "#E50914",
          foreground: "#FFFFFF",
          surface: "#2F2F2F",
          muted: "#A3A3A3",
        },
      },
      boxShadow: {
        glow: "0 24px 80px rgba(229, 9, 20, 0.18)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(229, 9, 20, 0.35), transparent 40%), radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.08), transparent 35%)",
      },
    },
  },
  plugins: [],
};

export default config;
