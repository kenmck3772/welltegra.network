/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.html',        // This path covers all HTML files
    './module-loader.js',
    '!./node_modules/**', // <-- THE MISSING COMMA WAS ADDED HERE
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular']
      }
    },
  },
  plugins: [],
};
