interface SnippetTab {
  id: string;
  name: string;
  lang: string;
  lines: { tokens: { text: string; color?: string }[] }[];
}

export const VSCODE_SNIPPETS: SnippetTab[] = [
  {
    id: "app-router",
    name: "page.tsx",
    lang: "Next.js 16 • React 19",
    lines: [
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "Suspense", color: "text-yellow-300" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "react"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "Hero", color: "text-yellow-300" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/components/Hero"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "ProductGrid", color: "text-yellow-300" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/components/ProductGrid"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "getFeaturedTemplates", color: "text-blue-400" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/lib/templates"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "export default async function", color: "text-purple-400" },
          { text: " " },
          { text: "StorePage", color: "text-blue-300 font-bold" },
          { text: "() {" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "const", color: "text-purple-400" },
          { text: " templates = " },
          { text: "await", color: "text-purple-400" },
          { text: " " },
          { text: "getFeaturedTemplates", color: "text-blue-400" },
          { text: "();" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "  " },
          { text: "return", color: "text-purple-400" },
          { text: " (" },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "<", color: "text-gray-500" },
          { text: "main", color: "text-cyan-400" },
          { text: " " },
          { text: "className", color: "text-sky-300" },
          { text: "=" },
          { text: '"flex flex-col gap-16 min-h-screen"', color: "text-emerald-400" },
          { text: ">", color: "text-gray-500" },
        ],
      },
      {
        tokens: [
          { text: "      " },
          { text: "<", color: "text-gray-500" },
          { text: "Hero", color: "text-yellow-300" },
          { text: " />", color: "text-gray-500" },
        ],
      },
      {
        tokens: [
          { text: "      " },
          { text: "<", color: "text-gray-500" },
          { text: "Suspense", color: "text-yellow-300" },
          { text: " " },
          { text: "fallback", color: "text-sky-300" },
          { text: "={" },
          { text: "<", color: "text-gray-500" },
          { text: "ProductGrid.Skeleton", color: "text-yellow-300" },
          { text: " />", color: "text-gray-500" },
          { text: "}>" },
        ],
      },
      {
        tokens: [
          { text: "        " },
          { text: "<", color: "text-gray-500" },
          { text: "ProductGrid", color: "text-yellow-300" },
          { text: " " },
          { text: "items", color: "text-sky-300" },
          { text: "={" },
          { text: "templates", color: "text-white" },
          { text: "} />" },
        ],
      },
      {
        tokens: [
          { text: "      " },
          { text: "</", color: "text-gray-500" },
          { text: "Suspense", color: "text-yellow-300" },
          { text: ">", color: "text-gray-500" },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "</", color: "text-gray-500" },
          { text: "main", color: "text-cyan-400" },
          { text: ">", color: "text-gray-500" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: ");" },
        ],
      },
      {
        tokens: [{ text: "}" }],
      },
    ],
  },
  {
    id: "server-action",
    name: "checkout.ts",
    lang: "Server Actions",
    lines: [
      {
        tokens: [
          { text: "'use server'", color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "auth", color: "text-blue-400" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/lib/auth"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "import", color: "text-purple-400" },
          { text: " { " },
          { text: "createStripeCheckout", color: "text-blue-400" },
          { text: " } " },
          { text: "from", color: "text-purple-400" },
          { text: ' "@/lib/payments"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "export async function", color: "text-purple-400" },
          { text: " " },
          { text: "handlePurchase", color: "text-blue-300 font-bold" },
          { text: "(" },
          { text: "templateId", color: "text-sky-300" },
          { text: ": " },
          { text: "string", color: "text-teal-400" },
          { text: ") {" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "const", color: "text-purple-400" },
          { text: " session = " },
          { text: "await", color: "text-purple-400" },
          { text: " " },
          { text: "auth", color: "text-blue-400" },
          { text: "();" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "if", color: "text-purple-400" },
          { text: " (!session?.user) " },
          { text: "throw new", color: "text-purple-400" },
          { text: " " },
          { text: "Error", color: "text-yellow-300" },
          { text: "(" },
          { text: '"Unauthorized"', color: "text-emerald-400" },
          { text: ");" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "  " },
          { text: "const", color: "text-purple-400" },
          { text: " checkoutUrl = " },
          { text: "await", color: "text-purple-400" },
          { text: " " },
          { text: "createStripeCheckout", color: "text-blue-400" },
          { text: "({" },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "userId", color: "text-sky-300" },
          { text: ": session.user.id," },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "templateId", color: "text-sky-300" },
          { text: "," },
        ],
      },
      {
        tokens: [
          { text: "    " },
          { text: "successUrl", color: "text-sky-300" },
          { text: ": " },
          { text: "'/dashboard/downloads'", color: "text-emerald-400" },
          { text: "," },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "});" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "  " },
          { text: "return", color: "text-purple-400" },
          { text: " { redirectUrl: checkoutUrl };" },
        ],
      },
      {
        tokens: [{ text: "}" }],
      },
    ],
  },
  {
    id: "tailwind-v4",
    name: "theme.css",
    lang: "Tailwind CSS v4",
    lines: [
      {
        tokens: [
          { text: "@import", color: "text-purple-400" },
          { text: ' "tailwindcss"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "@plugin", color: "text-purple-400" },
          { text: ' "tailwindcss-animate"', color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "@theme", color: "text-pink-400 font-bold" },
          { text: " {" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "--color-primary", color: "text-sky-300" },
          { text: ": " },
          { text: "#0d0f19", color: "text-yellow-300" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "--color-card", color: "text-sky-300" },
          { text: ": " },
          { text: "#15161b", color: "text-yellow-300" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "--color-neon-cyan", color: "text-sky-300" },
          { text: ": " },
          { text: "#06b6d4", color: "text-yellow-300" },
          { text: ";" },
        ],
      },
      {
        tokens: [
          { text: "  " },
          { text: "--color-electric-violet", color: "text-sky-300" },
          { text: ": " },
          { text: "#a855f7", color: "text-yellow-300" },
          { text: ";" },
        ],
      },
      { tokens: [{ text: "" }] },
      {
        tokens: [
          { text: "  " },
          { text: "--animate-border-beam", color: "text-sky-300" },
          { text: ": " },
          { text: "borderBeam 8s linear infinite", color: "text-emerald-400" },
          { text: ";" },
        ],
      },
      {
        tokens: [{ text: "}" }],
      },
    ],
  },
];