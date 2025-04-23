/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#A0522D", // Sienna
        secondary: "#E9967A", // Dark Salmon (pinkish)
        accent: "#CD853F", // Peru (lighter sienna)
        background: "#FFF5EE", // Seashell (pinkish neutral)
        neutral: "#F8E2D5", // Light pinkish neutral
        dark: "#2D1D15", // Dark brown
        text: "#4A3728", // Warm brown text
      },
      fontFamily: {
        sans: ['Cormorant Garamond', 'Playfair Display', 'serif'],
        display: ['Playfair Display', 'serif'],
        body: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        'elegant': '0.75rem',
      },
      boxShadow: {
        'elegant': '0 4px 12px rgba(160, 82, 45, 0.1)',
      }
    },
  },
  plugins: [],
} 