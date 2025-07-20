const config = {
    content: {
        files: [
            "./pages/**/*.{js,ts,jsx,tsx,mdx}",
            "./components/**/*.{js,ts,jsx,tsx,mdx}",
            "./app/**/*.{js,ts,jsx,tsx,mdx}",
        ],
    },
    theme: {
        extend: {
            colors: {
                primary: "#0D0F19",
                secondary: {
                    DEFAULT: "#746D91",
                },
                dark: "#121520",
                gold: {
                    DEFAULT: "hsl(var(--gold))",
                    foreground: "hsl(var(--gold-foreground))",
                },
                glass: {
                    DEFAULT: "hsl(var(--glass))",
                    border: "hsl(var(--glass-border))",
                },
            },
            fontFamily: {
                "paras": ["Parastoo", "serif"],
                "poppins": ["Poppins", "sans-serif"],
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
