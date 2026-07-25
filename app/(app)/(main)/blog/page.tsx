import type { Metadata } from "next";
import { BlogCard, BlogPost } from "@/components/Blog/BlogCard";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Web Design & Development Blog | MHD Store";
  const description =
    "Discover the latest stories, tutorials, and insights about development, design, and modern web technologies.";

  return buildMetadata({
    title,
    description,
    path: "/blog",
  });
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const getData = async () => {
  try {
    const response = await fetch(`${APP_URL}/api/blogs`, {
      method: "GET",
      next: { revalidate: 60 * 60 * 24 * 7, tags: ["blogs"] },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.success ? (data.data as BlogPost[]) : [];
  } catch (error) {
    return [];
  }
};

const Page = async () => {
  const blogs = await getData();

  return (
    <main
      className="min-h-screen w-full py-36 px-4 max-w-6xl container mx-auto text-white"
      role="main"
      id="main-content"
    >
      <div className="mb-16 text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-block py-1 px-3 rounded-full bg-purple-500/10 text-purple-400 text-sm font-semibold border border-purple-500/20">
          Our Blog
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4">
          Insights &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Updates
          </span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Discover the latest stories, tutorials, and insights from our team. We
          write about development, design, and everything in between.
        </p>
      </div>

      {blogs.length > 0 ? (
        <div className="space-y-12">
          {blogs[0] && (
            <div className="animate-in fade-in slide-in-from-bottom duration-700">
              <BlogCard blog={blogs[0]} featured />
            </div>
          )}

          {blogs.slice(1).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-700 delay-150 fill-mode-backwards">
              {blogs.slice(1).map((blog: BlogPost) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-gray-800 border-dashed">
          <h3 className="text-xl text-gray-400 font-medium">
            No blog posts found yet.
          </h3>
          <p className="text-gray-500 mt-2">
            Check back soon for amazing content!
          </p>
        </div>
      )}
    </main>
  );
};

export default Page;
