/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          500: '#dc2626',
          600: '#c51f1f',
          700: '#a61212',
          900: '#1a0000',
        },
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':  'fade-in 0.25s ease-out',
        shimmer:    'shimmer 1.4s infinite linear',
      },
    },
  },
  plugins: [],
}
