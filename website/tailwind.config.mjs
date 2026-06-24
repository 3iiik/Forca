/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['Josefin Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        background: '#09090b',
        foreground: '#f4f4f5',
        muted: {
          DEFAULT: '#27272a',
          foreground: '#a1a1aa',
        },
        border: '#27272a',
        accent: {
          DEFAULT: '#1D9E75',
          foreground: '#d1fae5',
        },
        card: {
          DEFAULT: '#18181b',
          foreground: '#f4f4f5',
        },
      },
      maxWidth: {
        '7xl': '1400px',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
