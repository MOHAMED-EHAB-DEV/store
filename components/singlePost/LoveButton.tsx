"use client";

import { useState, useEffect } from "react";
import { Heart } from "@/components/ui/svgs/icons/Heart";
import { cn } from "@/lib/utils";

interface LoveButtonProps {
  blogId: string;
  initialLoves: number;
}

export default function LoveButton({ blogId, initialLoves }: LoveButtonProps) {
  const [loves, setLoves] = useState(initialLoves);
  const [hasLoved, setHasLoved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    try {
      const lovedBlogsStr = localStorage.getItem("loved_blogs");
      if (lovedBlogsStr) {
        const lovedBlogs = JSON.parse(lovedBlogsStr);
        if (Array.isArray(lovedBlogs) && lovedBlogs.includes(blogId)) {
          setHasLoved(true);
        }
      }
    } catch (e) {
      console.error("Could not parse loved_blogs from localStorage", e);
    }
  }, [blogId]);

  const toggleLove = async () => {
    const newHasLoved = !hasLoved;
    const increment = newHasLoved ? 1 : -1;

    // Optimistic update
    setHasLoved(newHasLoved);
    setLoves((prev) => Math.max(0, prev + increment));
    
    if (newHasLoved) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }

    try {
      const lovedBlogsStr = localStorage.getItem("loved_blogs");
      let lovedBlogs = lovedBlogsStr ? JSON.parse(lovedBlogsStr) : [];
      if (!Array.isArray(lovedBlogs)) lovedBlogs = [];

      if (newHasLoved) {
        if (!lovedBlogs.includes(blogId)) lovedBlogs.push(blogId);
      } else {
        lovedBlogs = lovedBlogs.filter((id: string) => id !== blogId);
      }
      localStorage.setItem("loved_blogs", JSON.stringify(lovedBlogs));

      // Call API
      const action = newHasLoved ? "love" : "unlove";
      const res = await fetch(`/api/blogs/${blogId}/love`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.data?.loves === 'number') {
          setLoves(data.data.loves);
        }
      }
    } catch (error) {
      console.error("Failed to toggle love:", error);
    }
  };

  return (
    <button
      onClick={toggleLove}
      className={cn(
        "group relative flex items-center justify-center  px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-md border",
        hasLoved 
          ? "bg-pink-500/20 border-pink-500/50 text-pink-400" 
          : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
      )}
      aria-label={hasLoved ? "Unlove this post" : "Love this post"}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-transform duration-300",
          hasLoved && "fill-pink-500 stroke-pink-500",
          isAnimating && "animate-ping absolute opacity-75",
          !hasLoved && "group-hover:scale-110"
        )}
      />
      <Heart
        className={cn(
          "w-5 h-5 transition-transform duration-300 absolute left-4",
          hasLoved ? "fill-pink-500 stroke-pink-500 scale-100" : "scale-0 opacity-0"
        )}
      />
      <span className="font-semibold text-sm select-none relative z-10 pl-5">{loves}</span>
    </button>
  );
}
