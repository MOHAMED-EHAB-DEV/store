"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import BanUserDialog from "@/components/Admin/BanUserDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { capitalizeFirstChar } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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
        tier: user.tier || "starter",
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
                                {capitalizeFirstChar(user.role)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                user.tier === "pro"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : user.tier === "lifetime"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-gray-500/20 text-gray-400"
                            }`}>
                                {capitalizeFirstChar(user.tier)}
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
                        <Input
                            label="Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            classNames={{
                                inputWrapper: "bg-white/5 border-white/10 text-white"
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Role</label>
                        <Select
                            selectedKeys={formData.role ? [formData.role] : []}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="Select role"
                            classNames={{
                                trigger: "w-full bg-white/5 border-white/10 text-white",
                                popoverContent: "bg-dark border-white/10 text-white"
                            }}
                        >
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Tier</label>
                        <Select
                            selectedKeys={formData.tier ? [formData.tier] : []}
                            onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                            placeholder="Select tier"
                            classNames={{
                                trigger: "w-full bg-white/5 border-white/10 text-white",
                                popoverContent: "bg-dark border-white/10 text-white"
                            }}
                        >
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="lifetime">Lifetime</SelectItem>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                            id="isEmailVerified"
                            checked={formData.isEmailVerified}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEmailVerified: !!checked }))}
                            className="border-white/20 text-white"
                        />
                        <label htmlFor="isEmailVerified" className="text-sm text-muted-foreground cursor-pointer select-none">
                            Email Verified
                        </label>
                    </div>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white hover:bg-primary/90"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="glass rounded-xl p-6 border border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                <div className="flex flex-wrap gap-2">
                    {isBanned ? (
                        <Button
                            variant="outline"
                            onClick={handleUnban}
                            disabled={loading}
                            className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 hover:text-green-300"
                        >
                            Unban User
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleBan}
                            disabled={loading}
                            className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 hover:text-orange-300"
                        >
                            Ban User
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={loading}
                        className="hover:bg-red-500 hover:text-white hover:border-red-500"
                    >
                        Delete User
                    </Button>
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
