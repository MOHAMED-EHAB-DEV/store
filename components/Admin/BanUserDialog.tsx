"use client";

import { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "@/components/ui/Modal";
import { ShieldAlert } from "@/components/ui/svgs/icons/ShieldAlert";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { FileText } from "@/components/ui/svgs/icons/FileText";
import { AlertCircle } from "@/components/ui/svgs/icons/AlertCircle";
import { sonnerToast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectItem,
} from "@/components/ui/select";

interface BanUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
    onSuccess?: () => void;
}

export default function BanUserDialog({
    open,
    onOpenChange,
    userId,
    userName,
    onSuccess
}: BanUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [isOtherReason, setIsOtherReason] = useState(false);
    const [formData, setFormData] = useState({
        reason: "",
        notes: "",
        expiresAt: "",
        isTemporary: false
    });

    const handleSubmit = async () => {
        if (!formData.reason.trim()) {
            sonnerToast.error("Please provide a ban reason");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/user/ban/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reason: formData.reason,
                    notes: formData.notes,
                    expiresAt: formData.isTemporary && formData.expiresAt ? formData.expiresAt : undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to ban user");
            }

            sonnerToast.success(`User banned successfully. Ban ID: ${data.banId}`);
            onSuccess?.();
            onOpenChange(false);

            // Reset form
            setFormData({
                reason: "",
                notes: "",
                expiresAt: "",
                isTemporary: false
            });
            setIsOtherReason(false);
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to ban user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="glass border-white/20 max-w-2xl">
                <ModalHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-red-500/20 rounded-full">
                            <ShieldAlert className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <ModalTitle className="text-white text-2xl">Ban User</ModalTitle>
                            <ModalDescription className="text-gray-400">
                                Banning: <span className="text-white font-medium">{userName}</span>
                            </ModalDescription>
                        </div>
                    </div>
                </ModalHeader>

                <div className="space-y-6 py-4">
                    {/* Warning */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-300 text-sm font-medium">Warning</p>
                            <p className="text-red-200/80 text-sm mt-1">
                                This action will immediately prevent the user from accessing their account. They will be redirected to a ban page with the details you provide.
                            </p>
                        </div>
                    </div>

                    {/* Ban Reason */}
                    <div>
                        <label className="text-white font-medium mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            Ban Reason <span className="text-red-400">*</span>
                        </label>
                        <Select
                            labelPlacement="outside"
                            selectedKeys={[isOtherReason ? "Other" : formData.reason]}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "Other") {
                                    setIsOtherReason(true);
                                    setFormData({ ...formData, reason: "" });
                                } else {
                                    setIsOtherReason(false);
                                    setFormData({ ...formData, reason: value });
                                }
                            }}
                            placeholder="Select a reason..."
                            classNames={{
                                trigger: "w-full bg-white/10 border-white/20 text-white",
                                popoverContent: "bg-dark border-white/20 text-white"
                            }}
                        >
                            <SelectItem value="Violation of Terms of Service">Violation of Terms of Service</SelectItem>
                            <SelectItem value="Spam or Abusive Behavior">Spam or Abusive Behavior</SelectItem>
                            <SelectItem value="Fraudulent Activity">Fraudulent Activity</SelectItem>
                            <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                            <SelectItem value="Multiple Account Violations">Multiple Account Violations</SelectItem>
                            <SelectItem value="Security Threat">Security Threat</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </Select>
                    </div>

                    {/* Custom Reason (if Other) */}
                    {isOtherReason && (
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Custom Reason
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter custom ban reason..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus-visible:ring-red-500"
                            />
                        </div>
                    )}

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-white font-medium mb-2">
                            Additional Notes (Optional)
                        </label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any additional context or warnings given to the user..."
                            rows={3}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus-visible:ring-red-500 resize-none"
                        />
                    </div>

                    {/* Temporary Ban Toggle */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <Checkbox
                                checked={formData.isTemporary}
                                onCheckedChange={(checked) => setFormData({ ...formData, isTemporary: !!checked })}
                                className="border-white/20 text-white"
                            />
                            <div className="flex-1">
                                <p className="text-white font-medium">Temporary Ban</p>
                                <p className="text-gray-400 text-sm">Set an expiration date for automatic unban</p>
                            </div>
                        </label>

                        {/* Expiration Date */}
                        {formData.isTemporary && (
                            <div className="mt-4">
                                <label className="text-white font-medium mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                    Expiration Date
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="bg-white/10 border-white/20 text-white focus-visible:ring-purple-500"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <ModalFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !formData.reason}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                    >
                        {loading ? "Banning..." : "Ban User"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
