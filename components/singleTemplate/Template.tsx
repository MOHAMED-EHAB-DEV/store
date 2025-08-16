import React from 'react'
import Image from "next/image";
import {Download, ExternalLink, Star} from "@/components/ui/svgs/Icons";
import Link from "next/link";

const Template = ({template}:{template: ITemplate}) => {
    return (
        <div className="flex flex-col gap-4 min-w-[100dvw] px-4 md:px-[150px]">
            <div className="grid grid-cols-1 md:grid-cols-[28%_1fr_20%] h-full w-full gap-4 items-center">
                <div className="w-full flex items-center justify-center">
                    <Image
                        src={template?.thumbnail}
                        alt={template?.title}
                        width={300}
                        height={300}
                        className="w-full rounded-xl"
                    />
                </div>
                <div className="w-full flex flex-col items-between justify-center">
                    <div className="flex items-center justify-between">
                        <h1 className="text-white text-4xl font-bold font-paras">{template.title}</h1>
                        <span className="text-xl font-bold text-gradient-primary">{template.price === 0 ? `Free` : `$${template.price}`}</span>
                    </div>
                    <div className="flex flex-col items-between justify-center">
                        <div className="grid grid-cols-[60%_1fr] gap-2 justify-between items-center">
                            <p className="text-xs font-semibold text-secondary">{template.description}</p>
                            <div className="flex flex-col gap-2">
                                <h4 className="text-white/60 text-sm font-semibold">Tags</h4>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {template.tags?.map((tag, idx) => (
                                        <div key={idx} className="py-1 px-2 bg-white/30 border-1 border-secondary rounded-md text-white/70 items-center justfiy-center flex text-[10px]">{tag}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h4 className="text-white/60 text-sm font-semibold">Categories</h4>
                            <div className="flex flex-wrap gap-2 items-center">
                                {template.categories?.map((category) => (
                                    <div key={category._id} className="py-1 px-2 bg-white/30 border-1 border-secondary rounded-md text-white/70 items-center justfiy-center flex text-[10px]">{category.name}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 grid-rows-2 gap-4 items-center justify-center">
                    {/*<div className="flex flex-col justify-center gap-3 items-center">*/}
                        <div className="flex items-center flex-col gap-2">
                            <div className="flex gap-1 items-center">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(template.averageRating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-white font-medium">{template.averageRating}</span>
                            </div>
                            <span className="text-gray-400 text-sm">{template.reviews} reviews</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <Download className="text-gray-400" />
                            <span className="text-gray-400 text-sm">
                                {template.downloads} downloads
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                                Buy Now
                            </button>
                        </div>
                    {/*</div>*/}
                    {/*<div className="flex flex-col items-center justify-center gap-5">*/}
                        <Link href={template.demoLink} aria-label="Live Demo" target="_blank"
                              className="px-4 py-3 border w-fit self-center border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors duration-200">
                            <ExternalLink className="w-5 h-5"/>
                        </Link>
                    {/*</div>*/}
                </div>
            </div>
        </div>
    )
}
export default Template
