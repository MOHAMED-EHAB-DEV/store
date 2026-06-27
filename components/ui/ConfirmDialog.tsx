"use client";

import {
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "./button";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}

export default function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default"
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="glass border-white/20">
                <ModalHeader>
                    <ModalTitle className="text-white text-xl">{title}</ModalTitle>
                    <ModalDescription className="text-muted-foreground">
                        {description}
                    </ModalDescription>
                </ModalHeader>
                <ModalFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto hover:bg-primary"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className={`w-full sm:w-auto ${variant === "destructive"
                                ? "bg-red-600 text-white hover:bg-red-700 shadow-red-500/20"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                            }`}
                    >
                        {confirmText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
