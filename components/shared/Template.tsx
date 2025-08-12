"use client";

import {useState} from 'react';
import {Icons} from "@/constants";
import {Badge} from "@/components/ui/badge";
import {Heart, Star} from "@/components/ui/svgs/Icons";
import {capitalizeFirstChar} from "@/lib/utils";
import {useRouter} from "next/navigation";

const Template = ({template, idx}: { template: ITemplate, idx: number }) => {
    const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);
    const router = useRouter();
    const Icon = Icons[idx];
    return <div
        className="group relative overflow-hidden cursor-pointer rounded-3xl glass-strong hover:bg-white/15 transition-all duration-500 transform hover:scale-[1.02]"
        onMouseEnter={() => setHoveredTemplate(template._id)}
        onMouseLeave={() => setHoveredTemplate(null)}
        onClick={() => router.push(`/templates/${template._id}`)}
    >
        {/* Gradient Background */}
        <div
            className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>

        {/* Featured Badge */}
        {template.categories.some(({name}:{name: string}) => name?.toLowerCase() === "featured") && (
            <div className="absolute top-4 left-4 z-10">
                <Badge
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none">
                    <Heart className="w-3 h-3 mr-1"/>
                    Featured
                </Badge>
            </div>
        )}

        {/* Template Image Placeholder */}
        {!template.thumbnail && (
            <div
                className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-30`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl text-white/20">
                        {template.Icon && <Icon/>}
                    </div>
                </div>

                {/* Hover Overlay */}
                {/*<div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${*/}
                {/*    hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'*/}
                {/*}`}>*/}
                {/*    <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2">*/}
                {/*        <ExternalLink className="w-4 h-4" />*/}
                {/*        Preview*/}
                {/*    </button>*/}
                {/*</div>*/}
            </div>
        )}

        {/* Template Info */}
        <div className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">{template.title}</h3>
                    <p className="text-gray-300 text-sm">{template.description}</p>
                </div>
                {/*<div className="text-right">*/}
                {/*    <div className="text-2xl font-bold text-white">${template.price}</div>*/}
                {/*</div>*/}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
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
                <span className="text-gray-400 text-sm">({template.reviews} reviews)</span>
            </div>

            <div className="flex justify-between items-center">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary"
                               className="bg-white/10 text-gray-300 border-white/20">
                            {capitalizeFirstChar(tag)}
                        </Badge>
                    ))}
                </div>

                {/* Action Buttons */}
                {/*<div className="flex gap-3">*/}
                {/*    <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">*/}
                {/*        Buy Now*/}
                {/*    </button>*/}
                {/*</div>*/}
                {/*<Link href={template.demoLink} aria-label="Live Demo"*/}
                {/*      className="px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors duration-200">*/}
                {/*    <ExternalLink className="w-5 h-5" />*/}
                {/*</Link>*/}
            </div>
        </div>
    </div>
}
export default Template
