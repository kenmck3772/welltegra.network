/** @type {import('tailwindcss').Config} */
module.exports = {
  // Specify all files that contain Tailwind class names
  content: [
    './*.html', 
  ],
  theme: {
    extend: {
      colors: {
        brand: "#0B0B0B",
        accent: "#0EA5E9",
        muted: "#6B7280",
        border: "#E5E7EB",
        surface: "#F8FAFC"
      },
      fontFamily: { 
        // Inter is loaded via CDN link in the HTML head
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"] 
      },
      boxShadow: {
        soft: "0 10px 24px -12px rgba(0,0,0,.15)",
      }
    },
  },
  plugins: [],
}
