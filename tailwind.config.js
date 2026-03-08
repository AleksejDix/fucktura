/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        'denim-600': '#4B5563',
        'denim-200': '#6d7b90',
      },
      screens: {
        print: { raw: 'print' },
      },
    },
  },
  plugins: [],
};
