/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e5edff",
          500: "#4f6df5",
          600: "#3d54e0",
          700: "#3243b3",
        },
      },
    },
  },
  plugins: [],
};
