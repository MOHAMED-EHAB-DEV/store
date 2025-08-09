import {
    Blocks,
    Shield,
    Cpu,
    Palette,
    Layers,
    MousePointer,
    Smartphone,
    Code2,
    LayoutDashboard,
    Settings,
    Templates,
    Instagram,
    Linkedin,
} from "@/components/ui/svgs/Icons";

const NavigationLinks = [
    {
        id: 0,
        text: "Home",
        link: "/",
    },
    {
        id: 1,
        text: "Templates",
        link: "/template",
    },
    {
        id: 2,
        text: "Blog",
        link: "/blog",
    },
    {
        id: 3,
        text: "Support",
        link: "/support",
    },
];

const heroVariants = {
    authority: {
        badge: 'Trusted by 50k+ Developers',
        badgeColor: 'from-yellow-400 via-yellow-500 to-yellow-400',
        heading: 'Premium Templates for Modern Web Projects',
        subtext: 'Join thousands of developers building faster, cleaner, and smarter with our template.',
        button: 'Browse Templates',
    },
    conversion: {
        badge: '🚀 Launch Your Site in Minutes',
        badgeColor: 'from-green-400 via-green-500 to-green-400',
        heading: 'Build Smarter. Save Time.',
        subtext: 'Professionally designed template, optimized for performance and ready to launch today.',
        button: 'Start Now',
    },
    promo: {
        badge: '🔥 New Templates Just Dropped!',
        badgeColor: 'from-red-400 via-red-500 to-red-400',
        heading: 'Fresh Designs for Your Next Project',
        subtext: 'Stay ahead of trends with our latest, cutting-edge template. Limited-time discounts available.',
        button: 'Shop Now',
    },
    speed: {
        badge: '⚡ Build & Launch in Hours',
        badgeColor: 'from-blue-400 via-blue-500 to-blue-400',
        heading: 'Stop Waiting. Start Creating.',
        subtext: 'Get professional, pre-designed template that make launching effortless.',
        button: 'Get Started Now',
    },
    business: {
        badge: 'Perfect for Agencies & Freelancers',
        badgeColor: 'from-purple-400 via-purple-500 to-purple-400',
        heading: 'Grow Your Business Faster',
        subtext: 'Spend less time coding and more time closing deals with template that convert.',
        button: 'Explore Templates',
    },
    affordable: {
        badge: 'Affordable Premium Templates',
        badgeColor: 'from-pink-400 via-pink-500 to-pink-400',
        heading: 'Premium Designs at Your Fingertips',
        subtext: 'Get modern, responsive template without the premium price tag.',
        button: 'View Pricing',
    },
    community: {
        badge: 'Join 10,000+ Creators',
        badgeColor: 'from-indigo-400 via-indigo-500 to-indigo-400',
        heading: 'Build Together. Grow Together.',
        subtext: 'Collaborate, share, and customize template that fit your brand vision.',
        button: 'Join the Community',
    },
    developer: {
        badge: 'Built with Next.js & Tailwind',
        badgeColor: 'from-cyan-400 via-cyan-500 to-cyan-400',
        heading: 'For Developers, By Developers',
        subtext: 'Clean code, reusable components, and blazing fast performance for your projects.',
        button: 'Browse Components',
    },
    discount: {
        badge: '🎉 Limited-Time Discount',
        badgeColor: 'from-amber-400 via-amber-500 to-amber-400',
        heading: 'Save Big on Premium Templates',
        subtext: 'Grab your favorite designs today and enjoy up to 50% off.',
        button: 'Claim Your Discount',
    },
    ultimateSpeed: {
        badge: '⏱ Launch in Under an Hour',
        badgeColor: 'from-teal-400 via-teal-500 to-teal-400',
        heading: 'Your Website. Ready Today.',
        subtext: 'No more waiting weeks for developers—our template make launching effortless.',
        button: 'Start Building',
    },
    modern: {
        badge: '✨ Designed for Perfection',
        badgeColor: 'from-pink-500 via-pink-600 to-pink-500',
        heading: 'Modern Designs for Modern Brands',
        subtext: 'Polished, responsive template built for businesses that care about details.',
        button: 'Explore Designs',
    },
    easy: {
        badge: 'Easy for Beginners, Powerful for Pros',
        badgeColor: 'from-sky-400 via-sky-500 to-sky-400',
        heading: 'Build Without Limits',
        subtext: 'Our template are simple to use yet customizable for advanced users.',
        button: 'Browse Templates',
    },
    costSaving: {
        badge: 'Cut Development Costs by 70%',
        badgeColor: 'from-orange-400 via-orange-500 to-orange-400',
        heading: 'Spend Less, Build More',
        subtext: 'Why start from scratch when you can use high-quality template at a fraction of the cost?',
        button: 'Start Saving',
    },
    tech: {
        badge: 'Built on React & Next.js',
        badgeColor: 'from-lime-400 via-lime-500 to-lime-400',
        heading: 'Future-Ready Web Templates',
        subtext: 'Stay ahead with template that use the latest frameworks and best practices.',
        button: 'Shop Templates',
    },
    creative: {
        badge: 'Unleash Your Creativity',
        badgeColor: 'from-fuchsia-400 via-fuchsia-500 to-fuchsia-400',
        heading: 'Design Without Boundaries',
        subtext: 'Start with a template, then customize it your way to create something truly unique.',
        button: 'Create Now',
    },
    stressFree: {
        badge: 'Drag. Drop. Done.',
        badgeColor: 'from-emerald-400 via-emerald-500 to-emerald-400',
        heading: 'Websites Made Easy',
        subtext: 'Our template eliminate complexity so you can focus on growing your business.',
        button: 'Build Instantly',
    },
    scalable: {
        badge: 'Perfect for Startups & Enterprises',
        badgeColor: 'from-violet-400 via-violet-500 to-violet-400',
        heading: 'Scale Without Rebuilding',
        subtext: 'Templates designed to grow with your business and adapt to your needs.',
        button: 'Start Scaling',
    },
    mobile: {
        badge: '100% Responsive',
        badgeColor: 'from-rose-400 via-rose-500 to-rose-400',
        heading: 'Look Amazing on Any Device',
        subtext: 'Templates that are fully optimized for mobile, tablet, and desktop views.',
        button: 'Get Responsive Designs',
    },
    limitedOffer: {
        badge: '🔥 50% Off This Week',
        badgeColor: 'from-red-500 via-red-600 to-red-500',
        heading: 'Don’t Miss This Deal',
        subtext: 'Upgrade your workflow and save big on premium template. Offer ends soon.',
        button: 'Grab the Deal',
    },
};

