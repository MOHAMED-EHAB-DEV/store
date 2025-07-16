const NavbarLinks = [
    {
        id: 1,
        text: "Templates",
        link: "/templates",
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
        subtext: 'Join thousands of developers building faster, cleaner, and smarter with our templates.',
        button: 'Browse Templates',
    },
    conversion: {
        badge: '🚀 Launch Your Site in Minutes',
        badgeColor: 'from-green-400 via-green-500 to-green-400',
        heading: 'Build Smarter. Save Time.',
        subtext: 'Professionally designed templates, optimized for performance and ready to launch today.',
        button: 'Start Now',
    },
    promo: {
        badge: '🔥 New Templates Just Dropped!',
        badgeColor: 'from-red-400 via-red-500 to-red-400',
        heading: 'Fresh Designs for Your Next Project',
        subtext: 'Stay ahead of trends with our latest, cutting-edge templates. Limited-time discounts available.',
        button: 'Shop Now',
    },
    speed: {
        badge: '⚡ Build & Launch in Hours',
        badgeColor: 'from-blue-400 via-blue-500 to-blue-400',
        heading: 'Stop Waiting. Start Creating.',
        subtext: 'Get professional, pre-designed templates that make launching effortless.',
        button: 'Get Started Now',
    },
    business: {
        badge: 'Perfect for Agencies & Freelancers',
        badgeColor: 'from-purple-400 via-purple-500 to-purple-400',
        heading: 'Grow Your Business Faster',
        subtext: 'Spend less time coding and more time closing deals with templates that convert.',
        button: 'Explore Templates',
    },
    affordable: {
        badge: 'Affordable Premium Templates',
        badgeColor: 'from-pink-400 via-pink-500 to-pink-400',
        heading: 'Premium Designs at Your Fingertips',
        subtext: 'Get modern, responsive templates without the premium price tag.',
        button: 'View Pricing',
    },
    community: {
        badge: 'Join 10,000+ Creators',
        badgeColor: 'from-indigo-400 via-indigo-500 to-indigo-400',
        heading: 'Build Together. Grow Together.',
        subtext: 'Collaborate, share, and customize templates that fit your brand vision.',
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
        subtext: 'No more waiting weeks for developers—our templates make launching effortless.',
        button: 'Start Building',
    },
    modern: {
        badge: '✨ Designed for Perfection',
        badgeColor: 'from-pink-500 via-pink-600 to-pink-500',
        heading: 'Modern Designs for Modern Brands',
        subtext: 'Polished, responsive templates built for businesses that care about details.',
        button: 'Explore Designs',
    },
    easy: {
        badge: 'Easy for Beginners, Powerful for Pros',
        badgeColor: 'from-sky-400 via-sky-500 to-sky-400',
        heading: 'Build Without Limits',
        subtext: 'Our templates are simple to use yet customizable for advanced users.',
        button: 'Browse Templates',
    },
    costSaving: {
        badge: 'Cut Development Costs by 70%',
        badgeColor: 'from-orange-400 via-orange-500 to-orange-400',
        heading: 'Spend Less, Build More',
        subtext: 'Why start from scratch when you can use high-quality templates at a fraction of the cost?',
        button: 'Start Saving',
    },
    tech: {
        badge: 'Built on React & Next.js',
        badgeColor: 'from-lime-400 via-lime-500 to-lime-400',
        heading: 'Future-Ready Web Templates',
        subtext: 'Stay ahead with templates that use the latest frameworks and best practices.',
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
        subtext: 'Our templates eliminate complexity so you can focus on growing your business.',
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
        subtext: 'Upgrade your workflow and save big on premium templates. Offer ends soon.',
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
        desc: "Framer templates built for speed. Whether you're a founder or a team of one, launch fast and stay focused on growth.",
    }
];

export {
    NavbarLinks,
    HeroItems,
    heroVariants
}