"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import ActionDropdown, { createDefaultActions } from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import { Users, Plus, Trash2, Star } from "@/components/ui/svgs/Icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    name: string;
    email: string;
    tier: "free" | "premium";
    role: "user" | "admin";
    isVerified: boolean;
    createdAt: string;
}

interface AdminUsersClientProps {
    users: User[];
}

export default function AdminUsersClient({ users }: AdminUsersClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter options
    const filterOptions: FilterOption[] = [
        {
            key: "tier",
            label: "Tier",
            options: [
                { value: "free", label: "Free" },
                { value: "premium", label: "Premium" },
            ],
        },
        {
            key: "role",
            label: "Role",
            options: [
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
            ],
        },
        {
            key: "verified",
            label: "Verification",
            options: [
                { value: "true", label: "Verified" },
                { value: "false", label: "Unverified" },
            ],
        },
    ];

    // Filtered users
    const filteredUsers = useMemo(() => {
        let result = users;

        // Search filter
        if (searchQuery) {
            result = result.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Tier filter
        if (filters.tier) {
            result = result.filter((user) => user.tier === filters.tier);
        }

        // Role filter
        if (filters.role) {
            result = result.filter((user) => user.role === filters.role);
        }

        // Verification filter
        if (filters.verified) {
            result = result.filter((user) =>
                filters.verified === "true" ? user.isVerified : !user.isVerified
            );
        }

        return result;
    }, [users, searchQuery, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchQuery("");
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete user");

            toast.success("User deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete user");
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) return;

        setIsDeleting(true);
        try {
            const response = await fetch("/api/admin/users/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds: selectedIds }),
            });

            if (!response.ok) throw new Error("Failed to delete users");

            toast.success(`${selectedIds.length} users deleted successfully`);
            setSelectedIds([]);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete users");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleChangeTier = async (tier: "free" | "premium") => {
        if (!confirm(`Change tier to ${tier} for ${selectedIds.length} users?`)) return;

        try {
            const response = await fetch("/api/admin/users/bulk-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds: selectedIds, updates: { tier } }),
            });

            if (!response.ok) throw new Error("Failed to update users");

            toast.success(`${selectedIds.length} users updated successfully`);
            setSelectedIds([]);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update users");
        }
    };

    // Table columns
    const columns: Column<User>[] = [
        {
            key: "name",
            label: "Name",
            sortable: true,
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "tier",
            label: "Tier",
            sortable: true,
            render: (user) => (
                <Badge
                    className={
                        user.tier === "premium"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                    }
                >
                    {user.tier === "premium" ? "Premium" : "Free"}
                </Badge>
            ),
        },
        {
            key: "role",
            label: "Role",
            sortable: true,
            render: (user) => (
                <Badge
                    className={
                        user.role === "admin"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                    }
                >
                    {user.role}
                </Badge>
            ),
        },
        {
            key: "isVerified",
            label: "Status",
            sortable: true,
            render: (user) => (
                <Badge
                    className={
                        user.isVerified
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                    }
                >
                    {user.isVerified ? "Verified" : "Unverified"}
                </Badge>
            ),
        },
        {
            key: "createdAt",
            label: "Joined",
            sortable: true,
            render: (user) => (
                <time className="text-sm text-muted-foreground" dateTime={user.createdAt}>
                    {new Date(user.createdAt).toLocaleDateString()}
                </time>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (user) => (
                <ActionDropdown
                    actions={createDefaultActions({
                        onView: () => router.push(`/admin/users/${user._id}`),
                        onDelete: () => handleDelete(user._id)
                    })}
                />
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="User Management"
                description={`${users.length} total users`}
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Users" },
                ]}
                actions={
                    <Button className="bg-primary hover:bg-primary/90" aria-label="Add new user">
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        Add User
                    </Button>
                }
            />

            {/* Search and Filters */}
            <SearchFilterBar
                searchPlaceholder="Search users by name or email..."
                onSearchChange={setSearchQuery}
                filters={filterOptions}
                onFilterChange={handleFilterChange}
                activeFilters={filters}
                onClearFilters={handleClearFilters}
            />

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="glass rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm text-white">
                        {selectedIds.length} user{selectedIds.length !== 1 ? "s" : ""} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeTier("premium")}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            <Star className="w-4 h-4 mr-2" aria-hidden="true" />
                            Make Premium
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeTier("free")}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            Make Free
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            aria-label={`Delete ${selectedIds.length} selected users`}
                        >
                            <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                            Delete ({selectedIds.length})
                        </Button>
                    </div>
                </div>
            )}

            {/* Users Table */}
            {filteredUsers.length === 0 && (searchQuery || Object.keys(filters).length > 0) ? (
                <EmptyState
                    icon={Users}
                    title="No users found"
                    description="Try adjusting your search or filters"
                    action={{
                        label: "Clear Filters",
                        onClick: handleClearFilters,
                    }}
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    keyExtractor={(user) => user._id}
                    selectable
                    onSelectionChange={setSelectedIds}
                    exportFilename="users"
                    emptyState={
                        <EmptyState
                            icon={Users}
                            title="No users yet"
                            description="Users will appear here once they sign up"
                        />
                    }
                />
            )}
        </div>
    );
}
