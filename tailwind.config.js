/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold': {
          400: '#fbbf24',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}

// Force Vite reload
