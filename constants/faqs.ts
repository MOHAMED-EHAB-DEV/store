export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export const FAQ_CATEGORIES = [
    { id: "general", name: "General", icon: "ℹ️" },
    { id: "products", name: "Templates", icon: "🛍️" },
    { id: "custom-dev", name: "Custom Dev", icon: "💻" },
    { id: "technical", name: "Technical", icon: "⚙️" },
    { id: "payment", name: "Payment", icon: "💳" },
] as const;

export const FAQS: FAQ[] = [
    // General
    {
        id: "what-is-store",
        question: "What exactly do you offer?",
        answer: "We specialize in premium, production-ready Next.js and Tailwind CSS templates designed for developers and agencies. In addition to our template marketplace, we offer bespoke custom Next.js development services for businesses needing tailored architectures.",
        category: "general",
    },
    {
        id: "usage-rights",
        question: "Can I use your templates for commercial client projects?",
        answer: "Yes! All of our premium templates come with a commercial license. You can use them to build websites for your personal business or for your clients. However, you cannot resell the raw template files or distribute the source code publicly.",
        category: "general",
    },

    // Templates
    {
        id: "template-customization",
        question: "How easy is it to customize the templates?",
        answer: "Extremely easy if you know React. Our templates are built using standard Next.js (App Router) and Tailwind CSS. We avoid overly complex abstractions, meaning you can jump right into the code and modify components, colors, and logic just like any standard React project.",
        category: "products",
    },
    {
        id: "update-access",
        question: "Do I get free updates when Next.js releases new versions?",
        answer: "Yes. When you purchase a template, you receive lifetime access to updates. As Next.js and React evolve, we update our codebases to ensure compatibility with the latest best practices, and you can download the latest version from your dashboard at any time.",
        category: "products",
    },
    {
        id: "figma-files",
        question: "Are Figma design files included with the code?",
        answer: "Yes, the majority of our premium templates include the original Figma design files, allowing your design team to map out changes before you touch the codebase.",
        category: "products",
    },

    // Custom Dev
    {
        id: "custom-dev-process",
        question: "How does the custom development process work?",
        answer: "It starts with a discovery call to map out your architecture and database needs. From there, we handle UI/UX prototyping in Figma, followed by full-stack development using Next.js, Tailwind, and MongoDB. We finish with rigorous performance testing and deployment.",
        category: "custom-dev",
    },
    {
        id: "custom-dev-pricing",
        question: "How much does custom Next.js development cost?",
        answer: "Our custom development projects start at $599. The final price depends entirely on the scope, number of pages, backend complexity, and interactive features (like GSAP animations) required. We provide a fixed-price quote before any work begins.",
        category: "custom-dev",
    },

    // Technical
    {
        id: "tech-stack-details",
        question: "What tech stack do your templates use?",
        answer: "Our templates are strictly built on Next.js (using the modern App Router) and React. For styling, we use Tailwind CSS. For animations, we utilize Framer Motion or GSAP depending on the template's requirements.",
        category: "technical",
    },
    {
        id: "seo-optimization",
        question: "Are the templates optimized for SEO?",
        answer: "Absolutely. SEO is a first-class citizen in our templates. We utilize Next.js Server-Side Rendering (SSR), dynamic metadata generation, and inject structured JSON-LD data by default to ensure you rank highly on Google right out of the box.",
        category: "technical",
    },

    // Payment
    {
        id: "payment-methods",
        question: "What payment methods do you accept?",
        answer: "We securely process payments via Stripe, accepting all major credit cards, Apple Pay, and Google Pay.",
        category: "payment",
    },
];
