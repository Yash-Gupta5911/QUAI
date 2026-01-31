/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "background-dark": "#020203", // Near black
                "surface-dark": "#0A0A0B", // Dark surface
                "border-dark": "#1F1F23", // Dark border
                "text-primary": "#FFFFFF", // White text
                "primary": "#4387f4", // Signal Blue
                "emerald-accent": "#22c55e",
                "rose-accent": "#ef4444",
                "background-light": "#f5f7f8",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
                "grotesk": ["Space Grotesk", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            letterSpacing: {
                tighter: '-0.05em',
                'tightest': '-0.075em',
            }
        },
    },
    plugins: [],
}
