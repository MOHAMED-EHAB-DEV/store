"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

/**
 * Helper to check if a form state contains meaningful user-filled content
 * (e.g. title, name, description, question, answer, subject, content, files)
 */
export function hasFormValues(obj: Record<string, any>): boolean {
    if (!obj) return false;

    // Direct check for text content in title/name/description/question/answer/subject/content/excerpt fields
    const keyFields = ["title", "name", "description", "content", "question", "answer", "subject", "excerpt"];
    const hasTextContent = keyFields.some((key) => {
        const val = obj[key];
        return typeof val === "string" && val.trim().length > 0;
    });

    if (hasTextContent) return true;

    // Fallback check for any string with length > 0 or uploaded File
    return Object.values(obj).some((val) => {
        if (typeof val === "string") return val.trim().length > 0;
        if (val instanceof File) return true;
        return false;
    });
}

export function useFormGuard(isDirty: boolean, hasValues: boolean = true) {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const [pendingBack, setPendingBack] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Guard is active ONLY if form was edited, has actual filled values, and was not submitted yet
    const active = isDirty && hasValues && !isSubmitted;

    // 1. Native Tab Close / Reload event
    useEffect(() => {
        if (!active) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [active]);

    // 2. Intercept internal anchor link clicks
    useEffect(() => {
        if (!active) return;

        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest("a");
            if (!target) return;

            const href = target.getAttribute("href");
            const targetAttr = target.getAttribute("target");

            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("javascript:") ||
                targetAttr === "_blank"
            ) {
                return;
            }

            // Skip if staying on exact same URL
            if (href === window.location.pathname + window.location.search) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            setPendingUrl(href);
            setShowConfirm(true);
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, [active]);

    // 3. Intercept browser back/forward buttons
    useEffect(() => {
        if (!active) return;

        const handlePopState = () => {
            window.history.pushState(null, "", window.location.href);
            setPendingBack(true);
            setShowConfirm(true);
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [active]);

    const handleConfirm = useCallback(() => {
        setIsSubmitted(true);
        setShowConfirm(false);

        if (pendingUrl) {
            const url = pendingUrl;
            setPendingUrl(null);
            router.push(url);
        } else if (pendingBack) {
            setPendingBack(false);
            window.history.go(-2);
        }
    }, [pendingUrl, pendingBack, router]);

    const handleCancel = useCallback(() => {
        setShowConfirm(false);
        setPendingUrl(null);
        setPendingBack(false);
    }, []);

    const GuardDialog = useCallback(
        () => (
            <ConfirmDialog
                open={showConfirm}
                onOpenChange={(open) => {
                    if (!open) handleCancel();
                }}
                onConfirm={handleConfirm}
                title="Unsaved Changes"
                description="You have unsaved changes in this form. Are you sure you want to leave without saving?"
                confirmText="Leave Page"
                cancelText="Keep Editing"
                variant="destructive"
            />
        ),
        [showConfirm, handleConfirm, handleCancel]
    );

    return {
        GuardDialog,
        setIsSubmitted,
        showConfirm,
        setShowConfirm,
    };
}
