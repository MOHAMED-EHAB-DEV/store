import localFont from 'next/font/local';

export const Roboto = localFont({
    src: '../public/assets/fonts/Roboto/Roboto-VariableFont_wdth,wght.woff2',
    variable: '--roboto',
    display: "swap",
    preload: true,
    fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

export const Parastoo = localFont({
    src: '../public/assets/fonts/Parastoo/Parastoo-VariableFont_wght.woff2',
    variable: '--font-paras',
    display: "swap",
    preload: true,
    fallback: ['serif'],
});
