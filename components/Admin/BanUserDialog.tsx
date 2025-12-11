"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert, Calendar, FileText, AlertCircle } from "@/components/ui/svgs/Icons";
import { sonnerToast } from "@/components/ui/sonner";

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
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to ban user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-white/20 max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-red-500/20 rounded-full">
                            <ShieldAlert className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-white text-2xl">Ban User</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Banning: <span className="text-white font-medium">{userName}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

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
                        <select
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-white/15 transition-colors"
                        >
                            <option value="" className="bg-gray-900">Select a reason...</option>
                            <option value="Violation of Terms of Service" className="bg-gray-900">Violation of Terms of Service</option>
                            <option value="Spam or Abusive Behavior" className="bg-gray-900">Spam or Abusive Behavior</option>
                            <option value="Fraudulent Activity" className="bg-gray-900">Fraudulent Activity</option>
                            <option value="Inappropriate Content" className="bg-gray-900">Inappropriate Content</option>
                            <option value="Multiple Account Violations" className="bg-gray-900">Multiple Account Violations</option>
                            <option value="Security Threat" className="bg-gray-900">Security Threat</option>
                            <option value="Other" className="bg-gray-900">Other</option>
                        </select>
                    </div>

                    {/* Custom Reason (if Other) */}
                    {formData.reason === "Other" && (
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Custom Reason
                            </label>
                            <input
                                type="text"
                                placeholder="Enter custom ban reason..."
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            />
                        </div>
                    )}

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-white font-medium mb-2">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any additional context or warnings given to the user..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-colors"
                        />
                    </div>

                    {/* Temporary Ban Toggle */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isTemporary}
                                onChange={(e) => setFormData({ ...formData, isTemporary: e.target.checked })}
                                className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-2 focus:ring-purple-500"
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
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-colors font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.reason}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Banning..." : "Ban User"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
