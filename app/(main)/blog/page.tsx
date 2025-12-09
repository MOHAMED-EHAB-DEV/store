import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, ArrowRight, BookOpen } from '@/components/ui/svgs/Icons';
import type { Metadata } from 'next';

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    createdAt: string;
    readTime?: number;
    isPublished: boolean;
}

export const metadata: Metadata = {
    title: 'Blog | Insights & Updates',
    description: 'Discover the latest stories, tutorials, and insights about development, design, and modern web technologies.',
};

const getData = async (): Promise<BlogPost[]> => {
    try {
        const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${domain}/api/blogs?limit=10`, {
            method: 'GET',
            next: { revalidate: 300 }
        });

        if (!res.ok) return [];

        const json = await res.json();
        return json.success ? json.data : [];
    } catch (error) {
        console.error("Failed to fetch public blogs:", error);
        return [];
    }
};

interface BlogCardProps {
    blog: BlogPost;
    featured?: boolean;
}

const BlogCard = ({ blog, featured = false }: BlogCardProps) => {
    return (
        <Link
            href={`/blog/${blog.slug || blog._id}`}
            className={`group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 transition-all duration-300 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col ${featured ? 'md:grid md:grid-cols-2 md:gap-8' : ''}`}
        >
            <div className={`relative overflow-hidden ${featured ? 'h-64 md:h-full' : 'h-48'} w-full bg-gray-800`}>
                {blog.coverImage ? (
                    <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading={featured ? "eager" : "lazy"}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-700 group-hover:text-purple-500/50 transition-colors" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
            </div>

            <div className={`p-6 flex flex-col justify-center ${featured ? 'py-8' : ''}`}>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 font-medium tracking-wide uppercase">
                    <div className="flex items-center gap-1.5 bg-gray-800/50 px-2 py-1 rounded-full border border-gray-700/50">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        <span>{formatDate(blog.createdAt)}</span>
                    </div>
                    {blog.readTime && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span>{blog.readTime} min read</span>
                        </div>
                    )}
                </div>

                <h3 className={`font-bold text-gray-100 mb-3 group-hover:text-purple-400 transition-colors leading-tight ${featured ? 'text-2xl md:text-4xl' : 'text-xl'}`}>
                    {blog.title}
                </h3>

                <p className="text-gray-400 line-clamp-3 mb-6 text-sm md:text-base leading-relaxed">
                    {blog.excerpt || "Click to read more about this interesting topic..."}
                </p>

                <div className="mt-auto flex items-center text-purple-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-4 h-4 ml-2" />
                </div>
            </div>
        </Link>
    );
};

const Page = async () => {
    const blogs = await getData();
    const [featuredBlog, ...otherBlogs] = blogs;

    return (
        <main className="min-h-screen w-full py-36 px-4 md:px-8 lg:px-16 container mx-auto text-white">
            <div className="mb-16 text-center max-w-2xl mx-auto space-y-4">
                <span className="inline-block py-1 px-3 rounded-full bg-purple-500/10 text-purple-400 text-sm font-semibold border border-purple-500/20">
                    Our Blog
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4">
                    Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Updates</span>
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed">
                    Discover the latest stories, tutorials, and insights from our team. We write about development, design, and everything in between.
                </p>
            </div>

            {blogs.length > 0 ? (
                <div className="space-y-12">
                    {featuredBlog && (
                        <div className="animate-in fade-in slide-in-from-bottom duration-700">
                            <BlogCard blog={featuredBlog} featured />
                        </div>
                    )}

                    {otherBlogs.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-700 delay-150 fill-mode-backwards">
                            {otherBlogs.map((blog) => (
                                <BlogCard key={blog._id} blog={blog} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-gray-800 border-dashed">
                    <h3 className="text-xl text-gray-400 font-medium">No blog posts found yet.</h3>
                    <p className="text-gray-500 mt-2">Check back soon for amazing content!</p>
                </div>
            )}
        </main>
    );
};

export default Page;
