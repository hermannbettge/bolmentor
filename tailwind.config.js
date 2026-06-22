/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0d1b2a',
        'bg-section': '#112240',
        'bg-card': '#162032',
        'bg-light': '#1a2a42',
        'gold': '#B8975A',
        'gold-light': '#D4AF72',
        'gold-muted': '#8B6E3E',
        'text-primary': '#E8E8E8',
        'text-muted': '#8899AA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      maxWidth: {
        content: '720px',
      },
    },
  },
  plugins: [],
}
