"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrism from "rehype-prism-plus";
import "prismjs/themes/prism-tomorrow.css";

interface DocPageProps {
    content: string;
}

export default function Markdown({content}: DocPageProps) {
    // Extract headings for TOC
    const headings = content
        .split("\n")
        .filter((line) => line.startsWith("#"))
        .map((line) => {
            const level = line.match(/^#+/)?.[0].length || 1;
            const text = line.replace(/^#+\s*/, "");
            const id = text.toLowerCase().replace(/\s+/g, "-");
            return {level, text, id};
        });

    return (
        <div className="flex flex-col md:flex-row w-full mx-auto p-4">
            {/* Markdown Content */}
            <div className="md:w-4/5 md:pr-6 prose dark:prose-invert max-w-none text-gray-500">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSlug, rehypePrism]}
                    components={{
                        h1: ({node, ...props}) => (
                            <h1 className="text-xl md:text-3xl font-bold my-5" {...props} />
                        ),
                        h2: ({node, ...props}) => (
                            <h2 className="text-lg md:text-2xl font-semibold my-4" {...props} />
                        ),
                        h3: ({node, ...props}) => (
                            <h3 className="text-md md:text-xl font-semibold my-3" {...props} />
                        ),
                        p: ({node, ...props}) => (
                            <p className="leading-relaxed mb-4" {...props} />
                        ),
                        a: ({node, ...props}) => (
                            <a
                                className="hover:text-blue-400 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                            />
                        ),
                        ul: ({node, ...props}) => (
                            <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
                        ),
                        ol: ({node, ...props}) => (
                            <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
                        ),
                        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                        blockquote: ({node, ...props}) => (
                            <blockquote
                                className="border-l-4 border-blue-500 pl-4 italic my-4"
                                {...props}
                            />
                        ),
                        code: ({inline, className, children, ...props}) => {
                            return !inline ? (
                                <pre className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto mb-4">
                                  <code className={`${className} text-sm`} {...props}>
                                    {children}
                                  </code>
                                </pre>
                            ) : (
                                <code className="bg-gray-800 text-pink-400 px-1.5 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>

            {/* TOC Sidebar */}
            <div className="md:w-1/5 md:pl-4 border-l border-gray-300 dark:border-gray-700">
                <div
                    className={`hidden md:block max-h-[80vh] overflow-y-auto`}
                >
                    <ul className="space-y-2 text-sm">
                        {headings.map((h, i) => (
                            <li
                                key={i}
                                className={`pl-${(h.level - 1) * 4} hover:underline`}
                            >
                                <a href={`#${h.id}`}>{h.text}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
}
