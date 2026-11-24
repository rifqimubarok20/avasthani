/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#216E4E',
        'primary-dark': '#164B36',
        'primary-soft': '#E8F4EC',
        accent: '#E9A23B',
        background: '#F7F8F5',
        surface: '#FFFFFF',
        'text-primary': '#202923',
        'text-secondary': '#66736A',
        border: '#DCE4DD',
        danger: '#B42318',
        success: '#18794E',
        warning: '#9A6700',
      },
    },
  },
  plugins: [],
};
