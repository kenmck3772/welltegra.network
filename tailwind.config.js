/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",          // your main page
    "./**/*.{html,js,ts}",   // any other html/js/ts in the repo
    // If you keep components/pages under src/, this already covers them.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
