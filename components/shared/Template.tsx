"use client";

import { useState, useRef, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart } from "@/components/ui/svgs/icons/Heart";
import { sendGTMEvent } from "@next/third-parties/google";
import { getImageProps } from "@/lib/utils/image";
import Link from "next/link";
import { getThumbnailData } from "@/lib/image-utils";
import FavoriteButton from "./FavoriteButton";
import StoreTemplateDetails from "./StoreTemplateDetails";
import DashboardTemplateDetails from "./DashboardTemplateDetails";

const Template = ({
  template,
  mode = "store",
}: {
  template: any;
  mode?: "store" | "dashboard";
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (template.demoVideo) {
      setIsHovering(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.catch((e) => {
            if (e.name !== "AbortError") console.log("Video play error:", e);
          });
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (template.demoVideo && videoRef.current && videoRef.current.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      videoRef.current.currentTime = progress * videoRef.current.duration;
      if (scrubBarRef.current) {
        scrubBarRef.current.style.transform = `scaleX(${progress})`;
      }
    }
  };

  const handleMouseLeave = () => {
    if (template.demoVideo) {
      setIsHovering(false);
      setVideoReady(false);
      if (scrubBarRef.current) {
        scrubBarRef.current.style.transform = "scaleX(0)";
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  const thumbUrl = getThumbnailData(template.thumbnail.url) .url;

  const thumbProps = getImageProps({
    src: thumbUrl,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px",
    defaultWidth: 600,
  });

  return (
    <Link
      href={`/templates/${template.slug}`}
      aria-label={`View details for ${template.title} template priced at ${template.price === 0 ? "free" : `$${template.price}`}`}
      onClick={() =>
        sendGTMEvent({
          event: "template_card_click",
          template_id: template._id,
          template_title: template.title,
        })
      }
      className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 transition-all duration-300 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
    >
      {/* Featured Badge */}
      {template.tags?.some(
        (tag: string) => tag?.toLowerCase() === "featured",
      ) && (
        <div className="absolute top-3.5 left-3.5 z-30 pointer-events-none">
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs px-2.5 py-1 rounded-full border-none shadow-md shadow-purple-500/25 flex items-center gap-1.5">
            <Heart className="w-3 h-3 fill-white" aria-hidden="true" />
            <span>Featured</span>
          </Badge>
        </div>
      )}

      {/* Favorite Button (Store mode only) */}
      {mode === "store" && <FavoriteButton template={template} />}

      {/* Media Deck matching BlogCard height & container */}
      <div
        className="relative overflow-hidden h-48 w-full bg-gray-800 flex-shrink-0"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <link {...thumbProps.preloadProps} />
        <img
          {...thumbProps.imgProps}
          alt={`${template.title} preview`}
          width={600}
          height={300}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient bottom fade overlay matching BlogCard */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Loading shimmer for video preview */}
        {template.demoVideo && isHovering && !videoReady && (
          <div 
            className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"
            aria-hidden="true" 
          />
        )}

        {/* Interactive Video Player (Contain on dark backdrop) */}
        {template.demoVideo && (
          <video
            ref={videoRef}
            src={template.demoVideo}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-contain bg-gray-950/95 transition-opacity duration-300 z-10 ${
              videoReady && isHovering ? "opacity-100" : "opacity-0 pointer-events-none"
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
            <meta itemProp="thumbnailUrl" content={thumbUrl} />
            <meta
              itemProp="uploadDate"
              content={
                template.createdAt
                  ? new Date(template.createdAt).toISOString()
                  : new Date().toISOString()
              }
              suppressHydrationWarning
            />
          </video>
        )}

        {/* GPU Video Scrubber Progress Line */}
        {template.demoVideo && isHovering && (
          <div 
            className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-20 overflow-hidden pointer-events-none"
            aria-hidden="true"
          >
            <div 
              ref={scrubBarRef}
              className="h-full w-full bg-purple-400 origin-left scale-x-0 transition-transform duration-75"
            />
          </div>
        )}
      </div>

      {/* Card Details based on mode */}
      {mode === "store" ? (
        <StoreTemplateDetails template={template} />
      ) : (
        <DashboardTemplateDetails template={template} />
      )}
    </Link>
  );
};

export default memo(Template, (prevProps, nextProps) => {
  return prevProps.template._id === nextProps.template._id && prevProps.mode === nextProps.mode;
});
