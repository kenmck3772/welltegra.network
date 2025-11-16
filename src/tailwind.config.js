/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.html',
    './module-loader.js',
    '!./node_modules/**'
    './*.html',
    './**/*.html',
    './module-loader.js'
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
