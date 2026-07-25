"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { BookOpen } from "@/components/ui/svgs/icons/BookOpen";
import { createImageProxyLoader } from "@/lib/utils/image";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  createdAt: string;
  readTime?: number;
  isPublished: boolean;
}

interface BlogCardProps {
  blog: BlogPost;
  featured?: boolean;
}

export const BlogCard = ({ blog, featured = false }: BlogCardProps) => {
  return (
    <Link
      href={`/blog/${blog.slug || blog._id}`}
      className={`group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 transition-all duration-300 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col ${featured ? "md:grid md:grid-cols-2 md:gap-8" : ""}`}
    >
      <div
        className={`relative overflow-hidden ${featured ? "h-64 md:h-full" : "h-48"} w-full bg-gray-800`}
      >
        {blog.coverImage ? (
          <Image
            loader={createImageProxyLoader(false)}
            src={blog.coverImage}
            alt={blog.title}
            width={800}
            height={400}
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            preload={featured}
            fetchPriority={featured ? "high" : undefined}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-700 group-hover:text-purple-500/50 transition-colors" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
      </div>

      <div
        className={`p-6 flex flex-col justify-center ${featured ? "py-8" : ""}`}
      >
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

        <h3
          className={`font-bold text-gray-100 mb-3 group-hover:text-purple-400 transition-colors leading-tight ${featured ? "text-2xl md:text-4xl" : "text-xl"}`}
        >
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
