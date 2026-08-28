/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#FFFFFF',
          300: '#E5E7EB',
          400: '#D1D5DB',
        },
        brand: {
          orange: '#FF5722',
          black: '#000000',
          dark: '#111827',
          gray: '#6B7280',
          light: '#F8F9FA',
        },
        neon: {
          lime: '#FF5722', // mapped to brand accent
          cyan: '#0284C7',
          magenta: '#E11D48',
        },
        gold: {
          400: '#F59E0B',
          500: '#D97706',
        },
        framer: {
          bg: '#E4E4E4',
          dark: '#171C1B',
          card: '#F2F2F0',
          accent: '#000000',
          muted: '#A2A4A4',
        }
      },
      fontFamily: {
        sans: ['"Spline Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'sans-serif'],
        mono: ['"Fragment Mono"', 'monospace'],
      },
      maxWidth: {
        framer: '1597px',
      },
    },
  },
  plugins: [],
};
