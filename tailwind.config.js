/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        nasalization: ['Nasalization', 'Nasalization Rg', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      colors: {
        // PT. BARAK Brand Colors (from UI-GUIDELINE.md)
        'primary-red': '#BA1D23',
        'primary-yellow': '#F9CE3B',
        'accent-green': '#32B23E',
        // Semantic
        'ink': '#0F172A',
        'slate': '#334155',
        'muted': '#64748B',
        'border': '#E2E8F0',
        'canvas': '#F8FAFC',
        'surface': '#FFFFFF',
        // Status
        'info': '#2563EB',
        'warning': '#D97706',
        'danger': '#DC2626',
        'success': '#16A34A',
      },
      borderRadius: {
        'card': '12px',
        'lg': '10px',
        'xl': '14px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'dropdown': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
        'modal': '0 20px 60px -8px rgb(0 0 0 / 0.20)',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '68': '17rem',
        '72': '18rem',
        '80': '20rem',
      },
      screens: {
        'xs': '390px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}
