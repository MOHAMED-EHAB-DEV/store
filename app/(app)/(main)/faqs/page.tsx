import { buildMetadata } from "@/lib/seo";
import FAQsClient from "@/components/faqs/FAQsClient";
import { FAQS, FAQ_CATEGORIES } from "@/constants/faqs";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions | Premium Templates",
  description: "Find answers to common questions about our premium templates, pricing, licensing, and support. Get help with your template purchases and downloads.",
  path: "/faqs",
});

export default async function FAQsPage() {
  const faqs = FAQS.map((faq) => ({
    _id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    order: 0,
  }));

  const categories = FAQ_CATEGORIES.map((cat) => {
    const count = FAQS.filter((faq) => faq.category === cat.id).length;
    return {
      _id: cat.id,
      name: cat.name,
      count,
    };
  });

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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