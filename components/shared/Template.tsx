"use client";

import { useState, useEffect, useRef, memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart } from "@/components/ui/svgs/icons/Heart";
import { sendGTMEvent } from "@next/third-parties/google";
import { anyImgUrl } from "@/lib/utils/image";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const DynamicFavoriteButton = dynamic(() => import("./FavoriteButton"), { ssr: false });
const DynamicStoreTemplateDetails = dynamic(() => import("./StoreTemplateDetails"), { ssr: false });
const DynamicDashboardTemplateDetails = dynamic(() => import("./DashboardTemplateDetails"), { ssr: false });

const Template = ({
  template,
  mode = "store",
}: {
  template: any; // Using any to support both ITemplate and IPopulatedTemplate
  mode?: "store" | "dashboard";
}) => {
  const lowResUrl = useMemo(() => anyImgUrl(template.thumbnail, { width: 400, quality: 100 }), [template.thumbnail]);
  const highResUrl = useMemo(() => anyImgUrl(template.thumbnail, {
    width: 400,
    original: true,
  }), [template.thumbnail]);
  
  const [highResLoaded, setHighResLoaded] = useState(false);
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
      className="group relative overflow-hidden w-full h-fit rounded-3xl glass-strong hover:bg-white/15 transition-all duration-500 transform hover:scale-[1.02] flex flex-col"
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${template.gradient || 'from-gray-800 to-gray-900'} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
      />

      {/* Featured Badge */}
      {template.tags?.some(
        (tag: string) =>
          tag?.toLowerCase() === "featured",
      ) && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-linear-to-r flex items-center gap-2 from-yellow-400 to-orange-500 text-black border-none">
            <Heart className="w-4 h-4" />
            Featured
          </Badge>
        </div>
      )}

      {/* Favorite Button (Store mode only) */}
      {mode === "store" && <DynamicFavoriteButton template={template} />}

      {/* Thumbnail */}
      <div
        className="relative w-full h-56 overflow-hidden flex-shrink-0"
        onMouseEnter={() => {
          if (template.demoVideo) {
            setIsHovering(true);
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current
                .play()
                .catch((e) => console.log("Video play error:", e));
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
      </div>

      {/* Details based on mode */}
      {mode === "store" ? (
        <DynamicStoreTemplateDetails template={template} />
      ) : (
        <DynamicDashboardTemplateDetails template={template} />
      )}
    </Link>
  );
};

export default memo(Template, (prevProps, nextProps) => {
  return prevProps.template._id === nextProps.template._id && prevProps.mode === nextProps.mode;
});
