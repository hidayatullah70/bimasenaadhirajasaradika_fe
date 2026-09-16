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
          red: '#BC1727',
          'red-dark': '#8f101d',
          'red-light': '#de3041',
          yellow: '#FDE346',
          'yellow-light': '#fef187',
          'yellow-dark': '#cbb41a',
          green: '#15C110',
          'green-light': '#44db3f',
          'green-dark': '#0fa00b',
          dark: '#17202A',
          'dark-light': '#243342',
          neutral: '#F5F7FA',
          border: '#E5E7EB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
        'btn': '9px',
      }
    },
  },
  plugins: [],
}
