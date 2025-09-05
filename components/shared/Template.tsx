"use client";

import { useState } from 'react';
import { Icons } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ExternalLink } from "@/components/ui/svgs/Icons";
import { capitalizeFirstChar } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from '../ui/button';
import { useUser } from '@/context/UserContext';

const Template = ({ template, idx, showPrice = false, showActionButtons = false }: {
    template: ITemplate,
    idx: number,
    showPrice: Boolean,
    showActionButtons: Boolean,
}) => {
    const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);
    const Icon = Icons[idx];

    const { favoriteTemplates, toggleFavorite } = useUser();
    const isFavorite = favoriteTemplates?.includes(template._id);

    return <Link href={`/templates/${template._id}`} aria-label={`View details of ${template.title}`}>
        <div
            className="group relative overflow-hidden w-full h-[580px] cursor-pointer rounded-3xl glass-strong hover:bg-white/15 transition-all duration-500 transform hover:scale-[1.02]"
            onMouseEnter={() => setHoveredTemplate(template._id)}
            onMouseLeave={() => setHoveredTemplate(null)}
        >
            {/* Gradient Background */}
            <div
                className={`absolute inset-0 bg-linear-to-br ${template.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>

            {/* Featured Badge */}
            {template.categories.some(({ name }: { name: string }) => name?.toLowerCase() === "featured") && (
                <div className="absolute top-4 left-4 z-10">
                    <Badge
                        className="bg-linear-to-r flex items-center gap-2 from-yellow-400 to-orange-500 text-black border-none">
                        <Heart className="w-4 h-4" />
                        Featured
                    </Badge>
                </div>
            )}

            <Button
                className={`absolute top-4 right-4 ${isFavorite ? "bg-pink-100" : "bg-white/75"} transition hover:bg-white/90 cursor-pointer z-20 rounded-full p-2 shadow-md`}
                onClick={e => {
                    e.stopPropagation();
                    toggleFavorite(template._id);
                }}
            >
                <Heart className={`size-5 ${isFavorite ? "text-pink-500" : "text-gray-400"}`} isActive={isFavorite} />
            </Button>

            {/* Template Image Placeholder */}
            {!template.thumbnail ? (
                <div
                    className="relative h-64 bg-linear-to-br from-gray-800 to-gray-900 overflow-hidden">
                    <div
                        className={`absolute inset-0 bg-linear-to-br ${template.gradient} opacity-30`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl text-white/20">
                            {template.Icon && <Icon />}
                        </div>
                    </div>

                    {/* Hover Overlay */}
                    <div
                        className={`absolute inset-0 z-20 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'
                            }`}>
                        <Link href={template.demoLink}
                            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Preview
                        </Link>
                    </div>
                </div>
            ) : (
                <Image
                    src={template.thumbnail}
                    alt={template.title}
                    width={400}
                    height={288}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full h-72 object-contain"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
            )}

            {/* Template Info */}
            <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{template.title}</h3>
                        <p className="text-gray-300 text-sm">{template.description?.slice(0, 100)}...</p>
                    </div>
                    {showPrice && (
                        <div className="text-right">
                            <div
                                className="text-2xl font-bold text-white">{template.price === 0 ? `Free` : `$${template.price}`}</div>
                        </div>
                    )}
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

                <div className="flex h-fit justify-between items-center">
                    {/* Tags */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                        {template.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary"
                                className="bg-white/10 text-gray-300 border-white/20">
                                {capitalizeFirstChar(tag)}
                            </Badge>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    {showActionButtons && (
                        <Link href={template.demoLink} aria-label="Live Demo" target="_blank"
                            className="px-4 py-3 w-fit h-fit border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors duration-200">
                            <ExternalLink className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    </Link>
}
export default Template
