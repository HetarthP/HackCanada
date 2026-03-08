import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            animation: {
                aurora: "aurora 60s linear infinite",
                first: "moveVertical 30s ease infinite",
                second: "moveInCircle 20s reverse infinite",
                third: "moveInCircle 40s linear infinite",
                fourth: "moveHorizontal 40s ease infinite",
                fifth: "moveInCircle 20s ease infinite",
                "shiny-text": "shiny-text 8s infinite",
            },
            keyframes: {
                aurora: {
                    from: {
                        backgroundPosition: "50% 50%, 50% 50%",
                    },
                    to: {
                        backgroundPosition: "350% 50%, 350% 50%",
                    },
                },
                moveHorizontal: {
                    "0%": { transform: "translateX(-50%) translateY(-10%)" },
                    "50%": { transform: "translateX(50%) translateY(10%)" },
                    "100%": { transform: "translateX(-50%) translateY(-10%)" },
                },
                moveInCircle: {
                    "0%": { transform: "rotate(0deg)" },
                    "50%": { transform: "rotate(180deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
                moveVertical: {
                    "0%": { transform: "translateY(-50%)" },
                    "50%": { transform: "translateY(50%)" },
                    "100%": { transform: "translateY(-50%)" },
                },
                "shiny-text": {
                    "0%, 90%, 100%": {
                        "background-position": "calc(-100% - var(--shiny-width)) 0",
                    },
                    "30%, 60%": {
                        "background-position": "calc(100% + var(--shiny-width)) 0",
                    },
                },
            },
            colors: {
                background: "#000000",
                foreground: "#f3f4f6",
                border: "var(--border)",
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
