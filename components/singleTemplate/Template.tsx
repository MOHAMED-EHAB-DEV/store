import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, ExternalLink, Star } from "@/components/ui/svgs/Icons";
import Markdown from "./Markdown";
import { capitalizeFirstChar } from "@/lib/utils";
import { TemplateSchema } from "@/components/SEO/StructuredData";
import SimilarTemplate from "../shared/Template";
import ReviewsContainer from "@/components/singleTemplate/Reviews/ReviewsContainer";

const Template = async ({ template, similarTemplates }: { template: ITemplate, similarTemplates: ITemplate[] }) => {
    return (
        <>
            <TemplateSchema
                title={template.title}
                description={template.description}
                thumbnail={template.thumbnail}
                demoLink={template.demoLink}
                price={template.price}
                currency="USD"
                tags={template.tags}
                categories={template.categories}
                builtWith={template.builtWith}
                averageRating={template.averageRating}
                reviewCount={template.reviews}
            />
            <div className="flex flex-col gap-10 px-4 sm:px-6 lg:px-16 py-10 w-screen text-white">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr_22%] gap-8 items-start">
                    {/* Thumbnail */}
                    <div className="flex justify-center lg:justify-start">
                        <Image
                            src={template?.thumbnail}
                            alt={template.title}
                            width={400}
                            height={400}
                            sizes="(min-width: 1024px) 350px, (min-width: 640px) 320px, 280px"
                            className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] rounded-xl shadow-lg object-cover"
                            priority
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        />
                    </div>

                    {/* Template Info */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <h1 className="text-3xl sm:text-4xl font-bold font-paras text-center sm:text-left break-words">
                                {template.title}
                            </h1>
                            <span
                                className="text-xl sm:text-2xl font-bold text-gradient-primary text-center sm:text-right break-words">
                                {template.price === 0 ? "Free" : `$${template.price}`}
                            </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-sm sm:text-base break-all">
                            {template.description}
                        </p>

                        {/* Tags */}
                        {template.tags && template.tags.length > 0 && (
                            <div>
                                <h2 className="text-white/60 text-sm font-semibold mb-2">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {template.tags?.map((tag: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="py-1 px-2 bg-white/20 rounded-md text-xs sm:text-sm text-white/80 break-words"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categories */}
                        <div>
                            <h2 className="text-white/60 text-sm font-semibold mb-2">
                                Categories
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {template.categories?.map((cat: any) => (
                                    <span
                                        key={cat._id}
                                        className="py-1 px-2 bg-white/20 rounded-md text-xs sm:text-sm text-white/80 break-words"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Built With */}
                        <div>
                            <h2 className="text-white/60 text-sm font-semibold mb-2">
                                Built With
                            </h2>
                            <span className="py-1 px-3 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
                                {capitalizeFirstChar(template.builtWith as string)}
                            </span>
                        </div>
                    </div>


                    {/* Right Panel */}
                    <div
                        className="flex flex-row flex-wrap lg:flex-col justify-center gap-16 lg:justify-start lg:gap-6 items-center lg:items-center">
                        {/* Rating */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 sm:gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(template.averageRating)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-600"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-base sm:text-lg font-semibold">
                                {template.averageRating?.toFixed(1)}
                            </span>
                            <span className="text-gray-400 text-xs sm:text-sm">
                                {template.reviews ?? 0} reviews
                            </span>
                        </div>

                        {/* Downloads */}
                        <div className="flex flex-col items-center">
                            <Download className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-gray-400 text-xs sm:text-sm">
                                {template.downloads} downloads
                            </span>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3 w-full max-w-[250px]">
                            <button
                                className="w-full px-5 py-2.5 sm:py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-sm sm:text-base">
                                {template.price === 0 ? "Download" : "Buy Now"}
                            </button>
                            <Link
                                href={template.demoLink}
                                target="_blank"
                                className="px-5 py-2.5 sm:py-3 w-full border border-white/20 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition text-sm sm:text-base"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Live Demo
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <Markdown content={template.content} />

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

                <ReviewsContainer templateId={template?._id} averageRating={template?.averageRating} reviewCount={template.reviews ?? 0} />

                {similarTemplates && similarTemplates.length > 0 && (
                    <div className="flex w-full flex-col items-center justify-center gap-8">
                        <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-center">
                            You might also like
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            {similarTemplates.map((temp) => (
                                <SimilarTemplate key={temp._id} template={temp} showPrice={true} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Template;
