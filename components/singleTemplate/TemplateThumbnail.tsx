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
  const highResUrl = anyImgUrl(thumbnail, { width: 1200, original: true, });
  const [imageUrl, setImageUrl] = useState(lowResUrl);

  useEffect(() => {
    setImageUrl(lowResUrl);

    const loadHighRes = () => {
      const run = () => {
        const img = new window.Image();
        img.src = highResUrl;
        img.onload = () => {
          setImageUrl(highResUrl);
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
  }, [lowResUrl, highResUrl]);

  return (
    <Image
      src={imageUrl}
      unoptimized
      alt={title}
      width={600}
      height={600}
      sizes="(min-width: 1024px) 600px, (min-width: 640px) 500px, 400px"
      className="w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] rounded-xl shadow-lg object-cover"
      priority
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
}
