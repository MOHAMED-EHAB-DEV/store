"use client";

import React, { useState } from "react";
import { ChevronUp } from "@/components/ui/svgs/icons/ChevronUp";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T) => string;
    onRowClick?: (row: T) => void;
    selectable?: boolean;
    onSelectionChange?: (selectedIds: string[]) => void;
    loading?: boolean;
    emptyState?: React.ReactNode;
    actions?: React.ReactNode;
    exportFilename?: string;
}

export default function DataTable<T extends Record<string, any>>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    selectable = false,
    onSelectionChange,
    loading = false,
    emptyState,
    actions,
    exportFilename = "export",
}: DataTableProps<T>) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Sorting logic
    const sortedData = React.useMemo(() => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            const comparison = aVal < bVal ? -1 : 1;
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [data, sortColumn, sortDirection]);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(columnKey);
            setSortDirection("asc");
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(data.map(keyExtractor));
            setSelectedIds(allIds);
            onSelectionChange?.(Array.from(allIds));
        } else {
            setSelectedIds(new Set());
            onSelectionChange?.([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
        onSelectionChange?.(Array.from(newSelected));
    };

    // CSV Export
    const handleExport = () => {
        const headers = columns.map((col) => col.label).join(",");
        const rows = sortedData.map((row) => {
            return columns
                .map((col) => {
                    const value = row[col.key];
                    // Escape commas and quotes
                    const stringValue = String(value ?? "");
                    return `"${stringValue.replace(/"/g, '""')}"`;
                })
                .join(",");
        });

        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${exportFilename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const allSelected = data.length > 0 && selectedIds.size === data.length;
    const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;

    return (
        <div className="space-y-4">
            {/* Table Actions */}
            {(actions || data.length > 0) && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">{actions}</div>
                    {data.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="glass rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                {selectable && (
                                    <th className="px-4 py-3 text-left w-12">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all"
                                            className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                                        />
                                    </th>
                                )}
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="px-4 py-3 text-left text-sm font-semibold text-white"
                                    >
                                        {column.sortable ? (
                                            <button
                                                onClick={() => handleSort(column.key)}
                                                className="flex items-center gap-2 hover:text-primary transition-colors"
                                            >
                                                {column.label}
                                                {sortColumn === column.key && (
                                                    sortDirection === "asc" ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )
                                                )}
                                            </button>
                                        ) : (
                                            column.label
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (selectable ? 1 : 0)}
                                        className="px-4 py-8 text-center"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : sortedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (selectable ? 1 : 0)}
                                        className="px-4 py-8"
                                    >
                                        {emptyState || (
                                            <div className="text-center text-muted-foreground">
                                                No data available
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((row) => {
                                    const id = keyExtractor(row);
                                    const isSelected = selectedIds.has(id);

                                    return (
                                        <tr
                                            key={id}
                                            onClick={() => onRowClick?.(row)}
                                            className={`${onRowClick ? "cursor-pointer" : ""
                                                } hover:bg-white/5 transition-colors ${isSelected ? "bg-primary/10" : ""
                                                }`}
                                        >
                                            {selectable && (
                                                <td className="px-4 py-3">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectRow(id, checked as boolean)
                                                        }
                                                        onClick={(e) => e.stopPropagation()}
                                                        aria-label={`Select row ${id}`}
                                                    />
                                                </td>
                                            )}
                                            {columns.map((column) => (
                                                <td
                                                    key={column.key}
                                                    className="px-4 py-3 text-sm text-white"
                                                >
                                                    {column.render
                                                        ? column.render(row)
                                                        : row[column.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Selection Info */}
            {selectable && selectedIds.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedIds.size} row(s) selected</span>
                </div>
            )}
        </div>
    );
}
