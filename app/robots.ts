import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://mhd-store.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/templates",
          "/templates/*",
          "/blog",
          "/blog/*",
          "/support",
          "/login",
          "/register",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/_next/",
          "/private/",
          "/*.json$",
          "/user/",
          "/favorites/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/templates",
          "/templates/*",
          "/blog",
          "/blog/*",
          "/support",
        ],
        disallow: ["/api/", "/admin/", "/dashboard/", "/user/", "/favorites/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
