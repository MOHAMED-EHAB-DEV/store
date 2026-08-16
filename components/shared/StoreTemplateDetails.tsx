"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Star } from "@/components/ui/svgs/icons/Star";
import { Button } from "@/components/ui/button";
import { capitalizeFirstChar } from "@/lib/utils";
import { sendGTMEvent } from "@next/third-parties/google";
import { ITemplate } from "@/lib/validations/template";

const TemplatePreviewModal = dynamic(() => import("./TemplatePreviewModal"), {
  ssr: false,
});

export default function StoreTemplateDetails({ template }: { template: ITemplate }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      {previewOpen && (
        <TemplatePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={template.title}
          demoUrl={template.demoLink}
          slug={template.slug}
          price={template.price}
        />
      )}

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Header Row: Title & Price */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-100 group-hover:text-purple-400 transition-colors leading-tight line-clamp-1">
              {template.title}
            </h3>
            <div 
              className="shrink-0 font-mono font-bold text-sm px-2.5 py-1 rounded-lg bg-gray-800/60 border border-gray-700/60 text-purple-300"
              aria-label={`Price: ${template.price === 0 ? "Free" : `$${template.price}`}`}
            >
              {template.price === 0 ? "Free" : `$${template.price}`}
            </div>
          </div>

          {/* Description matching BlogCard style */}
          <p className="text-gray-400 line-clamp-2 mb-4 text-sm leading-relaxed">
            {template.description}
          </p>
        </div>

        <div>
          {/* Rating Pill matching BlogCard meta pills */}
          {template?.reviewCount && template?.reviewCount > 0 ? (
            <div
              className="flex items-center gap-2 mb-4"
              aria-label={`Rating: ${template.averageRating} out of 5 stars from ${template.reviewCount} reviews`}
            >
              <div className="flex items-center gap-1.5 bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs text-gray-300">
                <div className="flex items-center text-yellow-400" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(template.averageRating)
                          ? "fill-current text-yellow-400"
                          : "text-gray-600"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-200">{template.averageRating}</span>
                <span className="text-gray-500">({template.reviewCount})</span>
              </div>
            </div>
          ) : null}

          {/* Footer Row: Tags & Live Preview CTA */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-gray-800/60">
            {/* Tags */}
            <div className="flex items-center flex-wrap gap-1.5 overflow-hidden">
              {template.tags?.slice(0, 2).map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-gray-800/60 text-gray-300 border-gray-700/60 hover:bg-gray-700/60 transition-colors text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                >
                  {capitalizeFirstChar(tag)}
                </Badge>
              ))}
            </div>

            {/* Live Preview Button */}
            <Button
              type="button"
              aria-label={`Live Sandbox Preview for ${template.title}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPreviewOpen(true);
                sendGTMEvent({
                  event: "template_preview_modal_open",
                  template_id: template._id,
                  template_title: template.title,
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 shrink-0 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 rounded-xl border border-purple-500/30 hover:border-purple-400/50 shadow-sm hover:shadow-purple-500/20 transition-all duration-200 text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
            >
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