const HeroItems = [
    {
        id: 1,
        title: "Beautifully Crafted Designs",
        desc: "Designed in Figma to help you stand out and win trust—perfect for startups and design-focused teams.",
    },
    {
        id: 2,
        title: "Production-Ready Code Templates",
        desc: "Built with the most trusted JavaScript frameworks—ready for developers to plug in and go.",
    },
    {
        id: 3,
        title: "Customize in Minutes, Not Months",
        desc: "Framer template built for speed. Whether you're a founder or a team of one, launch fast and stay focused on growth.",
    }
];

const featuresBusinessSales = [
    {
        iconPath: "/assets/Icons/paypal.svg",
        text: "You received 1000$ from John!"
    },
    {
        iconPath: "/assets/Icons/stripe.svg",
        text: "You received a payment of $5,987!"
    },
    {
        iconPath: "/assets/Icons/wh.avif",
        text: "Woohoo! You made a sale!"
    },
]

const codeFeatures = [
    {
        icon: Code2,
        title: "Next-Gen Frameworks",
        description: "Cutting-edge template built with React, Next.js, and TypeScript for lightning-fast development.",
    },
    {
        icon: Blocks,
        title: "Scalable Architecture",
        description: "Crafted with modular, reusable components following industry-leading best practices.",
    },
    {
        icon: Shield,
        title: "Battle-Tested Code",
        description: "Production-ready, secure, and optimized template that are trusted for real-world deployments.",
    },
    {
        icon: Cpu,
        title: "Blazing Performance",
        description: "Ultra-fast template engineered for SEO, accessibility, and modern performance standards.",
    },
];

const figmaFeatures = [
    {
        icon: Palette,
        title: 'Design Systems',
        description: 'Complete design systems with components, colors, and typography',
    },
    {
        icon: Layers,
        title: 'Component Libraries',
        description: 'Reusable components for faster design workflow',
    },
    {
        icon: MousePointer,
        title: 'Interactive Prototypes',
        description: 'Ready-to-use prototypes with micro-interactions',
    },
    {
        icon: Smartphone,
        title: 'Multi-Device Layouts',
        description: 'Responsive designs for all screen sizes',
    },
];

const socialImgs = [
    {
        name: "Instagram",
        Icon: Instagram,
        link: "https://www.instagram.com/__m4_e__/"
    },
    {
        name: "Linkedin",
        Icon: Linkedin,
        link: "https://www.linkedin.com/in/1-mohammed"
    },
];

const DashboardSidebarLinks = [
    {
        Icon: LayoutDashboard,
        text: "Purchased Templates",
        link: "/purchased-templates",
    },
    {
        Icon: Settings,
        text: "Settings",
        link: "/settings",
    }
];

const AdminSidebarLinks = [
    {
        Icon: LayoutDashboard,
        text: "Dashboard",
        link: "/admin/dashboard",
    },
    {
        Icon: Templates,
        text: "Templates",
        link: "/admin/templates",
    }
];

const passwordRequirements = (password: string) => [
    {
        text: "At least 8 characters",
        met: password.length >= 8,
    },
    {
        text: "Contains uppercase letter",
        met: /[A-Z]/.test(password),
    },
    {
        text: "Contains lowercase letter",
        met: /[a-z]/.test(password),
    },
    {
        text: "Contains number",
        met: /\d/.test(password),
    },
];

const whatLoseWhenDeleteMyAccount = [
    "You'll lose all your purchased template.",
    "You won't be able to access your order history or download links.",
    "You’ll lose access to your saved template and account-related features."
];

export {
    NavigationLinks,
    HeroItems,
    heroVariants,
    featuresBusinessSales,
    codeFeatures,
    figmaFeatures,
    socialImgs,
    DashboardSidebarLinks,
    passwordRequirements,
    whatLoseWhenDeleteMyAccount,
    AdminSidebarLinks,
}
