import { Metadata } from "next";
import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import FAQsClient from "@/components/faqs/FAQsClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Premium Templates",
  description: "Find answers to common questions about our premium templates, pricing, licensing, and support. Get help with your template purchases and downloads.",
  keywords: ["FAQ", "help", "support", "templates", "questions", "answers"],
  openGraph: {
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about our premium templates",
    type: "website",
  },
};

export const revalidate = 604800; // 7 days in seconds

async function getFAQs() {
  try {
    await connectToDatabase();

    const faqs = await FAQ.find({ isPublished: true })
      .select("_id question answer category order coverImage")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(faqs));
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

async function getCategories() {
  try {
    await connectToDatabase();
    const categoriesData = await FAQ.getCategories();
    // Map to include name field (category name is stored in _id)
    return categoriesData.map(cat => ({
      _id: cat._id,
      name: cat._id, // Category name is the _id field
      count: cat.count
    }));
  } catch (error) {
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