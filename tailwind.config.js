/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy-950': '#0b1224',
        'navy-900': '#0f172a',
        'navy-800': '#141f38',
        'navy-700': '#1e293b',
        'orange-500': '#ff7a1a',
        'orange-600': '#f97316',
        'slate-200': '#e2e8f0',
        'slate-300': '#cbd5f5',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 42, 0.15)',
        deep: '0 30px 60px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
}
