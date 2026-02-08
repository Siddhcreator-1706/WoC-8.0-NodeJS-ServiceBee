/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                pumpkin: '#ff6600',
                blood: '#c0392b',
                night: '#0f0f13',
                slime: '#2ecc71',
                ghost: '#f8f8f8',
                'night-light': '#1a1a2e',
            },
            fontFamily: {
                creepster: ['Creepster', 'cursive'],
                inter: ['Inter', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
