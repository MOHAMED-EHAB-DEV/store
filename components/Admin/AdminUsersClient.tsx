"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, {
  FilterOption,
} from "@/components/Dashboard/shared/SearchFilterBar";
import ActionDropdown, {
  createDefaultActions,
} from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Users } from "@/components/ui/svgs/icons/Users";
import { Plus } from "@/components/ui/svgs/icons/Plus";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";
import { Star } from "@/components/ui/svgs/icons/Star";
import { Check } from "@/components/ui/svgs/icons/Check";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sonnerToast } from "@/components/ui/sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Link from "next/link";
import { capitalizeFirstChar } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  email: string;
  tier: "starter" | "pro" | "lifetime";
  role: "user" | "admin";
  isEmailVerified: boolean;
  createdAt: string;
}

interface AdminUsersClientProps {
  initialData: User[];
  stats: {
    total: number;
    starter: number;
    pro: number;
    lifetime: number;
    verified: number;
  };
  pagination: any;
  searchParams: any;
}

export default function AdminUsersClient({
  initialData,
  stats,
  pagination,
  searchParams,
}: AdminUsersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  const filterOptions: FilterOption[] = [
    {
      key: "role",
      label: "Role",
      options: [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
      ],
    },
    {
      key: "tier",
      label: "Tier",
      options: [
        { value: "starter", label: "Starter" },
        { value: "pro", label: "Pro" },
        { value: "lifetime", label: "Lifetime" },
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

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(queryParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (!updates.page) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteDialog.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        sonnerToast.success("User deleted successfully");
        router.refresh();
      } else {
        sonnerToast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      sonnerToast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, id: null });
    }
  };

  const handleBulkDelete = async () => {

    setIsDeleting(true);
    try {
      const response = await fetch("/api/admin/users/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedIds }),
      });

      const data = await response.json();
      if (data.success) {
        sonnerToast.success(`${selectedIds.length} users deleted successfully`);
        setSelectedIds([]);
        router.refresh();
      } else {
        sonnerToast.error(data.message || "Failed to delete users");
      }
    } catch (error: any) {
      sonnerToast.error("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeTier = async (tier: "starter" | "pro" | "lifetime") => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedIds, updates: { tier } }),
      });

      const data = await response.json();
      if (data.success) {
        sonnerToast.success(
          `${selectedIds.length} users updated to ${tier} tier`,
        );
        setSelectedIds([]);
        router.refresh();
      } else {
        sonnerToast.error(data.message || "Failed to update users");
      }
    } catch (error: any) {
      sonnerToast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "User",
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
      key: "role",
      label: "Role",
      sortable: true,
      render: (user) => (
        <Badge
          variant="outline"
          className={
            user.role === "admin"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-gray-500/10 text-gray-400 border-gray-500/20"
          }
        >
          {capitalizeFirstChar(user.role)}
        </Badge>
      ),
    },
    {
      key: "tier",
      label: "Tier",
      sortable: true,
      render: (user) => (
        <Badge
          variant="outline"
          className={
            user.tier === "pro"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : user.tier === "lifetime"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          }
        >
          {capitalizeFirstChar(user.tier)}
        </Badge>
      ),
    },
    {
      key: "isEmailVerified",
      label: "Status",
      sortable: true,
      render: (user) => (
        <Badge
          variant="outline"
          className={
            user.isEmailVerified
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }
        >
          {user.isEmailVerified ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (user) => (
        <time
          className="text-sm text-muted-foreground"
          dateTime={user.createdAt}
        >
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
            onDelete: () => setDeleteDialog({ open: true, id: user._id }),
          })}
        />
      ),
    },
  ];

  const statCardsData = [
    {
      label: "Total Users",
      value: stats.total,
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Starter",
      value: stats.starter,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Pro",
      value: stats.pro,
      icon: Star,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Lifetime",
      value: stats.lifetime,
      icon: Star,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Verified",
      value: stats.verified,
      icon: Check,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="User Management"
        description="Manage all users, roles, and permissions"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Users" },
        ]}
        actions={
          <Button
            variant="default"
            className="bg-primary hover:bg-primary/90"
            asChild
          >
            <Link href="/admin/users/new">
              <Plus className="w-4 h-4" />
              Add User
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCardsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="space-y-6">
        <SearchFilterBar
          searchPlaceholder="Search users by name or email..."
          onSearchChange={(val) => updateQuery({ search: val })}
          filters={filterOptions}
          onFilterChange={(key, val) => updateQuery({ [key]: val })}
          activeFilters={{
            role: queryParams.get("role") || "",
            tier: queryParams.get("tier") || "",
            verified: queryParams.get("verified") || "",
          }}
          onClearFilters={() =>
            updateQuery({ role: "", tier: "", verified: "", search: "" })
          }
        />

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="text-sm text-white">
              {selectedIds.length} user{selectedIds.length !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="glass"
                size="sm"
                onClick={() => handleChangeTier("starter")}
                disabled={loading}
              >
                Make Starter
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleChangeTier("pro")}
                disabled={loading}
              >
                <Star className="w-4 h-4 mr-2" />
                Make Pro
              </Button>
              <Button
                variant="gradient-primary"
                size="sm"
                onClick={() => handleChangeTier("lifetime")}
                disabled={loading}
              >
                <Star className="w-4 h-4 mr-2" />
                Make Lifetime
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedIds.length})
              </Button>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={initialData}
          keyExtractor={(user) => user._id}
          loading={loading}
          selectable
          onSelectionChange={(ids) => setSelectedIds(ids as string[])}
          exportFilename="users"
          emptyState={
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try adjusting your filters or search query"
              action={{
                label: "Add User",
                onClick: () => router.push("/admin/users/new"),
                icon: Plus,
              }}
            />
          }
          actions={
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">
                Showing {initialData.length} of {pagination?.total || 0} entries
              </span>
            </div>
          }
        />

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() =>
                  updateQuery({ page: (pagination.page - 1).toString() })
                }
                className="bg-white/5 border-white/10 text-white"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() =>
                  updateQuery({ page: (pagination.page + 1).toString() })
                }
                className="bg-white/5 border-white/10 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        onConfirm={handleDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
      <ConfirmDialog
        open={bulkDeleteDialog}
        onOpenChange={setBulkDeleteDialog}
        onConfirm={handleBulkDelete}
        title="Delete Users"
        description={`Are you sure you want to delete ${selectedIds.length} users? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
