import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@/components/ui/svgs/icons/ArrowLeft";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { formatDate } from "@/lib/utils";
import { anyImgUrl } from "@/lib/utils/image";

interface BlogHeaderProps {
  blog: {
    title: string;
    coverImage?: string;
    createdAt: string;
    content?: string;
  };
}

export default function BlogHeader({ blog }: BlogHeaderProps) {
  return (
    <div className="relative w-full max-w-7xl mx-auto h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden lg:rounded-3xl">
      <div className="absolute inset-0 bg-gray-950">
        {blog.coverImage && (
          <Image
            unoptimized
            src={anyImgUrl(blog.coverImage, { width: 1200, quality: 85 })}
            alt={blog.title}
            width={1200}
            height={600}
            className="w-full h-full object-cover rounded-md opacity-40 blur-sm scale-105"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent rounded-md" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center space-y-6">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4 text-sm font-medium uppercase tracking-wider backdrop-blur-sm bg-gray-900/30 px-4 py-2 rounded-full border border-gray-800"
        >
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
            <span>
              {Math.max(
                1,
                Math.ceil((blog.content || "").split(/\s+/).length / 200)
              )}{" "}
              min read
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
