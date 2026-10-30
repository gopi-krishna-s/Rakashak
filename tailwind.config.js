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
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316', // Rescue Safety Orange
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12',
        },
        slate: {
          850: '#151e2e',
          950: '#0b0f19',
        }
      },
    },
  },
  plugins: [],
}
