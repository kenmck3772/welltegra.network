// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{html,js,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand:    "#0B0B0B",
        accent:   "#0EA5E9",
        surface:  "#F7FAFC",
        border:   "#E5E7EB",
        muted:    "#6B7280",
        darkBg:       "#0F172A",
        darkSurface:  "#1F2937",
        darkBrand:    "#F8FAFC",
        darkBorder:   "#374151"
      },
      boxShadow: {
        soft: "0 6px 18px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};
