/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          dark: '#0a0a16',
          light: '#1b2735',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse': 'pulse 4s ease-in-out infinite',
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(ellipse at bottom, var(--tw-color-space-light) 0%, var(--tw-color-space-dark) 100%)',
      }
    },
  },
  plugins: [],
}
