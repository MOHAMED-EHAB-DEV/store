import localFont from 'next/font/local';

export const Roboto = localFont({
    src: [
        {
            path: '../public/assets/fonts/Roboto/Roboto-Thin.ttf',
            weight: '100',
            style: 'normal',
        },
        {
            path: '../public/assets/fonts/Roboto/Roboto-ExtraLight.ttf',
            weight: '200',
            style: 'normal',
        },
        {
            path: '../public/assets/fonts/Roboto/Roboto-Light.ttf',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../public/assets/fonts/Roboto/Roboto-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../public/assets/fonts/Roboto/Roboto-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: '../public/assets/fonts/Roboto/Roboto-SemiBold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: '../public/assets/fonts/Roboto/Roboto-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
        {
            path: '../public/assets/fonts/Roboto/Roboto-ExtraBold.ttf',
            weight: '800',
            style: 'normal',
        },
        {
            path: '../public/assets/fonts/Roboto/Roboto-Black.ttf',
            weight: '900',
            style: 'normal',
        },
        {
            path: '../public/assets/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf',
            weight: '100 900',
            style: 'normal',
        },
    ],
    variable: '--roboto',
    display: "swap",
    preload: true,
    fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

export const Parastoo = localFont({
  src: [
    {
      path: "../public/assets/fonts/Parastoo/Parastoo-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Parastoo/static/Parastoo-Regular.ttf",
      weight: "400",
      style: "regular",
    },
    {
      path: "../public/assets/fonts/Parastoo/static/Parastoo-Medium.ttf",
      weight: "500",
      style: "medium",
    },
    {
      path: "../public/assets/fonts/Parastoo/static/Parastoo-SemiBold.ttf",
      weight: "600",
      style: "semibold",
    },
    {
      path: "../public/assets/fonts/Parastoo/static/Parastoo-Bold.ttf",
      weight: "700",
      style: "bold",
    },
  ],
  variable: "--font-parastoo",
  preload: true,
  display: "swap",
  fallback: ['serif'],
});
