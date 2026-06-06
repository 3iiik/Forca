/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/renderer/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eeeffc',
          100: '#d0d1f7',
          200: '#b0b1f2',
          300: '#8d8fec',
          400: '#6b6fe6',
          500: '#3D2FA8',
          600: '#352a94',
          700: '#2d2380',
          800: '#251d6c',
          900: '#1d1758',
        },
        focus: {
          green: '#1D9E75',
          yellow: '#eab308',
          gray: '#6b7280',
          red: '#ef4444',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'countdown': 'countdown 1s linear forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
