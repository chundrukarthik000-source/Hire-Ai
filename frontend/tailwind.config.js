/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // dark mode by default
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#080B11",
          card: "rgba(17, 24, 39, 0.7)",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#F3F4F6",
          muted: "#9CA3AF"
        },
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2"
        },
        purple: {
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          950: "#3B0764"
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        glow: "0 0 15px rgba(168, 85, 247, 0.15)"
      },
      backdropBlur: {
        xs: "2px"
      }
    },
  },
  plugins: [],
}
