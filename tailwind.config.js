/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3498db",
        secondary: "#2c3e50",
        success: "#2ecc71",
        danger: "#e74c3c",
        warning: "#f39c12",
        gray: {
          light: "#ecf0f1",
          DEFAULT: "#95a5a6",
          dark: "#7f8c8d",
        },
      },
    },
  },
  plugins: [],
};