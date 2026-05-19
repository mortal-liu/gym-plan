/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f7f4',
          100: '#d9efe4',
          200: '#b5dfcc',
          300: '#83c8a8',
          400: '#54ad83',
          500: '#339166',
          600: '#23764f',
          700: '#1c5e40',
          800: '#184b34',
          900: '#153e2c',
        },
      },
      borderRadius: {
        'apple': '20px',
        'apple-sm': '14px',
        'apple-xs': '10px',
      },
      boxShadow: {
        'apple': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'apple-hover': '0 8px 32px rgba(0, 0, 0, 0.10)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
