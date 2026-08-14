"use client";

import { useState, useEffect, useRef, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart } from "@/components/ui/svgs/icons/Heart";
import { sendGTMEvent } from "@next/third-parties/google";
import { getImageProps } from "@/lib/utils/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const DynamicFavoriteButton = dynamic(() => import("./FavoriteButton"), { ssr: false });
const DynamicStoreTemplateDetails = dynamic(() => import("./StoreTemplateDetails"), { ssr: false });
const DynamicDashboardTemplateDetails = dynamic(() => import("./DashboardTemplateDetails"), { ssr: false });

const Template = ({
  template,
  mode = "store",
}: {
  template: any;
  mode?: "store" | "dashboard";
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [loadHighRes, setLoadHighRes] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadHighRes(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // 3D Perspective Tilt & Specular Glare Physics (GPU-Accelerated via CSS Custom Properties)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;

        const rx = (py - 0.5) * -10;
        const ry = (px - 0.5) * 10;

        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glareRef.current) {
          glareRef.current.style.transform = `translate(${(px - 0.5) * rect.width}px, ${(py - 0.5) * rect.height}px)`;
        }
      });
    };

    const handleMouseLeave = () => {
      cancelAnimationFrame(rafId);
      el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (glareRef.current) {
        glareRef.current.style.transform = "translate(0px, 0px)";
      }
    };

    el.addEventListener("mousemove", handleMouseMove, { passive: true });
    el.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <Link
      ref={cardRef}
      href={`/templates/${template.slug}`}
      aria-label={`View details for ${template.title} template`}
      onClick={() =>
        sendGTMEvent({
          event: "template_card_click",
          template_id: template._id,
          template_title: template.title,
        })
      }
      className="group relative overflow-hidden w-full h-fit rounded-3xl glass-strong hover:bg-white/15 transition-all duration-500 flex flex-col [transform-style:preserve-3d] [perspective:1000px] border border-white/10 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(168,85,247,0.15)] will-change-transform"
    >
      {/* Specular Glare Follower */}
      <div
        ref={glareRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_60%)] z-20"
      />

      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${template.gradient || 'from-gray-800 to-gray-900'} opacity-10 group-hover:opacity-25 transition-opacity duration-500`}
      />

      {/* Featured Badge */}
      {template.tags?.some(
        (tag: string) =>
          tag?.toLowerCase() === "featured",
      ) && (
        <div className="absolute top-4 start-4 z-30">
          <Badge className="bg-gradient-to-r flex items-center gap-1.5 from-yellow-400 to-orange-500 text-black font-bold border-none shadow-lg">
            <Heart className="w-3.5 h-3.5 fill-black" />
            Featured
          </Badge>
        </div>
      )}

      {/* Favorite Button (Store mode only) */}
      {mode === "store" && <DynamicFavoriteButton template={template} />}

      {/* Thumbnail with Video Hover Scrub */}
      <div
        className="relative w-full h-56 overflow-hidden flex-shrink-0"
        onMouseEnter={() => {
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
        }}
        onMouseMove={(e) => {
          if (template.demoVideo && videoRef.current && videoRef.current.duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const progress = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = progress * videoRef.current.duration;
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
        {(() => {
          const thumbProps = getImageProps({
            src: template.thumbnail,
            sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
            defaultWidth: 400,
          });
          return (
            <>
              <link {...thumbProps.preloadProps} />
              <img
                {...thumbProps.imgProps}
                alt={template.title}
                width={400}
                height={288}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-contain block group-hover:scale-105 transition-transform duration-500"
              />
            </>
          );
        })()}

        {loadHighRes && (
          <img
            {...getImageProps({
              src: template.thumbnail,
              sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
              defaultWidth: 800,
              original: true,
            }).imgProps}
            alt={template.title}
            width={400}
            height={288}
            onLoad={() => setHighResLoaded(true)}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${
              highResLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

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
            <meta itemProp="thumbnailUrl" content={template.thumbnail} />
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
