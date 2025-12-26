"use client";

import { useState } from "react";
import { sonnerToast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

export default function Preferences() {
    const [isLoading, setIsLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        marketingEmails: false,
        weeklyDigest: true,
    });
    const router = useRouter();

    const handleSavePreferences = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/user/preferences", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(preferences),
            });

            const data = await response.json();

            if (!response.ok) {
                sonnerToast.error(data.message || "Failed to update preferences");
                return;
            }

            sonnerToast.success("Preferences updated successfully");
            router.refresh();
        } catch (error: any) {
            sonnerToast.error(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-white font-bold text-2xl mb-2">Notification Preferences</h2>
                <p className="text-muted-foreground text-sm">
                    Manage how you receive notifications and updates
                </p>
            </div>

            <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                    <div>
                        <p className="text-white font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                            Receive notifications about your account activity
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) =>
                            setPreferences({ ...preferences, emailNotifications: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                </label>

                <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                    <div>
                        <p className="text-white font-medium">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">
                            Receive updates about new templates and features
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        checked={preferences.marketingEmails}
                        onChange={(e) =>
                            setPreferences({ ...preferences, marketingEmails: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                </label>

                <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                    <div>
                        <p className="text-white font-medium">Weekly Digest</p>
                        <p className="text-sm text-muted-foreground">
                            Get a weekly summary of your activity
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        checked={preferences.weeklyDigest}
                        onChange={(e) =>
                            setPreferences({ ...preferences, weeklyDigest: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                </label>
            </div>

            <button
                onClick={handleSavePreferences}
                disabled={isLoading}
                className="self-end btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Save Preferences"
            >
                {isLoading ? "Saving..." : "Save Preferences"}
            </button>
        </div>
    );
}
