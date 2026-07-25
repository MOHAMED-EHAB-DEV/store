"use client";

import { useState, useEffect, useRef } from "react";
import { getImageProxyUrl, getImageSrcSet } from "@/lib/utils/image";

export default function TemplateThumbnail({
  thumbnail,
  title,
  demoVideo,
  description,
}: {
  thumbnail: string;
  title: string;
  demoVideo?: string;
  description?: string;
}) {
  const [loadHighRes, setLoadHighRes] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHighResLoaded(false);
    setLoadHighRes(false);
    const timer = setTimeout(() => {
      setLoadHighRes(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [thumbnail]);

  return (
    <div
      className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] rounded-xl overflow-hidden shadow-lg"
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
      {/* Low-res base image that establishes natural height and aspect ratio */}
      <img
        src={getImageProxyUrl(thumbnail, 600, 80)}
        srcSet={getImageSrcSet(thumbnail, [400, 500, 600, 800, 1024, 1200], 80)}
        sizes="(min-width: 1024px) 600px, (min-width: 640px) 500px, 400px"
        alt={title}
        width={1200}
        height={575}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="w-full h-auto rounded-xl block"
      />

      {/* High-res overlay image that fades in 3.5s after page load */}
      {loadHighRes && (
        <img
          src={getImageProxyUrl(thumbnail, 1200, 80, true)}
          srcSet={getImageSrcSet(thumbnail, [600, 800, 1024, 1200, 1536], 80)}
          sizes="(min-width: 1024px) 600px, (min-width: 640px) 500px, 400px"
          alt={title}
          width={1200}
          height={575}
          onLoad={() => setHighResLoaded(true)}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full rounded-xl transition-opacity duration-700 ease-in-out ${
            highResLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Loading shimmer */}
      {demoVideo && isHovering && !videoReady && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
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
          className={`absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-300 z-10 ${
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
          <meta itemProp="thumbnailUrl" content={thumbnail} />
          <meta
            itemProp="uploadDate"
            content={new Date().toISOString()}
            suppressHydrationWarning
          />
        </video>
      )}
    </div>
  );
}
