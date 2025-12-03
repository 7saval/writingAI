/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        userBg: '#f0f9ff',
        aiBg: '#f5f3ff',
        text: '#1f2937',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

