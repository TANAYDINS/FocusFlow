/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#F0F4FF',
        surface:    '#FFFFFF',
        primary:    '#4F46E5',   // Indigo-600
        secondary:  '#0EA5E9',   // Sky-500
        accent:     '#F59E0B',   // Amber-500
        success:    '#10B981',   // Emerald-500
        dark:       '#1E1B4B',   // Indigo-950
        muted:      '#64748B',   // Slate-500
        border:     '#E2E8F0',   // Slate-200
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 3px rgba(79,70,229,0.06), 0 4px 12px rgba(79,70,229,0.04)',
        'card-hover': '0 4px 16px rgba(79,70,229,0.12)',
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
    },
  },
  plugins: [],
}
