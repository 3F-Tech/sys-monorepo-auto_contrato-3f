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
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                },
            },
            animation: {
                shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
            },
        },
    },
    plugins: [],
}
