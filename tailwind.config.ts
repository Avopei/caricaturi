import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            colors: {
                ink: "#0C0C0C",
                "ink-soft": "#2A2A28",
                paper: "#FFFFFF",
                surface: "#F5F5F3",
                line: "#E4E4E1",
                "line-dark": "#3A3A38",
                mute: "#7C7C76"
            },
            fontFamily: {
                display: ["var(--font-display)", "serif"],
                sans: [
                    "var(--font-sans)",
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif"
                ]
            },
            transitionTimingFunction: {
                studio: "cubic-bezier(.22,.61,.2,1)"
            }
        }
    },
    plugins: []
};

export default config;