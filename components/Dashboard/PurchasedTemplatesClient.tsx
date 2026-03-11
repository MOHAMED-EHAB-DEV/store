"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import { Templates } from "@/components/ui/svgs/icons/Templates";
import { Grid } from "@/components/ui/svgs/icons/Grid";
import { List } from "@/components/ui/svgs/icons/List";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/lib/utils/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Template {
    _id: string;
    title: string;
    slug: string;
    description: string;
    image: string;
    category: { _id: string; name: string };
    downloadedAt: string;
    downloadCount?: number;
}

interface PurchasedTemplatesClientProps {
    templates: Template[];
    categories: any[];
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "name";

export default function PurchasedTemplatesClient({
    templates,
    categories,
}: PurchasedTemplatesClientProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    // Filter options
    const filterOptions: FilterOption[] = [
        {
            key: "category",
            label: "Category",
            options: categories.map((cat) => ({
                value: cat._id,
                label: cat.name,
            })),
        },
    ];

    // Filtered and sorted templates
    const filteredTemplates = useMemo(() => {
        let result = templates;

        // Search filter
        if (searchQuery) {
            result = result.filter((template) =>
                template.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (filters.category) {
            result = result.filter((template) => template.category._id === filters.category);
        }

        // Sorting
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime();
                case "oldest":
                    return new Date(a.downloadedAt).getTime() - new Date(b.downloadedAt).getTime();
                case "name":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        return result;
    }, [templates, searchQuery, filters, sortBy]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchQuery("");
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Purchased Templates"
                description={`You have ${templates.length} template${templates.length !== 1 ? "s" : ""}`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Purchased Templates" },
                ]}
                actions={
                    <Link href="/templates">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Templates className="w-4 h-4 mr-2" />
                            Browse More
                        </Button>
                    </Link>
                }
            />

            {/* Search and Filters */}
            <div className="space-y-4">
                <SearchFilterBar
                    searchPlaceholder="Search templates..."
                    onSearchChange={setSearchQuery}
                    filters={filterOptions}
                    onFilterChange={handleFilterChange}
                    activeFilters={filters}
                    onClearFilters={handleClearFilters}
                />

                {/* View Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-dark border-white/10">
                                <SelectItem value="newest" className="text-white hover:bg-white/10">
                                    Newest First
                                </SelectItem>
                                <SelectItem value="oldest" className="text-white hover:bg-white/10">
                                    Oldest First
                                </SelectItem>
                                <SelectItem value="name" className="text-white hover:bg-white/10">
                                    Name (A-Z)
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* View Toggle */}
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                className={`${viewMode === "grid"
                                    ? "bg-white/10 text-white"
                                    : "text-muted-foreground hover:text-white"
                                    }`}
                            >
                                <Grid className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className={`${viewMode === "list"
                                    ? "bg-white/10 text-white"
                                    : "text-muted-foreground hover:text-white"
                                    }`}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Templates Display */}
            {filteredTemplates.length === 0 ? (
                <EmptyState
                    icon={Templates}
                    title={searchQuery || Object.keys(filters).length > 0 ? "No templates found" : "No templates yet"}
                    description={
                        searchQuery || Object.keys(filters).length > 0
                            ? "Try adjusting your search or filters"
                            : "Browse our template library to get started"
                    }
                    action={
                        searchQuery || Object.keys(filters).length > 0
                            ? {
                                label: "Clear Filters",
                                onClick: handleClearFilters,
                            }
                            : undefined
                    }
                />
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template._id}
                            className="glass rounded-xl overflow-hidden hover:bg-white/5 transition-all duration-300 group"
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <Image
                                    src={anyImgUrl(template.image || "/placeholder.png", { width: 600, quality: 80 })}
                                    unoptimized
                                    alt={template.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <Badge className="absolute top-3 right-3 bg-primary/90 text-white border-0">
                                    {template.category.name}
                                </Badge>
                            </div>
                            <div className="p-4 space-y-3">
                                <h3 className="text-lg font-semibold text-white line-clamp-1">
                                    {template.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {template.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        Downloaded {new Date(template.downloadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <Link href={`/templates/${template.slug}`} className="flex-1">
                                        <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                    </Link>
                                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass rounded-xl overflow-hidden divide-y divide-white/5">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template._id}
                            className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                    src={anyImgUrl(template.image || "/placeholder.png", { width: 200, quality: 80 })}
                                    unoptimized
                                    alt={template.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-white truncate">
                                    {template.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                                        {template.category.name}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(template.downloadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/templates/${template.slug}`}>
                                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View
                                    </Button>
                                </Link>
                                <Button size="sm" className="bg-primary hover:bg-primary/90">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
