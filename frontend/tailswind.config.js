/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bnomc-blue': '#0a4d92',   // Primary Blue
        'bnomc-yellow': '#e6e94e', // Primary Yellow
        'bnomc-dark': '#073b75',   // Darker shade
      }
    },
  },
  plugins: [],
}