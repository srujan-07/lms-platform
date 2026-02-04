import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Semantic mappings
                primary: {
                    DEFAULT: '#FF6D1F', // Orange CTA
                    50: '#fff1ea',
                    100: '#ffdfcc',
                    200: '#ffc3a3',
                    300: '#ffa070',
                    400: '#ff7a3d',
                    500: '#FF6D1F', // Base
                    600: '#e6520d',
                    700: '#bf3b06',
                    800: '#992e09',
                    900: '#7c270b',
                },
                // Brand specific
                brand: {
                    beige: '#F4E7C6', // Surface / Cards
                    light: '#FAF3E1', // Page Background
                    orange: '#FF6D1F', // Highlight
                    dark: '#222222', // Text
                },
                // Keep roles but map to theme or neutral for now to avoid clashes, 
                // or just keep them accessible for legacy code that hasn't been fully refactored yet.
                // We will try to rely on 'brand' colors, but let's keep role keys to avoid breaking build,
                // matching them to the theme.
                student: {
                    light: '#FAF3E1',
                    DEFAULT: '#FF6D1F',
                    dark: '#992e09',
                },
                lecturer: {
                    light: '#FAF3E1',
                    DEFAULT: '#FF6D1F',
                    dark: '#992e09',
                },
                admin: {
                    light: '#FAF3E1',
                    DEFAULT: '#FF6D1F',
                    dark: '#992e09',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
