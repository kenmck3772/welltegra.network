/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './**/*.html',
    './assets/js/**/*.js',
    './module-loader.js',
    '!./node_modules/**',
    '!./assets/vendor/**'
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
