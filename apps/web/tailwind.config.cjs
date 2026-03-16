/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    deep: '#0d1b2a',
                    offset: '#111c29',
                    cyan: '#00d4ff',
                    blue: '#0094ff',
                    surface: 'rgba(255, 255, 255, 0.06)',
                    'glass-border': 'rgba(255, 255, 255, 0.1)',
                }
            }
        },
    },
    plugins: [],
}
