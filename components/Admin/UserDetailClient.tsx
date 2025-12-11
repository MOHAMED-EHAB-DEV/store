"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import BanUserDialog from "@/components/Admin/BanUserDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface UserDetailClientProps {
    user: any;
}

export default function UserDetailClient({ user }: UserDetailClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || "",
        role: user.role || "user",
        tier: user.tier || "free",
        isEmailVerified: user.isEmailVerified || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/admin/users/${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to update user");
            }

            sonnerToast.success("User updated successfully");
            router.refresh();
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    const handleBan = () => {
        setBanDialogOpen(true);
    };

    const onBanSuccess = () => {
        router.refresh();
    };

    const handleUnban = async () => {
        setLoading(true);

        try {
            const response = await fetch(`/api/user/unban/${user._id}`, {
                method: "POST",
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            sonnerToast.success("User unbanned successfully");
            router.refresh();
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to unban user");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        setLoading(true);

        try {
            const response = await fetch(`/api/admin/users/${user._id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            sonnerToast.success("User deleted successfully");
            router.push("/admin/users");
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to delete user");
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    const isBanned = user.banned;

    return (
        <div className="space-y-6">
            {/* User Info Card */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">{user.name}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-purple-500/20 text-purple-400" : "bg-gray-500/20 text-gray-400"}`}>
                                {user.role}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${user.tier === "premium" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}>
                                {user.tier}
                            </span>
                            {isBanned && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                    Banned
                                </span>
                            )}
                            {user.isEmailVerified && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div>
                        <p className="text-xs text-muted-foreground">Joined</p>
                        <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Last Login</p>
                        <p className="text-white">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Purchased Templates</p>
                        <p className="text-white">{user.purchasedTemplates?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Favorites</p>
                        <p className="text-white">{user.favorites?.length || 0}</p>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Edit User</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Tier</label>
                        <select
                            name="tier"
                            value={formData.tier}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isEmailVerified"
                            id="isEmailVerified"
                            checked={formData.isEmailVerified}
                            onChange={handleChange}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isEmailVerified" className="text-sm text-muted-foreground">
                            Email Verified
                        </label>
                    </div>
                </div>

                <div className="flex gap-2 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="glass rounded-xl p-6 border border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                <div className="flex flex-wrap gap-2">
                    {isBanned ? (
                        <button
                            onClick={handleUnban}
                            disabled={loading}
                            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                        >
                            Unban User
                        </button>
                    ) : (
                        <button
                            onClick={handleBan}
                            disabled={loading}
                            className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors disabled:opacity-50"
                        >
                            Ban User
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                        Delete User
                    </button>
                </div>
            </div>

            <BanUserDialog
                open={banDialogOpen}
                onOpenChange={setBanDialogOpen}
                userId={user._id}
                userName={user.name}
                onSuccess={onBanSuccess}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}
