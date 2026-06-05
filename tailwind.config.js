/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WellTegra Brand Colors
        slate: {
          950: '#0A0E1A', // Deepest industrial slate
          900: '#0F172A', // Standard slate
          800: '#1E293B',
          700: '#334155',
        },
        teal: {
          400: '#2DD4BF', // Validated safety zones
          500: '#0D9488',
          600: '#0F766E',
        },
        orange: {
          400: '#FB923C', // Physical limit boundaries
          500: '#F97316',
          600: '#EA580C',
        },
        amber: {
          400: '#FBBF24', // Asset risks
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'jetbrains-mono': ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
