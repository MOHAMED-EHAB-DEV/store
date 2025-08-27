import React from 'react';

interface OrganizationProps {
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
  contactPoint?: {
    telephone: string;
    contactType: string;
    email: string;
  };
}

interface ProductProps {
  name: string;
  description: string;
  image: string | string[];
  sku: string;
  brand: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  offers?: {
    price: number;
    currency: string;
    availability: string;
    url: string;
  };
}

interface BreadcrumbProps {
  items: Array<{
    name: string;
    url: string;
    position: number;
  }>;
}

interface ReviewProps {
  itemReviewed: {
    name: string;
    image: string;
  };
  reviewRating: {
    ratingValue: number;
    bestRating: number;
  };
  author: {
    name: string;
  };
  reviewBody: string;
  datePublished: string;
}

export const OrganizationSchema: React.FC<OrganizationProps> = ({
  name,
  url,
  logo,
  sameAs,
  contactPoint
}) => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: {
      "@type": "ImageObject",
      url: logo
    },
    ...(sameAs && { sameAs }),
    ...(contactPoint && { contactPoint: {
      "@type": "ContactPoint",
      ...contactPoint
    }})
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  );
};

export const ProductSchema: React.FC<ProductProps> = ({
  name,
  description,
  image,
  sku,
  brand,
  price,
  currency,
  availability,
  url,
  aggregateRating,
  offers
}) => {
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: Array.isArray(image) ? image : [image],
    sku,
    brand: {
      "@type": "Brand",
      name: brand
    },
    offers: offers || {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url
    },
    ...(aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
    />
  );
};

export const BreadcrumbSchema: React.FC<BreadcrumbProps> = ({ items }) => {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(item => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  );
};

export const ReviewSchema: React.FC<ReviewProps> = ({
  itemReviewed,
  reviewRating,
  author,
  reviewBody,
  datePublished
}) => {
  const reviewData = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: itemReviewed.name,
      image: itemReviewed.image
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: reviewRating.ratingValue,
      bestRating: reviewRating.bestRating
    },
    author: {
      "@type": "Person",
      name: author.name
    },
    reviewBody,
    datePublished
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewData) }}
    />
  );
};
