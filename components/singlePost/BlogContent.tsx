import Markdown from "@/components/singleTemplate/Markdown";
import { Tag } from "@/components/ui/svgs/icons/Tag";

interface BlogContentProps {
  blog: {
    content?: string;
    tags?: string[];
  };
}

export default function BlogContent({ blog }: BlogContentProps) {
  return (
    <article className="w-full min-w-0 overflow-hidden">
      <div className="prose prose-lg prose-invert max-w-none md:prose-xl prose-headings:text-white prose-p:text-gray-300 prose-a:text-purple-400 prose-strong:text-white prose-code:text-pink-400 hover:prose-a:text-purple-300 transition-colors w-full break-words [&_table]:table-fixed [&_table]:w-full [&_td]:break-all [&_th]:break-all [&_td]:whitespace-pre-wrap [&_th]:whitespace-pre-wrap [&_td]:p-2 [&_th]:p-2">
        <Markdown content={blog.content || ""} disableSidebar />
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Related Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-purple-900/30 hover:text-purple-300 transition-colors cursor-pointer border border-gray-700 hover:border-purple-500/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
