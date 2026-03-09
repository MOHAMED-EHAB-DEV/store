"use client";

import { AlertCircle } from "@/components/ui/svgs/icons/AlertCircle";
import { RefreshCcw } from "@/components/ui/svgs/icons/RefreshCcw";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export default function ErrorState({
    title = "Something went wrong",
    message,
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 glass rounded-xl space-y-4 text-center">
            <div className="p-3 bg-red-500/10 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="text-muted-foreground max-w-md mx-auto">{message}</p>
            </div>
            {onRetry && (
                <Button
                    onClick={onRetry}
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
            )}
        </div>
    );
}
