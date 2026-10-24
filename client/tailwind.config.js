/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3eee4",
        ink: "#1a1714",
        clay: "#c45c26",
        pine: "#1f5c57",
        moss: "#8a9a6b",
        sand: "#e7dcc8",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        ticket: "0 18px 40px -24px rgba(26, 23, 20, 0.45)",
      },
    },
  },
  plugins: [],
};
