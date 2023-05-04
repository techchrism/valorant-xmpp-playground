/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}',
    ],
    darkMode: 'media',
    theme: {
        extend: {
            gridTemplateColumns: {
                'main': '350px 1fr'
            }
        }
    },
    plugins: [require('daisyui')],
};
