/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./public/index.html"
  ],
  theme: {
  extend: {
    colors: {
      'paper-base': '#F4ECD8',
      'paper-card': '#FAF0E6',
      'paper-text': '#334155',
    }
  }
},
  plugins: [],
}