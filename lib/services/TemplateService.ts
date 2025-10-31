import Template, { ITemplate } from "@/lib/models/Template";
import {connectToDatabase, measureQuery} from "@/lib/database";
import {Gradients} from "@/constants";
import {Types} from "mongoose";

interface CachedTemplate {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    averageRating: number;
    downloads: number;
    categories: string[];
    tags: string[];
    author: Types.ObjectId;
    demoLink: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    cacheTimestamp: number;
}

interface TemplateQueryOptions {
    select?: string;
    lean?: boolean;
    includeContent?: boolean;
}

interface TemplateCacheOptions {
    ttl?: number;
    maxSize?: number;
}

class TemplateServiceClass {
    private templateCache = new Map<string, CachedTemplate>();
    private readonly defaultTTL = 5 * 60 * 1000;
    private readonly maxCacheSize = 1000;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startCleanupInterval();
    }

    private startCleanupInterval() {
        this.cleanupInterval = setInterval(
            () => this.cleanExpiredEntries(),
            60 * 1000
        );
    }

    private cleanExpiredEntries() {
        const now = Date.now();
        for (const [key, template] of this.templateCache.entries()) {
            if (now - template.cacheTimestamp > this.defaultTTL) {
                this.templateCache.delete(key);
            }
        }
    }

    private isCacheValid(
        template: CachedTemplate,
        ttl = this.defaultTTL
    ): boolean {
        return Date.now() - template.cacheTimestamp < ttl;
    }

    private setCacheEntry(
        templateId: string,
        template: any,
        ttl = this.defaultTTL
    ) {
        if (this.templateCache.size >= this.maxCacheSize) {
            const firstKey = this.templateCache.keys().next().value;
            this.templateCache.delete(firstKey);
        }

        const cachedTemplate: CachedTemplate = {
            _id: template._id.toString(),
            title: template.title,
            description: template.description,
            thumbnail: template.thumbnail,
            price: template.price,
            averageRating: template.averageRating,
            downloads: template.downloads,
            categories: template.categories,
            demoLink: template.demoLink,
            tags: template.tags,
            // author: template.author,
            isActive: template.isActive,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
            cacheTimestamp: Date.now(),
        };

        this.templateCache.set(templateId, cachedTemplate);
    }

    private getCacheEntry(
        templateId: string,
        ttl = this.defaultTTL
    ): CachedTemplate | null {
        const cached = this.templateCache.get(templateId);
        if (cached && this.isCacheValid(cached, ttl)) return cached;
        if (cached) this.templateCache.delete(templateId);
        return null;
    }

    /**
     * Find template by ID
     */
    async findById(
        templateId: string,
        options: TemplateQueryOptions = {},
        cacheOptions: TemplateCacheOptions = {}
    ) {
        try {
            const {ttl = this.defaultTTL} = cacheOptions;
            const {
                select = "_id title description thumbnail price averageRating downloads categories tags isActive createdAt updatedAt",
                lean = true,
                includeContent = false,
            } = options;

            if (!includeContent) {
                const cached = this.getCacheEntry(templateId, ttl);
                if (cached) return cached;
            }

            await connectToDatabase();

            const selectFields = includeContent ? `${select} content` : select;
            const projection = selectFields.split(" ").reduce((acc, field) => {
                if (field.trim()) acc[field.trim()] = 1;
                return acc;
            }, {} as Record<string, 1>);

            const template = await measureQuery(
                `findTemplateById_${templateId}`,
                Template.findById(templateId, projection)
                    // .select(selectFields)
                    // .populate("author", "name avatar")
                    .populate("categories", "name slug")
                    .lean(lean)
            );

            if (template && !includeContent) {
                this.setCacheEntry(templateId, template, ttl);
            }

            return template;
        } catch (err) {
            console.error("TemplateService.findById error:", err);
            throw err;
        }
    }

    /**
     * Create new template
     */
    async createTemplate(data: any) {
        try {
            await connectToDatabase();
            const template = new Template(data);
            const saved = await measureQuery("createTemplate", template.save());
            const plain = saved.toObject();
            this.setCacheEntry(plain._id.toString(), plain);
            return plain;
        } catch (err) {
            console.error("TemplateService.createTemplate error:", err);
            throw err;
        }
    }

    /**
     * Update template
     */
    async updateTemplate(
        templateId: string,
        updateData: any,
        options: TemplateQueryOptions = {}
    ) {
        try {
            const {
                select = "_id title description thumbnail price averageRating downloads categories tags isActive updatedAt",
                lean = true,
            } = options;

            await connectToDatabase();

            const updated = await measureQuery(
                `updateTemplate_${templateId}`,
                Template.findByIdAndUpdate(
                    templateId,
                    {$set: {...updateData, updatedAt: new Date()}},
                    {new: true, runValidators: true, select}
                ).lean(lean)
            );

            this.clearTemplateCache(templateId);
            return updated;
        } catch (err) {
            console.error("TemplateService.updateTemplate error:", err);
            throw err;
        }
    }

    /**
     * Delete template (soft delete supported)
     */
    async deleteTemplate(templateId: string, softDelete = true) {
        try {
            await connectToDatabase();

            let result;
            if (softDelete) {
                result = await measureQuery(
                    `softDeleteTemplate_${templateId}`,
                    Template.findByIdAndUpdate(
                        templateId,
                        {isActive: false},
                        {new: true}
                    )
                );
            } else {
                result = await measureQuery(
                    `deleteTemplate_${templateId}`,
                    Template.findByIdAndDelete(templateId)
                );
            }

            this.clearTemplateCache(templateId);
            return result;
        } catch (err) {
            console.error("TemplateService.deleteTemplate error:", err);
            throw err;
        }
    }

    /**
     * Get popular templates
     */
    async getPopularTemplates(limit = 20, skip = 0) {
        await connectToDatabase();

        const fetchedTemplates = await Template.findPopularTemplates(limit, skip);

        const templates = fetchedTemplates.map((template: ITemplate, idx: number) => {
            return {
                // TODO: Add Logic to get the reviews of a specific template from Reviews using templateId
                ...template,
                reviews: 0,
                gradient: Gradients[idx],
            };
        });

        return templates;
    }

    /**
     * Get templates by category
     */
    async getByCategory(categoryId: string, limit = 20, skip = 0) {
        await connectToDatabase();
        return Template.findByCategory(categoryId, limit, skip);
    }

    /**
     * Search templates
     */
    async searchTemplates(
        {
            search = "",
            free = false,
            framer = false,
            coded = false,
            figma = false,
            tags = [],
            categories = []
        }: {
            search?: string;
            free?: boolean;
            framer?: boolean;
            coded?: boolean;
            figma?: boolean;
            tags?: string[];
            categories?: string[];
        }, limit = 20, skip = 0) {
        await connectToDatabase();
        const query = {isActive: true};

        // Text search
        if (search) {
            query.$text = {$search: search};
        }

        // Free templates filter
        if (free) {
            query.price = 0;
        }

        // builtWith filter
        const builtWithFilters: string[] = [];
        if (framer) builtWithFilters.push("framer");
        if (coded) builtWithFilters.push("coded");
        if (figma) builtWithFilters.push("figma");
        if (builtWithFilters.length > 0) {
            query.builtWith = {$in: builtWithFilters};
        }

        // Tags filter
        if (tags.length > 0) {
            query.tags = {$in: tags.map(tag => tag.toLowerCase())};
        }

        // Categories filter
        if (categories.length > 0) {
            query.categories = {$in: categories};
        }

        return Template.searchTemplates(query, limit, skip);
    }

    /**
     * Get free templates
     */
    async getFreeTemplates(limit = 20, skip = 0) {
        await connectToDatabase();
        return Template.findFreeTemplates(limit, skip);
    }

    /**
     * Get All Templates or specific Templates by query and sort it by pagination
     */
    async getTemplates(query = {}, limit = 10, skip = 0) {
        await connectToDatabase();

        return Template.find(query).limit(10).skip(skip).lean();
    }

    /**
     * Get template stats
     */
    async getStats() {
        await connectToDatabase();
        return Template.getTemplateStats();
    }

    /**
     * Clear template cache
     */
    clearTemplateCache(templateId: string) {
        this.templateCache.delete(templateId);
    }

    /**
     * Clear all template cache
     */
    clearAllCache() {
        this.templateCache.clear();
    }

    /**
     * Cache stats
     */
    getCacheStats() {
        const now = Date.now();
        let valid = 0;
        let expired = 0;

        for (const template of this.templateCache.values()) {
            if (this.isCacheValid(template)) valid++;
            else expired++;
        }

        return {
            total: this.templateCache.size,
            valid,
            expired,
            maxSize: this.maxCacheSize,
            ttl: this.defaultTTL,
        };
    }

    /**
     * Destroy service
     */
    destroy() {
        if (this.cleanupInterval) clearInterval(this.cleanupInterval);
        this.clearAllCache();
    }
}

export const TemplateService = new TemplateServiceClass();
export {TemplateServiceClass};
