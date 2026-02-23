/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        green:  { DEFAULT: '#2d6a3f', dark: '#1a3d25', mid: '#3d7a50', light: '#e8f2eb' },
        cream:  { DEFAULT: '#f9f6f1', dark: '#f0ebe2' },
        earth:  '#8b6f47',
        border: '#e2ddd6',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: { '8xl': '88rem' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
