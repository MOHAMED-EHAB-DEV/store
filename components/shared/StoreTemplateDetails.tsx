"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "@/components/ui/svgs/icons/Star";
import { Button } from "@/components/ui/button";
import { capitalizeFirstChar } from "@/lib/utils";
import { sendGTMEvent } from "@next/third-parties/google";
import { ITemplate } from "@/lib/validations/template";
import TemplatePreviewModal from "./TemplatePreviewModal";

export default function StoreTemplateDetails({ template }: { template: ITemplate }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <TemplatePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={template.title}
        demoUrl={template.demoLink}
        slug={template.slug}
        price={template.price}
      />

      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              {template.title}
            </h2>
            <p className="text-gray-300 text-sm">
              {template.description?.slice(0, 100)}...
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white font-mono">
              {template.price === 0 ? `Free` : `$${template.price}`}
            </div>
          </div>
        </div>
        
        {/* Rating */}
        {template?.reviewCount && template?.reviewCount > 0 ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(template.averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-600"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-white font-medium">
              {template.averageRating}
            </span>
            <span className="text-gray-400 text-sm">
              ({template.reviewCount} reviews)
            </span>
          </div>
        ) : null}

        <div className="flex h-fit justify-between items-center">
          {/* Tags */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            {template.tags?.slice(0, 3).map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-white/10 text-gray-300 border-white/20"
              >
                {capitalizeFirstChar(tag)}
              </Badge>
            ))}
          </div>

          {/* Instant Sandbox Preview Button */}
          <Button
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
            className="flex items-center gap-1.5 px-3 py-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-200 text-xs font-semibold"
          >
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview</span>
          </Button>
        </div>
      </div>
    </>
  );
}
