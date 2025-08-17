import React from "react";
import Image from "next/image";
import Link from "next/link";
import {Download, ExternalLink, Star} from "@/components/ui/svgs/Icons";
import Markdown from "./Markdown";

const Template = async ({template}: { template: ITemplate }) => {
    return (
        <div className="flex flex-col gap-8 px-6 md:px-24 py-12 text-white">
            {/* Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-[30%_1fr_20%] gap-8 items-start">
                {/* Thumbnail */}
                <div className="flex justify-center items-center">
                    <Image
                        src={template.thumbnail}
                        alt={template.title}
                        width={400}
                        height={400}
                        className="w-full max-w-[350px] rounded-xl shadow-lg"
                    />
                </div>

                {/* Template Info */}
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-bold font-paras">{template.title}</h1>
                        <span className="text-2xl font-bold text-gradient-primary">
                          {template.price === 0 ? "Free" : `$${template.price}`}
                        </span>
                    </div>

                    <p className="text-gray-300 leading-relaxed">{template.description}</p>

                    {/* Tags */}
                    <div>
                        <h4 className="text-white/60 text-sm font-semibold mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {template.tags?.map((tag: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="py-1 px-2 bg-white/20 rounded-md text-xs text-white/80"
                                >
                                  #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-white/60 text-sm font-semibold mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                            {template.categories?.map((cat: any) => (
                                <span
                                    key={cat._id}
                                    className="py-1 px-2 bg-white/20 rounded-md text-xs text-white/80"
                                >
                                  {cat.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Built With */}
                    <div>
                        <h4 className="text-white/60 text-sm font-semibold mb-2">Built With</h4>
                        <span className="py-1 px-3 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
                          {template.builtWith}
                        </span>
                    </div>
                </div>

                {/* Right Panel (Ratings, Downloads, Actions) */}
                <div className="flex flex-col gap-6 items-center">
                    {/* Rating */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${
                                        i < Math.floor(template.averageRating)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-600"
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-lg font-semibold">
                                {template.averageRating?.toFixed(1)}
                            </span>
                        <span className="text-gray-400 text-sm">
                          {template.reviewCount ?? 0} reviews
                        </span>
                    </div>

                    {/* Downloads */}
                    <div className="flex flex-col items-center">
                        <Download className="text-gray-400 w-5 h-5"/>
                        <span className="text-gray-400 text-sm">
                          {template.downloads} downloads
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3 w-full items-center">
                        <button
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                            {template.price === 0 ? "Download" : "Buy Now"}
                        </button>
                        <Link
                            href={template.demoLink}
                            target="_blank"
                            className="px-6 py-3 w-full border border-white/20 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition"
                        >
                            <ExternalLink className="w-4 h-4"/>
                            Live Demo
                        </Link>
                    </div>
                </div>
            </div>

            <Markdown content={template.content} />
            {/*/!* Content & TOC *!/*/}
            {/*<div className="grid grid-cols-1 md:grid-cols-[1fr_2px_20%] border-t border-white/10 pt-8 gap-8">*/}
            {/*    /!* Markdown Content *!/*/}
            {/*    <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-strong:text-white prose-code:text-pink-400 prose-pre:bg-[#1a1a1a] prose-pre:rounded-xl prose-pre:p-4 prose-img:rounded-xl">*/}
            {/*        <ReactMarkdown*/}
            {/*            remarkPlugins={[remarkGfm]}*/}
            {/*            rehypePlugins={[rehypePrism]}*/}
            {/*            components={{*/}
            {/*                h1: ({ node, ...props }) => (*/}
            {/*                    <h1 id={String(props.children).toLowerCase().replace(/\s+/g, "-")} {...props} />*/}
            {/*                ),*/}
            {/*                h2: ({ node, ...props }) => (*/}
            {/*                    <h2 id={String(props.children).toLowerCase().replace(/\s+/g, "-")} {...props} />*/}
            {/*                ),*/}
            {/*                h3: ({ node, ...props }) => (*/}
            {/*                    <h3 id={String(props.children).toLowerCase().replace(/\s+/g, "-")} {...props} />*/}
            {/*                ),*/}
            {/*            }}*/}
            {/*        >*/}
            {/*            {template.content}*/}
            {/*        </ReactMarkdown>*/}
            {/*    </div>*/}
            {/*    /!* Divider *!/*/}
            {/*    <div className="hidden md:block w-[2px] bg-white/10 rounded-full" />*/}

            {/*    /!* TOC *!/*/}
            {/*    <aside className="hidden md:flex flex-col gap-2 sticky top-24 self-start pr-4">*/}
            {/*        <h4 className="text-sm font-semibold text-gray-400 mb-2">On this page</h4>*/}
            {/*        {headings.map((h, idx) => (*/}
            {/*            <a*/}
            {/*                key={idx}*/}
            {/*                href={`#${h.id}`}*/}
            {/*                className={`block text-sm hover:text-purple-400 transition-colors ${*/}
            {/*                    h.level === 1 ? "ml-0 font-bold" : h.level === 2 ? "ml-2" : "ml-4"*/}
            {/*                }`}*/}
            {/*            >*/}
            {/*                {h.text}*/}
            {/*            </a>*/}
            {/*        ))}*/}
            {/*    </aside>*/}
            {/*</div>*/}

            {/* Author Section */}
            {/*<div className="flex items-center gap-4 border-t border-white/10 pt-8">*/}
            {/*    <Image*/}
            {/*        src={template.author?.avatar}*/}
            {/*        alt={template.author?.name}*/}
            {/*        width={50}*/}
            {/*        height={50}*/}
            {/*        className="rounded-full border border-white/20"*/}
            {/*    />*/}
            {/*    <div>*/}
            {/*        <h3 className="font-semibold">{template.author?.name}</h3>*/}
            {/*        <span className="text-gray-400 text-sm">Template Author</span>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
};

export default Template;
