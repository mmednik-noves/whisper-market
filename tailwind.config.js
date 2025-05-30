/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse 2s infinite',
        'slide-up': 'slide-up 1.5s ease-out forwards',
        'slide-down': 'slide-down 1.5s ease-out forwards',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(0)', opacity: 0.8 },
          '100%': { transform: 'translateY(-100px)', opacity: 0 },
        },
        'slide-down': {
          '0%': { transform: 'translateY(0)', opacity: 0.8 },
          '100%': { transform: 'translateY(100px)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}; 