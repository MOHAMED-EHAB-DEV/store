export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export const FAQ_CATEGORIES = [
    {
        id: "general",
        name: "General",
        icon: "ℹ️",
    },
    {
        id: "orders",
        name: "Orders",
        icon: "📦",
    },
    {
        id: "products",
        name: "Templates",
        icon: "🛍️",
    },
    // {
    //     id: "returns",
    //     name: "Refunds",
    //     icon: "↩️",
    // },
    {
        id: "account",
        name: "Account",
        icon: "🔐",
    },
    {
        id: "payment",
        name: "Payment",
        icon: "💳",
    },
] as const;

export const FAQS: FAQ[] = [
    // General
    {
        id: "what-is-store",
        question: "What does this templates store offer?",
        answer: "We provide high-quality digital templates including website templates, landing pages, Framer templates, dashboards, and coded components. All items are ready to use and fully customizable.",
        category: "general",
    },
    {
        id: "how-to-contact",
        question: "How can I contact support?",
        answer: "You can contact us anytime via our Contact Form. We typically respond within 24 hours.",
        category: "general",
    },
    {
        id: "usage-rights",
        question: "Can I use the templates for commercial projects?",
        answer: "No. Paid templates only include a commercial use license, allowing you to use them in client work or commercial projects. However, reselling or redistributing the template files is not allowed.",
        category: "general",
    },

    // Orders
    {
        id: "delivery",
        question: "How do I receive my template after purchase?",
        answer: "All purchases are available for download in your account dashboard.",
        category: "orders",
    },
    {
        id: "update-access",
        question: "Do I get free updates after purchasing a template?",
        answer: "Yes, all templates come with lifetime free updates. You can re-download the updated version anytime from your account.",
        category: "orders",
    },

    // Products
    {
        id: "template-customization",
        question: "Are the templates customizable?",
        answer: "Yes. All templates are designed to be fully editable. Figma templates include layered files, coded templates provide full source code, and Framer templates can be modified visually inside Framer.",
        category: "products",
    },
    {
        id: "software-needed",
        question: "What software do I need to edit my template?",
        answer: "It depends on the template type: Figma requires Figma, Framer templates require a Framer account, and coded templates require a code editor such as VS Code.",
        category: "products",
    },
    {
        id: "license-details",
        question: "What type of license is included?",
        answer: "Each purchase includes a standard commercial license that allows unlimited personal and client projects. You cannot resell, redistribute, or share the files publicly.",
        category: "products",
    },
    {
        id: "template-support",
        question: "Do you offer support for customizing the template?",
        answer: "Yes, we offer guidance and technical support for any template-related issues. However, full custom work or major redesigns are not included.",
        category: "products",
    },

    // Refunds
    // {
    //     id: "refund-policy",
    //     question: "What is your refund policy?",
    //     answer: "Since templates are digital products, refunds are only provided if the item is defective, not delivered, or does not match the description. Contact support within 7 days for refund requests.",
    //     category: "returns",
    // },
    // {
    //     id: "accidental-purchase",
    //     question: "I purchased the wrong template. Can I exchange it?",
    //     answer: "Yes, if the file has not been downloaded yet. Contact support to request an exchange.",
    //     category: "returns",
    // },

    // Account
    {
        id: "account-need",
        question: "Do I need an account to access my purchases?",
        answer: "An account is required during checkout, so you can re-download your purchased templates anytime.",
        category: "account",
    },
    // {
    //     id: "reset-password",
    //     question: "How do I reset my password?",
    //     answer: "Click 'Forgot Password' on the login page and you’ll receive a reset link by email.",
    //     category: "account",
    // },

    // Payment
    {
        id: "payment-methods",
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards and digital payment options depending on your region.",
        category: "payment",
    },
    {
        id: "payment-security",
        question: "Is my payment information secure?",
        answer: "Yes. All payments are processed by secure, encrypted third-party payment processors. No payment information is stored on our servers.",
        category: "payment",
    },
];
