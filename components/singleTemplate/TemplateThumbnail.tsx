"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { anyImgUrl } from "@/lib/utils/image";

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
  const lowResUrl = anyImgUrl(thumbnail, { width: 1200, quality: 100 });
  const highResUrl = anyImgUrl(thumbnail, { width: 1200, original: true });
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
    <div 
      className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] rounded-xl overflow-hidden shadow-lg"
      onMouseEnter={() => {
        if (demoVideo) {
          setIsHovering(true);
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log('Video play error:', e));
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
      <Image
        src={lowResUrl}
        unoptimized
        alt={title}
        width={1200}
        height={575}
        sizes="(min-width: 1024px) 600px, (min-width: 640px) 500px, 400px"
        className="w-full h-auto rounded-xl block"
        priority
        fetchPriority="high"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />

      {/* High-res overlay image that fades in when fully loaded */}
      <Image
        src={highResUrl}
        unoptimized
        alt={title}
        width={1200}
        height={575}
        sizes="(min-width: 1024px) 600px, (min-width: 640px) 500px, 400px"
        className={`absolute inset-0 w-full h-full rounded-xl transition-opacity duration-500 ease-in-out ${
          highResLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

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
          <meta itemProp="thumbnailUrl" content={highResUrl} />
          <meta itemProp="uploadDate" content={new Date().toISOString()} suppressHydrationWarning />
        </video>
      )}
    </div>
  );
}
