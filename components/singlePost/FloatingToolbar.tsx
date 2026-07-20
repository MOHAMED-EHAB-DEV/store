"use client";

import { useState } from "react";
import LoveButton from "./LoveButton";
import ShareModal from "./ShareModal";
import { Share2 } from "@/components/ui/svgs/icons/Share2";

interface FloatingToolbarProps {
  blogId: string;
  initialLoves: number;
  title: string;
  url: string;
}

export default function FloatingToolbar({ blogId, initialLoves, title, url }: FloatingToolbarProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 rounded-full bg-primary/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 transition-all animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out">
        <LoveButton blogId={blogId} initialLoves={initialLoves} />
        
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1" />
        
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 text-gray-200 hover:text-white relative overflow-hidden"
          aria-label="Share this post"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Share2 className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12 relative z-10 drop-shadow-md" />
          <span className="font-semibold text-sm select-none relative z-10 drop-shadow-md">Share</span>
        </button>
      </div>

      <ShareModal 
        open={isShareModalOpen} 
        onOpenChange={setIsShareModalOpen} 
        title={title} 
        url={url} 
      />
    </>
  );
}
