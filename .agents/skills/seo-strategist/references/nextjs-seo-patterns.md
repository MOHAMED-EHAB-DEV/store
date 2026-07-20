# Next.js SEO Implementation Patterns (App Router)

Use these when writing the "Technical Fixes" section of the report so
recommendations are copy-pasteable, not abstract advice. Adjust import
paths/casing to match the project's actual conventions (check
`codebase-report.json` for whether the project uses `src/app` or `app`).

## Per-page metadata (static)
```tsx
// app/about/page.tsx
export const metadata = {
  title: "About MHD Store | Premium Next.js Templates & Custom Builds",
  description: "Learn how MHD Store helps developers ship faster with premium Next.js templates and custom development services.",
  alternates: { canonical: "https://example.com/about" },
  openGraph: {
    title: "About MHD Store",
    description: "Premium Next.js templates and custom development, built by developers.",
    url: "https://example.com/about",
    type: "website",
    images: ["/og/about.png"],
  },
  twitter: { card: "summary_large_image" },
};
```

## Per-page metadata (dynamic, e.g. product/template detail pages)
```tsx
// app/templates/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const template = await getTemplate(params.slug);
  if (!template) return {};
  return {
    title: `${template.name} — Next.js Template | MHD Store`,
    description: template.shortDescription,
    alternates: { canonical: `https://example.com/templates/${params.slug}` },
    openGraph: {
      title: template.name,
      description: template.shortDescription,
      images: [template.thumbnailUrl],
      type: "product",
    },
  };
}
```

## Programmatic sitemap
```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const templates = await getAllTemplateSlugs();
  return [
    { url: "https://example.com", changeFrequency: "weekly", priority: 1 },
    { url: "https://example.com/templates", changeFrequency: "daily", priority: 0.9 },
    ...templates.map((slug) => ({
      url: `https://example.com/templates/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
```

## Programmatic robots.txt
```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/"] },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

## JSON-LD structured data (Product example, applies similarly to Article/FAQPage/Organization)
```tsx
export default function TemplatePage({ template }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: template.name,
    description: template.shortDescription,
    image: template.thumbnailUrl,
    offers: {
      "@type": "Offer",
      price: template.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* page content */}
    </>
  );
}
```

## Font optimization (replace external Google Fonts `<link>`)
```tsx
// app/layout.tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## Icon import fix (avoid barrel-import bloat)
```tsx
// Before — pulls in far more than needed, hurts tree-shaking
import { Home, User, Settings } from "lucide-react";

// lucide-react is already tree-shakeable per-icon in modern versions;
// the bigger real-world offender is react-icons:

// Before
import { FaHome } from "react-icons"; // pulls the whole package graph

// After
import { FaHome } from "react-icons/fa"; // subpath import, tree-shakes correctly
```

## `next.config` security + caching headers
```js
// next.config.js
module.exports = {
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] },
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
```

## ISR for pages that need to stay fresh for SEO without full SSR cost
```tsx
export const revalidate = 3600; // seconds — re-render in the background at most hourly
```
