import Link from "next/link";
import Image from "next/image";
import { Share2 } from "@/components/ui/svgs/icons/Share2";
import { formatDate } from "@/lib/utils";
import { anyImgUrl } from "@/lib/utils/image";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string;
  createdAt: string;
}

interface BlogSidebarProps {
  otherPosts: BlogPost[];
}

export default function BlogSidebar({ otherPosts }: BlogSidebarProps) {
  return (
    <aside className="w-full min-w-0 mt-12 lg:mt-0 space-y-8 h-fit lg:sticky lg:top-24">
      <div className="p-6 rounded-2xl bg-gray-900/30 border border-gray-800 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          Recent Posts
        </h3>
        <div className="space-y-6">
          {otherPosts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug || post._id}`}
              className="group flex gap-4 items-start"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                {post.coverImage ? (
                  <Image
                    unoptimized
                    src={anyImgUrl(post.coverImage, {
                      width: 100,
                      quality: 70,
                    })}
                    alt={post.title}
                    width={100}
                    height={100}
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
        <h3 className="text-xl font-bold text-white mb-2 relative z-10">
          Join the Conversation
        </h3>
        <p className="text-gray-400 text-sm mb-6 relative z-10">
          Sign up to love, share, and get access to exclusive content and insights.
        </p>
        <Link 
          href="/login"
          className="block w-full py-2.5 rounded-lg bg-gray-100 text-gray-900 font-bold text-sm hover:bg-white transition-colors relative z-10"
        >
          Create an Account
        </Link>
      </div>
    </aside>
  );
}
