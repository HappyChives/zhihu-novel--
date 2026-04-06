/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#e0eaff",
          200: "#c7d9ff",
          300: "#a3beff",
          400: "#7a96ff",
          500: "#5b74ff",
          600: "#4455f5",
          700: "#353fdb",
          800: "#2d35b5",
          900: "#272f8a",
        },
        dark: {
          bg: "#0f1117",
          surface: "#1a1d27",
          card: "#22263a",
          border: "#2e3347",
        },
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans SC", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
