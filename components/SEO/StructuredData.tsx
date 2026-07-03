import React from "react";

export const OrganizationSchema: React.FC = () => {
    const data = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Mohammed Ehab Templates",
        "url": "https://mhd-store.vercel.app",
        "logo": "https://mhd-store.vercel.app/assets/Icons/Logo.svg",
        "sameAs": [
            "https://twitter.com/__M__O__H__",
            "https://github.com/MOHAMED-EHAB-DEV",
            "https://www.linkedin.com/in/1-mohammed"
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
        />
    );
};

export const WebSiteSchema: React.FC = () => {
    const data = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Mohammed Ehab - Premium Templates Store",
        "url": "https://mhd-store.vercel.app",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://mhd-store.vercel.app/templates?query={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
        />
    );
};

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
