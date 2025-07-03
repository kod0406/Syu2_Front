/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in',
        'slide-in': 'slideIn 0.4s ease',
        'slide-up': 'slideUp 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          'from': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          'to': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        slideUp: {
          'from': {
            transform: 'translateY(30px)',
            opacity: '0',
          },
          'to': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        }
      },
    },
  },
  plugins: [],
}
