"use client";

import { useState, useEffect, useRef } from "react";
import { getImageProps } from "@/lib/utils/image";
import { getThumbnailData, TemplateThumbnailType } from "@/lib/image-utils";

export default function TemplateThumbnail({
  thumbnail,
  title,
  demoVideo,
  description,
}: {
  thumbnail: TemplateThumbnailType;
  title: string;
  demoVideo?: string;
  description?: string;
}) {
  const [loadHighRes, setLoadHighRes] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { url: thumbUrl, gradientStyle } = getThumbnailData(thumbnail);

  useEffect(() => {
    setHighResLoaded(false);
    setLoadHighRes(false);
    const timer = setTimeout(() => {
      setLoadHighRes(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [thumbUrl]);

  const baseImageProps = getImageProps({
    src: thumbUrl,
    sizes: "(min-width: 1280px) 480px, (min-width: 1024px) 440px, (min-width: 640px) 500px, 100vw",
    defaultWidth: 600,
  });

  return (
    <>
      <link {...baseImageProps.preloadProps} />
      <div className="relative group/thumb w-full">
        {/* Soft Ambient Glow Halo */}
        <div
          aria-hidden="true"
          className="absolute -inset-1.5 rounded-3xl opacity-35 blur-xl pointer-events-none transition-opacity duration-300 group-hover/thumb:opacity-55 -z-10"
          style={{ background: gradientStyle }}
        />

        {/* Thumbnail Box with Gradient Background */}
        <div
          className="relative w-full aspect-[16/10] max-h-[320px] sm:max-h-[360px] rounded-2xl overflow-hidden shadow-2xl border border-white/15"
          style={{ background: gradientStyle }}
          onMouseEnter={() => {
            if (demoVideo) {
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
            if (demoVideo) {
              setIsHovering(false);
              setVideoReady(false);
              if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
              }
            }
          }}
        >
          {/* Subtle Darkening Overlay for contrast */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gray-950/40 backdrop-blur-[2px] pointer-events-none"
          />

          {/* Low-res base image */}
          <img
            {...baseImageProps.imgProps}
            alt={title}
            width={1200}
            height={750}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="relative z-10 w-full h-full object-contain rounded-2xl block transition-transform duration-500 hover:scale-105"
          />

          {/* High-res overlay image */}
          {loadHighRes && (
            <img
              {...getImageProps({
                src: thumbUrl,
                sizes: "(min-width: 1280px) 480px, (min-width: 1024px) 440px, (min-width: 640px) 500px, 100vw",
                defaultWidth: 1200,
                original: true,
              }).imgProps}
              alt={title}
              width={1200}
              height={750}
              onLoad={() => setHighResLoaded(true)}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 z-10 w-full h-full object-contain rounded-2xl transition-opacity duration-700 ease-in-out ${
                highResLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Loading shimmer for video preview */}
          {demoVideo && isHovering && !videoReady && (
            <div className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          )}

          {/* Video Player */}
          {demoVideo && (
            <video
              ref={videoRef}
              src={demoVideo}
              muted
              loop
              playsInline
              preload="none"
              className={`absolute inset-0 w-full h-full object-contain bg-black/95 transition-opacity duration-300 z-20 ${
                videoReady && isHovering ? "opacity-100" : "opacity-0"
              }`}
              onCanPlayThrough={() => setVideoReady(true)}
              itemProp="video"
              itemScope
              itemType="https://schema.org/VideoObject"
              title={`${title} demo video`}
              aria-label={`Demo video for ${title}`}
            >
              <meta itemProp="name" content={`${title} demo video`} />
              <meta itemProp="description" content={description || title} />
              <meta itemProp="thumbnailUrl" content={thumbUrl} />
              <meta
                itemProp="uploadDate"
                content={new Date().toISOString()}
                suppressHydrationWarning
              />
            </video>
          )}
        </div>
      </div>
    </>
  );
}
