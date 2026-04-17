/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'cardiowise': {
          'blue-950': '#020a1a',
          'blue-900': '#0a1628',
          'blue-800': '#0f2242',
          'blue-700': '#163060',
          'blue-600': '#1a3f80',
          'blue-500': '#1d52a8',
          'blue-400': '#2563eb',
          'blue-300': '#3b82f6',
          'blue-200': '#93c5fd',
          'blue-100': '#dbeafe',
          'blue-50': '#eff6ff',
        },
        'slate': {
          '900': '#0f172a',
          '800': '#1e293b',
          '700': '#334155',
          '600': '#475569',
          '500': '#64748b',
          '400': '#94a3b8',
          '300': '#cbd5e1',
          '200': '#e2e8f0',
          '100': '#f1f5f9',
          '50': '#f8fafc',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
        'sm': '8px',
        'lg': '20px',
      },
      boxShadow: {
        'card': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
      }
    },
  },
  plugins: [],
}
