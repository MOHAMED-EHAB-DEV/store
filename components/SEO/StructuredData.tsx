import React from "react";

export const PersonSchema: React.FC<{
    name: string;
    url: string;
    image: string;
    sameAs?: string[];
}> = ({name, url, image, sameAs}) => {
    const data = {
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        url,
        image,
        ...(sameAs && {sameAs}),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
        />
    );
};

export const TemplateSchema: React.FC<{
    title: string;
    description: string;
    thumbnail: string;
    demoLink: string;
    price: number;
    currency: string;
    author?: { name: string; url?: string; image?: string };
    tags?: string[];
    categories?: { name: string; slug: string }[];
    builtWith: "framer" | "figma" | "vite" | "next.js";
    averageRating?: number;
    reviewCount?: number;
}> = (
    {
        title,
        description,
        thumbnail,
        demoLink,
        price,
        currency,
        author,
        tags,
        categories,
        builtWith,
        averageRating,
        reviewCount,
    }) => {
    const data = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: title,
        description,
        image: thumbnail,
        url: demoLink,
        // author: {
        //     "@type": "Person",
        //     name: author.name,
        //     ...(author.url && {url: author.url}),
        //     ...(author.image && {image: author.image}),
        // },
        keywords: tags?.join(", "),
        genre: categories?.map((c) => c.name),
        learningResourceType: "Template",
        programmingLanguage: builtWith,
        offers: {
            "@type": "Offer",
            price: price.toString(),
            priceCurrency: currency,
            availability: "https://schema.org/InStock",
            url: demoLink,
        },
        ...(averageRating &&
            reviewCount && {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: averageRating,
                    reviewCount,
                },
            }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
        />
    );
};

/* ---------- BREADCRUMB SCHEMA ---------- */
export const BreadcrumbSchema: React.FC<{
    items: Array<{ name: string; url: string; position: number }>;
}> = ({items}) => {
    const data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item) => ({
            "@type": "ListItem",
            position: item.position,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
        />
    );
};

/* ---------- REVIEW SCHEMA ---------- */
export const ReviewSchema: React.FC<{
    itemReviewed: { title: string; thumbnail: string };
    reviewRating: { ratingValue: number; bestRating: number };
    author: { name: string };
    reviewBody: string;
    datePublished: string;
}> = ({itemReviewed, reviewRating, author, reviewBody, datePublished}) => {
    const data = {
        "@context": "https://schema.org",
        "@type": "Review",
        itemReviewed: {
            "@type": "CreativeWork",
            name: itemReviewed.title,
            image: itemReviewed.thumbnail,
        },
        reviewRating: {
            "@type": "Rating",
            ratingValue: reviewRating.ratingValue,
            bestRating: reviewRating.bestRating,
        },
        author: {
            "@type": "Person",
            name: author.name,
        },
        reviewBody,
        datePublished,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
        />
    );
};
