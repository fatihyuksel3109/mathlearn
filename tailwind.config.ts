import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: "#FFB6C1",
          purple: "#DDA0DD",
          blue: "#B0E0E6",
          green: "#98FB98",
          yellow: "#FFFACD",
          orange: "#FFE4B5",
          peach: "#FFDAB9",
        },
        cute: {
          primary: "#FF6B9D",
          secondary: "#C77DFF",
          accent: "#4ECDC4",
          success: "#95E1D3",
          warning: "#FCE38A",
        },
      },
      animation: {
        bounce: "bounce 1s infinite",
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

