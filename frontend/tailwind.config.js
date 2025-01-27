/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ad81ff',
          50: '#f5edff',
          100: '#ead6ff',
          200: '#d6b0ff',
          300: '#c389ff',
          400: '#af63ff',
          500: '#ad81ff', // main color
          600: '#9564e0',
          700: '#7b47bd',
          800: '#622d9c',
          900: '#4a1d7c'
        }
      }
    },
  },
  plugins: [],
}