/** @type {import('tailwindcss').Config} */

export default {
    content: ['./src/**/*.{mjs,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            gridColumnStart: {
                // Add up to max column start index
                ...Object.fromEntries([...Array(13).keys()].map(i => [i + 1, `${i + 1}`]))
            },
            gridRowStart: {
                ...Object.fromEntries([...Array(13).keys()].map(i => [i + 1, `${i + 1}`]))
            },
            gridColumn: {
                'span-1': 'span 1 / span 1',
                'span-2': 'span 2 / span 2',
                'span-3': 'span 3 / span 3',
                'span-4': 'span 4 / span 4',
                'span-5': 'span 5 / span 5'
            },
            gridRow: {
                'span-1': 'span 1 / span 1',
                'span-2': 'span 2 / span 2',
                'span-3': 'span 3 / span 3',
                'span-4': 'span 4 / span 4',
                'span-5': 'span 5 / span 5'
            }
        }
    },
    plugins: [require('daisyui')]
}
