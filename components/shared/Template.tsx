"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart } from "@/components/ui/svgs/icons/Heart";
import { Star } from "@/components/ui/svgs/icons/Star";
import { ExternalLink } from "@/components/ui/svgs/icons/ExternalLink";
import { capitalizeFirstChar } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useUser } from "@/context/UserContext";
import { ICategory, ITemplate } from "@/types";
import { sendGTMEvent } from "@next/third-parties/google";
import { anyImgUrl } from "@/lib/utils/image";

const Template = ({
  template,
  showPrice = false,
  showActionButtons = false,
}: {
  template: ITemplate;
  showPrice?: Boolean;
  showActionButtons?: Boolean;
}) => {
  const lowResUrl = anyImgUrl(template.thumbnail, { width: 400, quality: 100 });
  const highResUrl = anyImgUrl(template.thumbnail, {
    width: 400,
    original: true,
  });
  const [highResLoaded, setHighResLoaded] = useState(false);
  const { favoriteTemplates, toggleFavorite } = useUser();
  const isFavorite = favoriteTemplates?.some(
    (favTemplate: ITemplate) => favTemplate._id === template._id,
  );

  const [isHovering, setIsHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHighResLoaded(false);

    const loadHighRes = () => {
      const run = () => {
        const img = new window.Image();
        img.src = highResUrl;
        img.onload = () => {
          setHighResLoaded(true);
        };
      };
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(run);
      } else {
        setTimeout(run, 200);
      }
    };

    if (document.readyState === "complete") {
      loadHighRes();
    } else {
      window.addEventListener("load", loadHighRes);
      return () => window.removeEventListener("load", loadHighRes);
    }
  }, [highResUrl]);
  return (
    <Link
      href={`/templates/${template.slug}`}
      onClick={() =>
        sendGTMEvent({
          event: "template_card_click",
          template_id: template._id,
          template_title: template.title,
        })
      }
      className="group relative overflow-hidden w-full h-fit rounded-3xl glass-strong hover:bg-white/15 transition-all duration-500 transform hover:scale-[1.02] block"
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${template.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
      />

      {/* Featured Badge */}
      {template.categories.some(
        (category) =>
          (category as ICategory)?.name?.toLowerCase() === "featured",
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
        className={`absolute top-4 right-4 ${
          isFavorite ? "bg-pink-100" : "bg-white/75"
        } transition hover:bg-white/90 cursor-pointer z-20 rounded-full p-2 shadow-md`}
        aria-label="Toggle Favorite"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(template);
          sendGTMEvent({
            event: "template_favorite_toggle",
            template_id: template._id,
            template_title: template.title,
            is_favorite: !isFavorite,
          });
        }}
      >
        <Heart
          className={`size-5 ${isFavorite ? "text-pink-500" : "text-gray-400"}`}
          isActive={isFavorite}
        />
      </Button>

      {/* Thumbnail */}
      <div 
        className="relative w-full h-56 overflow-hidden"
        onMouseEnter={() => {
          if (template.demoVideo) {
            setIsHovering(true);
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(e => console.log('Video play error:', e));
            }
          }
        }}
        onMouseLeave={() => {
          if (template.demoVideo) {
            setIsHovering(false);
            setVideoReady(false);
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          }
        }}
      >
        <Image
          src={lowResUrl}
          alt={template.title}
          width={400}
          height={288}
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="w-full h-full object-contain block"
        />
        <Image
          src={highResUrl}
          alt={template.title}
          width={400}
          height={288}
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
            highResLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Loading shimmer */}
        {template.demoVideo && isHovering && !videoReady && (
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}

        {/* Video Player */}
        {template.demoVideo && (
          <video
            ref={videoRef}
            src={template.demoVideo}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-300 z-10 ${
              videoReady && isHovering ? "opacity-100" : "opacity-0"
            }`}
            onCanPlayThrough={() => setVideoReady(true)}
            itemProp="video"
            itemScope
            itemType="https://schema.org/VideoObject"
            title={`${template.title} demo video`}
            aria-label={`Demo video for ${template.title}`}
          >
            <meta itemProp="name" content={`${template.title} demo video`} />
            <meta itemProp="description" content={template.description} />
            <meta itemProp="thumbnailUrl" content={highResUrl} />
            <meta itemProp="uploadDate" content={template.createdAt ? new Date(template.createdAt).toISOString() : new Date().toISOString()} suppressHydrationWarning />
          </video>
        )}
      </div>

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
        {template?.reviews && template?.reviews > 0 ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(template.averageRating)
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
        ) : null}

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
                e.stopPropagation();
                window.open(template.demoLink, "_blank");
                sendGTMEvent({
                  event: "template_demo_click",
                  template_id: template._id,
                  template_title: template.title,
                });
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
