"use client";

import { Badge } from "@/components/ui/badge";
import { Star } from "@/components/ui/svgs/icons/Star";
import { ExternalLink } from "@/components/ui/svgs/icons/ExternalLink";
import { Button } from "@/components/ui/button";
import { capitalizeFirstChar } from "@/lib/utils";
import { sendGTMEvent } from "@next/third-parties/google";
import { ITemplate } from "@/types";

export default function StoreTemplateDetails({ template }: { template: ITemplate }) {
  return (
    <div className="p-6 relative z-10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            {template.title}
          </h3>
          <p className="text-gray-300 text-sm">
            {template.description?.slice(0, 100)}...
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {template.price === 0 ? `Free` : `$${template.price}`}
          </div>
        </div>
      </div>
      
      {/* Rating */}
      {template?.reviewCount && template?.reviewCount > 0 ? (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(template.averageRating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-600"
                }`}
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

        {/* Action Buttons */}
        <Button
          aria-label="Live Demo"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(template.demoLink, "_blank");
            sendGTMEvent({
              event: "template_demo_click",
              template_id: template._id,
              template_title: template.title,
            });
          }}
          className="px-4 cursor-pointer bg-transparent py-3 w-fit h-fit border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors duration-200"
        >
          <ExternalLink className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
