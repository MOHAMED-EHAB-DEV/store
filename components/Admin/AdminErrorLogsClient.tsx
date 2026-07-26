"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/Modal";
import { sonnerToast } from "@/components/ui/sonner";
import { Terminal } from "@/components/ui/svgs/icons/Terminal";
import { User as UserIcon } from "@/components/ui/svgs/icons/User";
import { Globe } from "@/components/ui/svgs/icons/Globe";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { CheckCircle } from "@/components/ui/svgs/icons/CheckCircle";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { RotateCcw } from "@/components/ui/svgs/icons/RotateCcw";
import { Check } from "@/components/ui/svgs/icons/Check";
import { Copy } from "@/components/ui/svgs/icons/Copy";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

export interface ErrorLogItem {
  _id: string;
  message: string;
  stack?: string;
  digest?: string;
  route?: string;
  method?: string;
  status?: number;
  operation?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  visitorId?: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  resolved?: boolean;
  resolvedAt?: string;
  notes?: string;
}

interface FilterOptionsData {
  methods?: string[];
  routes?: string[];
  statuses?: number[];
}

interface AdminErrorLogsClientProps {
  initialData: ErrorLogItem[];
  filterOptions?: FilterOptionsData;
  pagination: any;
}

export default function AdminErrorLogsClient({
  initialData,
  filterOptions = {},
  pagination,
}: AdminErrorLogsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ErrorLogItem[]>(initialData);
  const [selectedLog, setSelectedLog] = useState<ErrorLogItem | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteOldLogsDialog, setDeleteOldLogsDialog] = useState<number | null>(null);

  // Group collapsed state (route -> boolean)
  const [collapsedRoutes, setCollapsedRoutes] = useState<Record<string, boolean>>({});

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // User search options for Autocomplete
  const [userOptions, setUserOptions] = useState<AutocompleteOption[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    setLogs(initialData);
  }, [initialData]);

  // Initial load or search for selected user name in Autocomplete
  const activeUserId = queryParams.get("userId") || "";
  useEffect(() => {
    if (activeUserId && userOptions.length === 0) {
      fetch(`/api/admin/users?search=${activeUserId}&limit=5`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data?.items) {
            const opts = resData.data.items.map((u: any) => ({
              value: u._id,
              label: `${u.name} (${u.email})`,
              sublabel: u.email,
              avatar: u.avatar,
            }));
            setUserOptions(opts);
          }
        })
        .catch(() => {});
    }
  }, [activeUserId]);

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
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // User search for Autocomplete
  const handleUserSearch = async (query: string) => {
    if (!query || query.length < 2) return;
    setUserLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      if (data.success && data.data?.items) {
        const opts = data.data.items.map((u: any) => ({
          value: u._id,
          label: u.name,
          sublabel: u.email,
          avatar: u.avatar,
        }));
        setUserOptions(opts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUserLoading(false);
    }
  };

  // Bulk status update
  const handleBatchResolution = async (resolved: boolean) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/error-logs/batch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, resolved }),
      });
      const data = await res.json();
      if (data.success) {
        sonnerToast.success(data.message);
        setSelectedIds([]);
        router.refresh();
      } else {
        sonnerToast.error(data.message || "Failed to update logs");
      }
    } catch (err) {
      sonnerToast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Single resolution toggle
  const handleToggleResolved = async (logId: string, currentResolved: boolean) => {
    try {
      const res = await fetch(`/api/admin/error-logs/${logId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: !currentResolved }),
      });
      const data = await res.json();
      if (data.success) {
        sonnerToast.success(!currentResolved ? "Marked error as resolved" : "Reopened error");
        setLogs((prev) =>
          prev.map((l) =>
            l._id === logId
              ? {
                  ...l,
                  resolved: !currentResolved,
                  resolvedAt: !currentResolved ? new Date().toISOString() : undefined,
                }
              : l
          )
        );
        if (selectedLog && selectedLog._id === logId) {
          setSelectedLog((prev) => (prev ? { ...prev, resolved: !currentResolved } : null));
        }
        router.refresh();
      } else {
        sonnerToast.error(data.message || "Failed to update error log");
      }
    } catch (err) {
      sonnerToast.error("Error updating log");
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!selectedLog) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/error-logs/${selectedLog._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesInput }),
      });
      const data = await res.json();
      if (data.success) {
        sonnerToast.success("Notes saved successfully");
        setSelectedLog((prev) => (prev ? { ...prev, notes: notesInput } : null));
        setLogs((prev) => prev.map((l) => (l._id === selectedLog._id ? { ...l, notes: notesInput } : l)));
        router.refresh();
      } else {
        sonnerToast.error(data.message || "Failed to save notes");
      }
    } catch (err) {
      sonnerToast.error("Error saving notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const executeDeleteOldLogs = async () => {
    if (!deleteOldLogsDialog) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/error-logs?days=${deleteOldLogsDialog}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        sonnerToast.success(data.message);
        router.refresh();
      } else {
        sonnerToast.error(data.message || "Failed to delete logs");
      }
    } catch (error) {
      sonnerToast.error("An error occurred");
    } finally {
      setLoading(false);
      setDeleteOldLogsDialog(null);
    }
  };

  // Grouping logic: Route -> Status -> Error items
  const groupedByRoute = logs.reduce((acc, log) => {
    const routeKey = log.route || "Global / Unassigned";
    if (!acc[routeKey]) acc[routeKey] = [];
    acc[routeKey].push(log);
    return acc;
  }, {} as Record<string, ErrorLogItem[]>);

  const toggleRouteCollapse = (route: string) => {
    setCollapsedRoutes((prev) => ({
      ...prev,
      [route]: prev[route] !== undefined ? !prev[route] : false,
    }));
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectGroup = (groupLogs: ErrorLogItem[]) => {
    const groupIds = groupLogs.map((l) => l._id);
    const allSelected = groupIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === logs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(logs.map((l) => l._id));
    }
  };

  const availableMethods = Array.from(
    new Set([...(filterOptions.methods || []), ...logs.map((l) => l.method).filter(Boolean)])
  );
  const availableRoutes = Array.from(
    new Set([...(filterOptions.routes || []), ...logs.map((l) => l.route).filter(Boolean)])
  );
  const availableStatuses = Array.from(
    new Set([
      ...(filterOptions.statuses || []),
      ...logs.map((l) => l.status).filter((s) => s !== undefined && s !== null),
    ])
  );

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 min-h-screen pb-32">
      <PageHeader
        title="System Error Logs"
        description="Monitor, inspect, and batch-resolve application runtime errors with complete context"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Error Logs" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOldLogsDialog(30)}
              className="bg-red-500/5 hover:bg-red-500/10 text-red-400 border-red-500/20"
            >
              <Trash2 className="w-4 h-4 me-2" />
              Clear Old Logs
            </Button>
          </div>
        }
      />

      {/* Filters Bar */}
      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
            Filter System Errors
          </h2>
          {(queryParams.get("method") ||
            queryParams.get("route") ||
            queryParams.get("status") ||
            queryParams.get("userId") ||
            queryParams.get("resolved") ||
            queryParams.get("search")) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                updateQuery({
                  method: "",
                  route: "",
                  status: "",
                  userId: "",
                  resolved: "",
                  search: "",
                })
              }
              className="text-xs text-muted-foreground hover:text-white"
            >
              Clear All Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Method Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1.5 ms-1">
              Method
            </label>
            <Select
              selectedKeys={[queryParams.get("method") || "ALL"]}
              onChange={(e) => updateQuery({ method: e.target.value === "ALL" ? "" : e.target.value })}
              placeholder="All Methods"
              classNames={{
                trigger: "w-full h-10 bg-white/5 border-white/10 text-xs rounded-xl text-white",
                popoverContent: "bg-slate-900 border-white/10 text-xs text-white",
              }}
            >
              <SelectItem value="ALL">All Methods</SelectItem>
              {availableMethods.map((m) => (
                <SelectItem key={m} value={m!}>
                  {m}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Route Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1.5 ms-1">
              Route
            </label>
            <Select
              selectedKeys={[queryParams.get("route") || "ALL"]}
              onChange={(e) => updateQuery({ route: e.target.value === "ALL" ? "" : e.target.value })}
              placeholder="All Routes"
              classNames={{
                trigger: "w-full h-10 bg-white/5 border-white/10 text-xs rounded-xl text-white truncate",
                popoverContent: "bg-slate-900 border-white/10 text-xs text-white max-h-60",
              }}
            >
              <SelectItem value="ALL">All Routes</SelectItem>
              {availableRoutes.map((r) => (
                <SelectItem key={r} value={r!}>
                  {r}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1.5 ms-1">
              Status Code
            </label>
            <Select
              selectedKeys={[queryParams.get("status") || "ALL"]}
              onChange={(e) => updateQuery({ status: e.target.value === "ALL" ? "" : e.target.value })}
              placeholder="All Statuses"
              classNames={{
                trigger: "w-full h-10 bg-white/5 border-white/10 text-xs rounded-xl text-white",
                popoverContent: "bg-slate-900 border-white/10 text-xs text-white",
              }}
            >
              <SelectItem value="ALL">All Statuses</SelectItem>
              {availableStatuses.map((st) => (
                <SelectItem key={String(st)} value={String(st)}>
                  {st === 0 ? "0 (Client Error)" : `Status ${st}`}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Resolved Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1.5 ms-1">
              Resolution
            </label>
            <Select
              selectedKeys={[queryParams.get("resolved") || "ALL"]}
              onChange={(e) => updateQuery({ resolved: e.target.value === "ALL" ? "" : e.target.value })}
              placeholder="All Status"
              classNames={{
                trigger: "w-full h-10 bg-white/5 border-white/10 text-xs rounded-xl text-white",
                popoverContent: "bg-slate-900 border-white/10 text-xs text-white",
              }}
            >
              <SelectItem value="ALL">All (Resolved & Open)</SelectItem>
              <SelectItem value="false">Open / Unresolved</SelectItem>
              <SelectItem value="true">Resolved Only</SelectItem>
            </Select>
          </div>

          {/* User Autocomplete Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1.5 ms-1">
              User Search
            </label>
            <Autocomplete
              options={userOptions}
              value={queryParams.get("userId") || ""}
              onValueChange={(val) => updateQuery({ userId: val })}
              onSearchChange={handleUserSearch}
              isLoading={userLoading}
              placeholder="Search user..."
              emptyText="No user found"
              className="text-xs"
            />
          </div>

          {/* Items Per Page Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1.5 ms-1">
              Page Limit
            </label>
            <Select
              selectedKeys={[queryParams.get("limit") || "50"]}
              onChange={(e) => updateQuery({ limit: e.target.value })}
              placeholder="50 items"
              classNames={{
                trigger: "w-full h-10 bg-white/5 border-white/10 text-xs rounded-xl text-white",
                popoverContent: "bg-slate-900 border-white/10 text-xs text-white",
              }}
            >
              <SelectItem value="10">10 items</SelectItem>
              <SelectItem value="20">20 items</SelectItem>
              <SelectItem value="50">50 items</SelectItem>
              <SelectItem value="100">100 items</SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Full Width Grouped Table Container */}
      <div className="w-full bg-slate-950/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Table Header Bar */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={logs.length > 0 && selectedIds.length === logs.length}
              onChange={toggleSelectAll}
              className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
            />
            <span className="font-semibold text-white">
              Total {logs.length} Error Logs ({Object.keys(groupedByRoute).length} Routes)
            </span>
          </div>
          {isPending && <span className="text-sky-400 font-medium animate-pulse">Updating view...</span>}
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              icon={Terminal}
              title="No Error Logs Found"
              description="No application errors match your selected filter criteria."
            />
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {Object.entries(groupedByRoute).map(([routeName, routeLogs]) => {
              const isCollapsed = collapsedRoutes[routeName] !== undefined ? collapsedRoutes[routeName] : true;
              const resolvedInRoute = routeLogs.filter((l) => l.resolved).length;

              // Sub-group by status inside this route
              const groupedByStatus = routeLogs.reduce((acc, l) => {
                const sKey = l.status !== undefined && l.status !== null ? String(l.status) : "Unknown";
                if (!acc[sKey]) acc[sKey] = [];
                acc[sKey].push(l);
                return acc;
              }, {} as Record<string, ErrorLogItem[]>);

              return (
                <div key={routeName} className="transition-colors">
                  {/* Route Accordion Group Header */}
                  <div
                    onClick={() => toggleRouteCollapse(routeName)}
                    className="p-4 bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors text-start"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-gray-400 transition-transform duration-200",
                          isCollapsed && "-rotate-90"
                        )}
                      />
                      <div>
                        <span className="font-mono text-sm font-bold text-white me-3">
                          {routeName}
                        </span>
                        <Badge variant="outline" className="bg-white/5 text-gray-200 border-white/10 text-xs font-mono">
                          {routeLogs.length} {routeLogs.length === 1 ? "error" : "errors"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {resolvedInRoute > 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-semibold">
                          {resolvedInRoute} resolved
                        </Badge>
                      )}
                      <span className="text-xs text-gray-300 font-medium">
                        {Object.keys(groupedByStatus).length} status kinds
                      </span>
                    </div>
                  </div>

                  {/* Route Content (when not collapsed) */}
                  {!isCollapsed && (
                    <div className="ps-4 sm:ps-6 pe-2 py-2 space-y-4 bg-black/20 divide-y divide-white/5">
                      {Object.entries(groupedByStatus).map(([statusKey, statusLogs]) => {
                        const uniqueKinds = new Set(statusLogs.map((l) => l.digest || l.message)).size;
                        const allStatusSelected = statusLogs.every((l) => selectedIds.includes(l._id));

                        return (
                          <div key={statusKey} className="pt-3 first:pt-0 space-y-2">
                            {/* Status Sub-Group Header Bar */}
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={allStatusSelected}
                                  onChange={() => toggleSelectGroup(statusLogs)}
                                  className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                />
                                <Badge
                                  className={cn(
                                    "font-mono text-xs px-2.5 py-0.5 font-bold",
                                    Number(statusKey) >= 500 || statusKey === "0"
                                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  )}
                                >
                                  {statusKey === "0" ? "0 (Client Error)" : `Status ${statusKey}`}
                                </Badge>
                                <span className="text-gray-300 font-medium">
                                  Occurrences: <strong className="text-white font-bold">{statusLogs.length}</strong>
                                </span>
                                <span className="text-gray-300 font-medium border-s border-white/10 ps-3 me-2">
                                  Kinds of errors: <strong className="text-sky-400 font-bold">{uniqueKinds}</strong>
                                </span>
                              </div>

                              <div className="text-[11px] text-gray-400 italic">
                                Select checkbox to batch resolve or reopen
                              </div>
                            </div>

                            {/* Error Items Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-start text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-white/10 text-gray-300 font-semibold uppercase text-[10px] tracking-wider">
                                    <th className="py-2.5 px-3 w-10 text-center">Select</th>
                                    <th className="py-2.5 px-3 text-start">Error Message & Context</th>
                                    <th className="py-2.5 px-3 text-start">User / Visitor</th>
                                    <th className="py-2.5 px-3 text-start">Timestamp</th>
                                    <th className="py-2.5 px-3 text-start">Status</th>
                                    <th className="py-2.5 px-3 text-end">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {statusLogs.map((log) => {
                                    const isSelected = selectedIds.includes(log._id);

                                    return (
                                      <tr
                                        key={log._id}
                                        className={cn(
                                          "hover:bg-white/5 transition-colors",
                                          log.resolved && "opacity-60 bg-emerald-950/10",
                                          isSelected && "bg-primary/10"
                                        )}
                                      >
                                        <td className="py-3 px-3 text-center">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelectId(log._id)}
                                            className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                          />
                                        </td>

                                        <td className="py-3 px-3 max-w-md">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "text-[10px] uppercase font-mono px-1.5 py-0",
                                                log.method === "CLIENT"
                                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                  : "bg-gray-500/10 text-gray-300 border-gray-500/20"
                                              )}
                                            >
                                              {log.method || "N/A"}
                                            </Badge>
                                            {log.operation && (
                                              <span className="text-[10px] text-gray-300 font-mono">
                                                [{log.operation}]
                                              </span>
                                            )}
                                          </div>
                                          <p className="font-medium text-white truncate max-w-lg" title={log.message}>
                                            {log.message}
                                          </p>
                                          {log.notes && (
                                            <p className="text-[11px] text-amber-300/80 italic mt-0.5 truncate">
                                              Note: {log.notes}
                                            </p>
                                          )}
                                        </td>

                                        <td className="py-3 px-3">
                                          {log.userId ? (
                                            <div className="flex items-center gap-2">
                                              {log.userId.avatar ? (
                                                <img
                                                  src={log.userId.avatar}
                                                  alt={log.userId.name}
                                                  className="w-5 h-5 rounded-full object-cover"
                                                />
                                              ) : (
                                                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                  <UserIcon className="w-3 h-3 text-purple-400" />
                                                </div>
                                              )}
                                              <span className="text-xs text-white truncate max-w-[120px]">
                                                {log.userId.name}
                                              </span>
                                            </div>
                                          ) : log.visitorId ? (
                                            <div className="flex items-center gap-2">
                                              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <Globe className="w-3 h-3 text-blue-400" />
                                              </div>
                                              <span className="text-xs text-gray-300 font-mono truncate max-w-[100px]">
                                                {log.visitorId}
                                              </span>
                                            </div>
                                          ) : (
                                            <span className="text-gray-300 italic">Guest</span>
                                          )}
                                        </td>

                                        <td className="py-3 px-3 text-gray-300 font-mono text-[11px]">
                                          <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3 shrink-0" />
                                            {new Date(log.timestamp).toLocaleString()}
                                          </div>
                                        </td>

                                        <td className="py-3 px-3">
                                          {log.resolved ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                              Resolved
                                            </Badge>
                                          ) : (
                                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                                              Open
                                            </Badge>
                                          )}
                                        </td>

                                        <td className="py-3 px-3 text-end">
                                          <div className="flex items-center justify-end gap-1.5">
                                            {/* Eye Icon */}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 hover:bg-white/10 text-gray-300 hover:text-white"
                                              title="View error details & notes"
                                              onClick={() => {
                                                setSelectedLog(log);
                                                setNotesInput(log.notes || "");
                                              }}
                                            >
                                              <Eye className="w-4 h-4" />
                                            </Button>

                                            {/* True Icon */}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className={cn(
                                                "h-8 w-8 p-0 transition-colors",
                                                log.resolved
                                                  ? "text-emerald-400 hover:bg-emerald-500/20"
                                                  : "text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                              )}
                                              title={log.resolved ? "Reopen error" : "Mark as resolved"}
                                              onClick={() => handleToggleResolved(log._id, !!log.resolved)}
                                            >
                                              <CheckCircle className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => updateQuery({ page: (pagination.page - 1).toString() })}
                className="bg-white/5 border-white/10 text-white text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateQuery({ page: (pagination.page + 1).toString() })}
                className="bg-white/5 border-white/10 text-white text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="px-5 py-3.5 bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <span className="font-bold text-white me-2">
                {selectedIds.length} {selectedIds.length === 1 ? "Error" : "Errors"} Selected
              </span>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleBatchResolution(true)}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-900/20"
              >
                <Check className="w-3.5 h-3.5 me-1.5" />
                Mark Resolved
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchResolution(false)}
                disabled={loading}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white text-xs rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5 me-1.5" />
                Reopen Errors
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds([])}
                className="text-muted-foreground hover:text-white text-xs ms-1"
              >
                Deselect
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Details & Notes Modal */}
      <Modal open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <ModalContent className="max-w-3xl bg-slate-900 border-white/10 text-white max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          <ModalHeader className="p-6 border-b border-white/10 bg-gradient-to-r from-red-500/10 via-transparent to-transparent">
            <div className="flex items-start justify-between me-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  className={cn(
                    "text-xs font-mono border-0",
                    selectedLog?.status && selectedLog.status >= 500
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {selectedLog?.status === 0 ? "CLIENT SIDE" : `STATUS ${selectedLog?.status}`}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-mono",
                    selectedLog?.resolved
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  )}
                >
                  {selectedLog?.resolved ? "Resolved" : "Open"}
                </Badge>
              </div>
            </div>
            <ModalTitle className="text-lg font-bold text-white leading-snug break-words">
              {selectedLog?.message}
            </ModalTitle>
            <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
              {selectedLog?.route || "Global Route"}
            </p>
          </ModalHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Context Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Method</p>
                <p className="text-xs font-semibold text-white mt-1">{selectedLog?.method || "N/A"}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Operation</p>
                <p className="text-xs font-semibold text-white mt-1">{selectedLog?.operation || "None"}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">IP Address</p>
                <p className="text-xs font-mono text-gray-300 mt-1">{selectedLog?.ip || "Unknown"}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Timestamp</p>
                <p className="text-[11px] font-mono text-gray-300 mt-1">
                  {selectedLog?.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>

            {/* User / Visitor Info */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">User / Visitor Data</p>
              {selectedLog?.userId ? (
                <div className="flex items-center gap-3">
                  {selectedLog.userId.avatar ? (
                    <img
                      src={selectedLog.userId.avatar}
                      alt={selectedLog.userId.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                      {selectedLog.userId.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-white">{selectedLog.userId.name}</p>
                    <p className="text-[11px] text-muted-foreground">{selectedLog.userId.email}</p>
                  </div>
                </div>
              ) : selectedLog?.visitorId ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-300">Anonymous Visitor</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{selectedLog.visitorId}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No user or visitor recorded</p>
              )}

              {selectedLog?.userAgent && (
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">User Agent</p>
                  <p className="text-[10px] font-mono text-muted-foreground italic break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>

            {/* Stack Trace */}
            {selectedLog?.stack && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Stack Trace</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-white"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLog.stack || "");
                      sonnerToast.success("Stack trace copied");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5 me-1" />
                    Copy
                  </Button>
                </div>
                <pre className="p-4 bg-black/80 rounded-xl text-[11px] font-mono text-red-300/80 overflow-x-auto border border-red-500/20 leading-relaxed max-h-60">
                  {selectedLog.stack}
                </pre>
              </div>
            )}

            {/* Admin Notes Field */}
            <div className="space-y-2 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                Admin Resolution Notes
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Add notes about why this error happened or how it was resolved..."
                rows={3}
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </div>
          </div>

          <ModalFooter className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleResolved(selectedLog!._id, !!selectedLog?.resolved)}
              className={cn(
                "text-xs",
                selectedLog?.resolved
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}
            >
              {selectedLog?.resolved ? "Reopen Error" : "Mark as Resolved"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedLog(null)}
              className="text-xs text-muted-foreground hover:text-white"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={deleteOldLogsDialog !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteOldLogsDialog(null);
        }}
        onConfirm={executeDeleteOldLogs}
        title="Clear Old Logs"
        description={`Are you sure you want to delete error logs older than ${deleteOldLogsDialog} days?`}
        confirmText="Delete Logs"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
