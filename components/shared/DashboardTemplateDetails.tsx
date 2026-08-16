"use client";

import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Button } from "@/components/ui/button";
import DownloadBtn from "@/components/singleTemplate/DownloadBtn";

export default function DashboardTemplateDetails({ template }: { template: any }) {
  return (
    <div className="p-6 space-y-4 flex flex-col justify-between flex-1 border-t border-gray-800/60 bg-gray-900/40">
      <div>
        <h3 className="text-xl font-bold text-gray-100 group-hover:text-purple-400 transition-colors leading-tight line-clamp-1 mb-2">
          {template.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-3">
          {template.description}
        </p>
        <div className="flex items-center gap-1.5 bg-gray-800/50 w-fit px-2.5 py-1 rounded-full border border-gray-700/50 text-xs text-gray-400">
          <Calendar className="w-3 h-3 text-purple-400" aria-hidden="true" />
          <span>
            {template.downloadedAt
              ? `Downloaded ${new Date(template.downloadedAt).toLocaleDateString()}`
              : `Purchased ${new Date(template.createdAt).toLocaleDateString()}`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-800/60">
        <Button
          variant="outline"
          tabIndex={-1}
          aria-hidden="true"
          className="w-full bg-gray-800/60 border-gray-700/60 text-gray-300 hover:bg-gray-800 flex-1 pointer-events-none rounded-xl text-xs font-medium"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
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
            <Button 
              type="button"
              aria-label={`Download ${template.title}`}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-600/20 text-xs font-semibold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Download
            </Button>
          </DownloadBtn>
        </div>
      </div>
    </div>
  );
}
