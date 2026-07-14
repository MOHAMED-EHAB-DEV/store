import { Metadata } from "next";

export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
  screenshotName,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  screenshotName?: string;
}): Metadata {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `https://mhd-store.vercel.app${cleanPath}`;

  const ogImage = screenshotName 
    ? `/og/${screenshotName}.png` 
    : "/og/home-desktop.png";

  const imageUrl = `https://mhd-store.vercel.app${ogImage}`;

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Mohammed Ehab Templates",
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}

export function truncateDescription(text: string, limit = 160): string {
  if (!text) return "";
  if (text.length <= limit) return text;
  
  let truncated = text.substring(0, limit);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > 0) {
    truncated = truncated.substring(0, lastSpace);
  }
  return truncated.trim() + "…";
}
