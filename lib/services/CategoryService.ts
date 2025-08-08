import Category, { ICategory } from "@/lib/models/Category";
import { connectToDatabase, measureQuery } from "@/lib/database";
import { Types } from "mongoose";

interface CachedCategory {
    _id: string;
    name: string;
    description: string;
    slug: string;
    templateCount: number;
    sortOrder: number;
    isActive: boolean;
    parentCategory?: string | null;
    cacheTimestamp: number;
}

interface CategoryQueryOptions {
    select?: string;
    lean?: boolean;
}

interface CacheOptions {
    ttl?: number;
    maxSize?: number;
}

class CategoryServiceClass {
    private categoryCache = new Map<string, CachedCategory>();
    private readonly defaultTTL = 5 * 60 * 1000;
    private readonly maxCacheSize = 500;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startCleanupInterval();
    }

    private startCleanupInterval() {
        this.cleanupInterval = setInterval(() => this.cleanExpiredEntries(), 60 * 1000);
    }

    private cleanExpiredEntries() {
        const now = Date.now();
        for (const [key, category] of this.categoryCache.entries()) {
            if (now - category.cacheTimestamp > this.defaultTTL) {
                this.categoryCache.delete(key);
            }
        }
    }

    private isCacheValid(category: CachedCategory, ttl = this.defaultTTL): boolean {
        return Date.now() - category.cacheTimestamp < ttl;
    }

    private setCacheEntry(categoryId: string, category: ICategory, ttl = this.defaultTTL) {
        if (this.categoryCache.size >= this.maxCacheSize) {
            const firstKey = this.categoryCache.keys().next().value;
            this.categoryCache.delete(firstKey);
        }

        this.categoryCache.set(categoryId, {
            _id: category._id.toString(),
            name: category.name,
            description: category.description,
            slug: category.slug,
            templateCount: category.templateCount,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            parentCategory: category.parentCategory || null,
            cacheTimestamp: Date.now(),
        });
    }

    private getCacheEntry(categoryId: string, ttl = this.defaultTTL): CachedCategory | null {
        const cached = this.categoryCache.get(categoryId);
        if (cached && this.isCacheValid(cached, ttl)) return cached;
        if (cached) this.categoryCache.delete(categoryId);
        return null;
    }

    /**
     * Find category by ID
     */
    async findById(
        categoryId: string,
        options: CategoryQueryOptions = {},
        cacheOptions: CacheOptions = {}
    ) {
        try {
            const { ttl = this.defaultTTL } = cacheOptions;
            const { select = "_id name slug description sortOrder templateCount isActive", lean = true } = options;

            const cached = this.getCacheEntry(categoryId, ttl);
            if (cached) return cached;

            await connectToDatabase();

            const category = await measureQuery(
                `findCategoryById_${categoryId}`,
                Category.findById(categoryId).select(select).lean(lean)
            );

            if (category) this.setCacheEntry(categoryId, category);
            return category;
        } catch (err) {
            console.error("CategoryService.findById error:", err);
            throw err;
        }
    }

    /**
     * Create new category
     */
    async createCategory(data: Partial<ICategory>) {
        try {
            await connectToDatabase();
            const category = new Category(data);
            const saved = await measureQuery("createCategory", category.save());
            const plain = saved.toObject();
            this.setCacheEntry(plain._id.toString(), plain);
            return plain;
        } catch (err) {
            console.error("CategoryService.createCategory error:", err);
            throw err;
        }
    }

    /**
     * Update category
     */
    async updateCategory(
        categoryId: string,
        updateData: Partial<ICategory>,
        options: CategoryQueryOptions = {}
    ) {
        try {
            const { select = "_id name slug description sortOrder templateCount isActive", lean = true } = options;
            await connectToDatabase();

            const updated = await measureQuery(
                `updateCategory_${categoryId}`,
                Category.findByIdAndUpdate(
                    categoryId,
                    { $set: { ...updateData, updatedAt: new Date() } },
                    { new: true, runValidators: true, select }
                ).lean(lean)
            );

            this.clearCategoryCache(categoryId);
            return updated;
        } catch (err) {
            console.error("CategoryService.updateCategory error:", err);
            throw err;
        }
    }

    /**
     * Delete category (supports soft delete)
     */
    async deleteCategory(categoryId: string, softDelete = true) {
        try {
            await connectToDatabase();
            const category = await Category.findById(categoryId);
            if (!category) throw new Error("Category not found");

            let result;
            if (softDelete) {
                result = await category.softDelete();
            } else {
                result = await Category.findByIdAndDelete(categoryId);
            }

            this.clearCategoryCache(categoryId);
            return result;
        } catch (err) {
            console.error("CategoryService.deleteCategory error:", err);
            throw err;
        }
    }

    /**
     * Get all active categories
     */
    async getActiveCategories() {
        await connectToDatabase();
        return Category.findActiveCategories();
    }

    /**
     * Get main categories (no parent)
     */
    async getMainCategories() {
        await connectToDatabase();
        return Category.findMainCategories();
    }

    /**
     * Get subcategories of a given category
     */
    async getSubcategories(parentId: string) {
        await connectToDatabase();
        return Category.findSubcategories(parentId);
    }

    /**
     * Get category by slug
     */
    async findBySlug(slug: string) {
        await connectToDatabase();
        return Category.findCategoryBySlug(slug);
    }

    /**
     * Get category hierarchy with subcategories
     */
    async getHierarchy() {
        await connectToDatabase();
        return Category.getCategoryHierarchy();
    }

    /**
     * Update template count for all categories
     */
    async refreshTemplateCounts() {
        await connectToDatabase();
        return Category.refreshAllTemplateCounts();
    }

    /**
     * Get categories with accurate template count
     */
    async getWithTemplateCount() {
        await connectToDatabase();
        return Category.findCategoriesWithTemplateCount();
    }

    /**
     * Clear a specific category from cache
     */
    clearCategoryCache(categoryId: string) {
        this.categoryCache.delete(categoryId);
    }

    /**
     * Clear all cached categories
     */
    clearAllCache() {
        this.categoryCache.clear();
    }

    /**
     * Cache stats
     */
    getCacheStats() {
        const now = Date.now();
        let valid = 0;
        let expired = 0;

        for (const category of this.categoryCache.values()) {
            if (this.isCacheValid(category)) valid++;
            else expired++;
        }

        return {
            total: this.categoryCache.size,
            valid,
            expired,
            maxSize: this.maxCacheSize,
            ttl: this.defaultTTL,
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.cleanupInterval) clearInterval(this.cleanupInterval);
        this.clearAllCache();
    }
}

export const CategoryService = new CategoryServiceClass();
export { CategoryServiceClass };
