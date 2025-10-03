"use client";
import { useState } from "react";
import { toast } from "sonner";
import { LoginToDownloadDialog } from "@/components/Dialogs/LoginToDownloadDialog";

const DownloadBtn = ({ isFree, templateId }: { isFree: boolean; templateId: string }) => {
    const [loading, setLoading] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    const handleFreeDownload = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/template/download?templateId=${templateId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Download failed' }));

                if (response.status === 401) {
                    setShowLoginDialog(true);
                } else if (response.status === 403) {
                    toast.error(errorData.error || "You must purchase this template to download it");
                } else if (response.status === 404) {
                    toast.error("Template not found");
                } else {
                    toast.error(errorData.error || "Failed to download template");
                }
                return;
            }

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `template-${templateId}.zip`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Template downloaded successfully!");
        } catch (e) {
            console.error('Download error:', e);
            toast.error("Failed to download template");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                className="w-full cursor-pointer px-5 py-2.5 sm:py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-sm sm:text-base"
                onClick={isFree ? handleFreeDownload : undefined}
                disabled={loading}
            >
                {loading ? "Downloading" : isFree ? "Download" : "Buy Now"}
            </button>
            <LoginToDownloadDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
        </>
    );
};

export default DownloadBtn;
