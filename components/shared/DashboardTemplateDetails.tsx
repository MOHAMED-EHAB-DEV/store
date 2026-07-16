"use client";

import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Button } from "@/components/ui/button";
import DownloadBtn from "@/components/singleTemplate/DownloadBtn";

export default function DashboardTemplateDetails({ template }: { template: any }) {
  return (
    <div className="p-4 space-y-3 relative z-10 bg-black/40 rounded-b-3xl backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white line-clamp-1">
        {template.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {template.description}
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="w-3 h-3" />
        <span>
          {template.downloadedAt
            ? `Downloaded ${new Date(template.downloadedAt).toLocaleDateString()}`
            : `Purchased ${new Date(template.createdAt).toLocaleDateString()}`}
        </span>
      </div>
      <div className="flex items-center gap-2 pt-2">
        {/* We use pointer-events-none on View because the entire card is a Link that routes to the view page. This avoids nested anchor issues while keeping the visual button. */}
        <Button
          variant="outline"
          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 flex-1 pointer-events-none"
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
        <div 
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
          }} 
          className="flex-1"
        >
          <DownloadBtn
            templateId={template._id}
            isFree={template.price === 0}
            asChild
          >
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DownloadBtn>
        </div>
      </div>
    </div>
  );
}
