import "@/app/markdown.css";
import type { Metadata } from "next";
import { truncateDescription } from "@/lib/seo";
import { notFound } from "next/navigation";
import { anyImgUrl } from "@/lib/utils/image";
import ViewTracker from "@/components/Blog/ViewTracker";
import BlogHeader from "@/components/singlePost/BlogHeader";
import BlogContent from "@/components/singlePost/BlogContent";
import BlogSidebar from "@/components/singlePost/BlogSidebar";
import FloatingToolbar from "@/components/singlePost/FloatingToolbar";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://mhd-store.vercel.app";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  createdAt: string;
  tags?: string[];
  author?: {
    name: string;
    avatar?: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const getData = async (idOrSlug: string) => {
  try {
    const res = await fetch(`${APP_URL}/api/blogs/${idOrSlug}`, {
      method: "GET",
      next: { revalidate: 60 * 60 * 24 * 7, tags: [`blog-${idOrSlug}`] },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Failed to fetch blog post:", error);
    return null;
  }
};

const getRecentPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`${APP_URL}/api/blogs?limit=5`, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.success ? (data.data as BlogPost[]) : [];
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return [];
  }
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const blog = await getData(id);

  if (!blog) {
    return {
      title: "Post Not Found",
    };
  }

  const url = `${APP_URL}/blog/${blog.slug || id}`;
  const authorName =
    blog.author?.name === "MEDO" || !blog.author?.name
      ? "Mohammed Ehab"
      : blog.author.name;

  // Strip markdown characters for a cleaner meta description
  const stripMarkdown = (md: string) =>
    md
      .replace(/[#*`_\[\]()>]/g, "")
      .replace(/\n+/g, " ")
      .trim();
  const cleanDesc = blog.excerpt
    ? truncateDescription(blog.excerpt, 160)
    : truncateDescription(stripMarkdown(blog.content || ""), 160);

  const imageUrl = blog.coverImage || `${APP_URL}/screenshots/1.png`;

  return {
    title: `${blog.title} | Blog`,
    description: cleanDesc,
    authors: [{ name: authorName }],
    keywords: blog.tags || [],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${blog.title} | Blog`,
      description: cleanDesc,
      url: url,
      type: "article",
      publishedTime: blog.createdAt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${blog.title} | Blog`,
      description: cleanDesc,
      images: [imageUrl],
    },
  };
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  const [blog, recentPosts] = await Promise.all([
    getData(id),
    getRecentPosts(),
  ]);

  if (!blog) {
    notFound();
  }

  const otherPosts = recentPosts.filter((p) => p._id !== blog._id).slice(0, 3);

  const authorName =
    blog.author?.name === "MEDO" || !blog.author?.name
      ? "Mohammed Ehab"
      : blog.author.name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    image: blog.coverImage
      ? [anyImgUrl(blog.coverImage, { width: 1200, quality: 85 })]
      : [],
    datePublished: blog.createdAt,
    dateModified: (blog as any).updatedAt || blog.createdAt,
    author: [
      {
        "@type": "Person",
        name: authorName,
        url: "https://mhd-store.vercel.app/",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen w-full py-36 text-gray-200">
        <ViewTracker blogId={id} />
        <BlogHeader blog={blog} />

        <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 max-w-7xl">
          <BlogContent blog={blog} />
          <BlogSidebar otherPosts={otherPosts} />
        </div>
      </main>
      
      <FloatingToolbar 
        blogId={blog._id} 
        initialLoves={blog.loves || 0} 
        title={blog.title}
        url={`${APP_URL}/blog/${blog.slug || id}`}
      />
    </>
  );
};

export default Page;