import { Metadata } from "next";
import FAQsClient from "@/components/faqs/FAQsClient";

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Premium Templates",
  description: "Find answers to common questions about our premium templates, pricing, licensing, and support. Get help with your template purchases and downloads.",
  keywords: ["FAQ", "help", "support", "templates", "questions", "answers"],
  alternates: {
    canonical: `${domain}/faqs`
  },
  openGraph: {
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about our premium templates",
    type: "website",
    url: `${domain}/faqs`,
    images: [{
        url: `${domain}/assets/Icons/cover.jpg`,
        width: 1200,
        height: 630,
        alt: "FAQs"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about our premium templates",
    images: [`${domain}/assets/Icons/cover.jpg`]
  }
};

async function getFAQs() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/faqs`, {
      method: 'GET',
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/faqs/categories`, {
      method: 'GET',
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error("Error fetching FAQ categories:", error);
    return [];
  }
}

export default async function FAQsPage() {
  const [faqs, categories] = await Promise.all([
    getFAQs(),
    getCategories()
  ]);

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq: any) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <FAQsClient faqs={faqs} categories={categories} />
    </>
  );
}