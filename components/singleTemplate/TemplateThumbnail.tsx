"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { anyImgUrl } from "@/lib/utils/image";

export default function TemplateThumbnail({
  thumbnail,
  title,
}: {
  thumbnail: string;
  title: string;
}) {
  const lowResUrl = anyImgUrl(thumbnail, { width: 1200, quality: 100 });
  const highResUrl = anyImgUrl(thumbnail, { width: 1200, original: true });
  const [highResLoaded, setHighResLoaded] = useState(false);

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
    <div className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] rounded-xl overflow-hidden shadow-lg">
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
        priority
      />
    </div>
  );
}
