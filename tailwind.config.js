/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './pages/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#7E3AF2',
                    foreground: '#ffffff',
                },
                muted: {
                    DEFAULT: '#f9fafb',
                    foreground: '#6b7280',
                },
                border: '#E5E7EB',
                background: '#ffffff',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                lg: '0.5rem',
                md: '0.375rem',
                sm: '0.25rem',
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
    ],
}