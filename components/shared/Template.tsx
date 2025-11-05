"use client";

import { Badge } from "@/components/ui/badge";
import { Heart, Star, ExternalLink } from "@/components/ui/svgs/Icons";
import { capitalizeFirstChar } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useUser } from "@/context/UserContext";
import { ITemplate } from "@/types";

const Template = ({
    template,
    idx,
    showPrice = false,
    showActionButtons = false,
}: {
    template: ITemplate;
    idx: number;
    showPrice?: Boolean;
    showActionButtons?: Boolean;
}) => {
    const { favoriteTemplates, toggleFavorite } = useUser();
    const isFavorite = favoriteTemplates?.includes(template._id);

    return (
        <Link
            href={`/templates/${template._id}`}
            className="group relative overflow-hidden w-full h-fit rounded-3xl glass-strong hover:bg-white/15 transition-all duration-500 transform hover:scale-[1.02] block"
        >
            {/* Gradient Background */}
            <div
                className={`absolute inset-0 bg-linear-to-br ${template.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
            />

            {/* Featured Badge */}
            {template.categories.some(
                (category) => category?.name?.toLowerCase() === "featured"
            ) && (
                    <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-linear-to-r flex items-center gap-2 from-yellow-400 to-orange-500 text-black border-none">
                            <Heart className="w-4 h-4" />
                            Featured
                        </Badge>
                    </div>
                )}

            {/* Favorite Button */}
            <Button
                className={`absolute top-4 right-4 ${isFavorite ? "bg-pink-100" : "bg-white/75"
                    } transition hover:bg-white/90 cursor-pointer z-20 rounded-full p-2 shadow-md`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(template._id);
                }}
            >
                <Heart
                    className={`size-5 ${isFavorite ? "text-pink-500" : "text-gray-400"
                        }`}
                    isActive={isFavorite}
                />
            </Button>

            {/* Thumbnail */}
            <Image
                src={template.thumbnail}
                alt={template.title}
                width={400}
                height={288}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="w-full h-72 object-contain"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
            />

            {/* Template Info */}
            <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            {template.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                            {template.description?.slice(0, 100)}...
                        </p>
                    </div>
                    {showPrice && (
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                                {template.price === 0 ? `Free` : `$${template.price}`}
                            </div>
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
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-600"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-white font-medium">
                        {template.averageRating}
                    </span>
                    <span className="text-gray-400 text-sm">
                        ({template.reviews} reviews)
                    </span>
                </div>

                <div className="flex h-fit justify-between items-center">
                    {/* Tags */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                        {template.tags?.slice(0, 3).map((tag: string) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-white/10 text-gray-300 border-white/20"
                            >
                                {capitalizeFirstChar(tag)}
                            </Badge>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    {showActionButtons && (
                        <Button
                            aria-label="Live Demo"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation()
                                window.open(template.demoLink, "_blank");
                            }}
                            className="px-4 cursor-pointer bg-transparent py-3 w-fit h-fit border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors duration-200"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default Template;
