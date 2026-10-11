/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Royal Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a', // Deep Royal Blue
          950: '#0f172a',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4', // Vibrant Cyan
          600: '#0891b2',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 8px 24px -4px rgba(30, 58, 138, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 16px 36px -6px rgba(30, 58, 138, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'luxe': '0 20px 50px -10px rgba(14, 165, 233, 0.16), 0 10px 20px -5px rgba(225, 29, 72, 0.08)',
        'card-hover': '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 25px -3px rgba(14, 165, 233, 0.15)',
        'glow': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-sky': '0 0 30px -5px rgba(14, 165, 233, 0.35)',
        'glow-red': '0 0 30px -5px rgba(225, 29, 72, 0.35)',
      }
    },
  },
  plugins: [],
}
