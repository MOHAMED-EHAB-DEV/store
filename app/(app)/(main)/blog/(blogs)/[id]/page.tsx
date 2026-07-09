import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import Markdown from '@/components/singleTemplate/Markdown';
import { ArrowLeft } from "@/components/ui/svgs/icons/ArrowLeft";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Share2 } from "@/components/ui/svgs/icons/Share2";
import { Tag } from "@/components/ui/svgs/icons/Tag";
import type { Metadata } from 'next';
import Image from 'next/image';
import { truncateDescription } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { anyImgUrl } from '@/lib/utils/image';
import ViewTracker from '@/components/Blog/ViewTracker';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
            method: 'GET',
            next: { revalidate: 60 * 60 * 24 * 7, tags: [`blog-${idOrSlug}`] }
        });
        if (!res.ok) return null;

        const data = await res.json();
        return data.success ? data.data : null;
    } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
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
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return [];
    }
};


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const blog = await getData(id);

    if (!blog) {
        return {
            title: 'Post Not Found',
        };
    }

    const url = `${APP_URL}/blog/${blog.slug || id}`;
    const authorName = (blog.author?.name === "MEDO" || !blog.author?.name) ? "Mohammed Ehab" : blog.author.name;

    // Strip markdown characters for a cleaner meta description
    const stripMarkdown = (md: string) => md.replace(/[#*`_\[\]()>]/g, '').replace(/\n+/g, ' ').trim();
    const cleanDesc = blog.excerpt 
        ? truncateDescription(blog.excerpt, 160)
        : truncateDescription(stripMarkdown(blog.content || ""), 160);

    const imageUrl = blog.coverImage || `${APP_URL}/screenshots/1.png`;

    // TODO: upload screenshots for this page if coverImage is not present
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
            type: 'article',
            publishedTime: blog.createdAt,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: blog.title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
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
        getRecentPosts()
    ]);

    if (!blog) {
        notFound();
    }

    const otherPosts = recentPosts.filter((p) => p._id !== blog._id).slice(0, 3);

    const authorName = (blog.author?.name === "MEDO" || !blog.author?.name) ? "Mohammed Ehab" : blog.author.name;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: blog.title,
        image: blog.coverImage ? [anyImgUrl(blog.coverImage, { width: 1200, quality: 85 })] : [],
        datePublished: blog.createdAt,
        dateModified: (blog as any).updatedAt || blog.createdAt,
        author: [{
            "@type": "Person",
            name: authorName,
            url: "https://mhd-store.vercel.app/"
        }]
    };

    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <main className="min-h-screen min-w-7xl py-36 text-gray-200">
            <ViewTracker blogId={id} />
            <div className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gray-950">
                    {blog.coverImage && (
                        <Image
                            src={anyImgUrl(blog.coverImage, { width: 1200, quality: 85 })}
                            alt={blog.title}
                            width={1200}
                            height={600}
                            unoptimized
                            className="w-full h-full object-cover rounded-md opacity-40 blur-sm scale-105"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent rounded-md" />
                </div>

                <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center space-y-6">
                    <Link href="/blog" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4 text-sm font-medium uppercase tracking-wider backdrop-blur-sm bg-gray-900/30 px-4 py-2 rounded-full border border-gray-800">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                    </Link>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-2xl">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base text-gray-300">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span>{formatDate(blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span>{Math.max(1, Math.ceil((blog.content || "").split(/\s+/).length / 200))} min read</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 lg:flex gap-12 max-w-7xl">
                <article className="lg:w-2/3">
                    <div className="prose prose-lg prose-invert max-w-none md:prose-xl prose-headings:text-white prose-p:text-gray-300 prose-a:text-purple-400 prose-strong:text-white prose-code:text-pink-400 hover:prose-a:text-purple-300 transition-colors">
                        <Markdown content={blog.content || ""} disableSidebar />
                    </div>

                    {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Related Topics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {blog.tags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-purple-900/30 hover:text-purple-300 transition-colors cursor-pointer border border-gray-700 hover:border-purple-500/50">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                <aside className="lg:w-1/3 mt-12 lg:mt-0 space-y-8 h-fit lg:sticky lg:top-24">
                    <div className="p-6 rounded-2xl bg-gray-900/30 border border-gray-800 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            Recent Posts
                        </h3>
                        <div className="space-y-6">
                            {otherPosts.map((post) => (
                                <Link key={post._id} href={`/blog/${post.slug || post._id}`} className="group flex gap-4 items-start">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                                        {post.coverImage ? (
                                            <Image 
                                              src={anyImgUrl(post.coverImage, { width: 100, quality: 70 })} 
                                              alt={post.title} 
                                              width={100}
                                              height={100}
                                              unoptimized
                                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                                <Share2 className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-200 group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                                            {post.title}
                                        </h4>
                                        <span className="text-xs text-gray-500 mt-2 block">
                                            {formatDate(post.createdAt)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {otherPosts.length === 0 && (
                                <p className="text-gray-500 text-sm">No other posts available.</p>
                            )}
                        </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-purple-500/20 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
                        <h3 className="text-xl font-bold text-white mb-2 relative z-10">Stay Updated</h3>
                        <p className="text-gray-400 text-sm mb-6 relative z-10">Get the latest insights delivered straight to your inbox.</p>
                        <button className="w-full py-2.5 rounded-lg bg-gray-100 text-gray-900 font-bold text-sm hover:bg-white transition-colors relative z-10">
                            Subscribe to Newsletter
                        </button>
                    </div>
                </aside>
            </div>
        </main>
        </>
    );
};

export default Page;
