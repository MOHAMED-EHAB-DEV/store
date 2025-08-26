import Template from "@/lib/models/optimized/Template";
import { connectToDatabase, measureQuery } from "@/lib/database-optimized";
import { cache } from "@/lib/cache/redis-cache";
import { recordRequest } from "@/lib/monitoring/performance-monitor";
import { Types } from "mongoose";

interface CacheConfig {
    ttl: number;
    prefix: string;
}

interface SearchOptions {
    search?: string;
    categories?: string[];
    tags?: string[];
    builtWith?: string[];
    priceRange?: { min?: number; max?: number };
    minRating?: number;
    sortBy?: 'popular' | 'recent' | 'rating' | 'price' | 'downloads';
}

interface TemplateQueryOptions {
    select?: string;
    lean?: boolean;
    includeContent?: boolean;
    populate?: boolean;
}

class OptimizedTemplateService {
    private readonly cacheConfig: Record<string, CacheConfig> = {
        template: { ttl: 10 * 60 * 1000, prefix: 'template:' }, // 10 minutes
        popular: { ttl: 5 * 60 * 1000, prefix: 'popular:' }, // 5 minutes
        search: { ttl: 3 * 60 * 1000, prefix: 'search:' }, // 3 minutes
        category: { ttl: 10 * 60 * 1000, prefix: 'category:' }, // 10 minutes
        free: { ttl: 15 * 60 * 1000, prefix: 'free:' }, // 15 minutes
        stats: { ttl: 30 * 60 * 1000, prefix: 'stats:' }, // 30 minutes
        trending: { ttl: 5 * 60 * 1000, prefix: 'trending:' } // 5 minutes
    };

    /**
     * Generate cache key with consistent formatting
     */
    private generateCacheKey(type: string, params: any): string {
        const { prefix } = this.cacheConfig[type];
        const paramString = typeof params === 'object' ? JSON.stringify(params) : String(params);
        return `${prefix}${Buffer.from(paramString).toString('base64')}`;
    }

    /**
     * Execute query with caching and performance monitoring
     */
    private async executeWithCache<T>(
        cacheType: string,
        cacheParams: any,
        queryFn: () => Promise<T>,
        queryName: string
    ): Promise<T> {
        const startTime = Date.now();
        const cacheKey = this.generateCacheKey(cacheType, cacheParams);
        
        try {
            // Try cache first
            const cached = await cache.get<T>(cacheKey);
            if (cached !== null) {
                const duration = Date.now() - startTime;
                recordRequest('TemplateService', queryName, 200, duration, { cacheHit: true });
                return cached;
            }

            // Execute query
            await connectToDatabase();
            const result = await measureQuery(queryName, queryFn());

            // Cache result
            const { ttl } = this.cacheConfig[cacheType];
            await cache.set(cacheKey, result, ttl);

            const duration = Date.now() - startTime;
            recordRequest('TemplateService', queryName, 200, duration, { cacheHit: false });

            return result;

        } catch (error) {
            const duration = Date.now() - startTime;
            recordRequest('TemplateService', queryName, 500, duration, { 
                errorType: error instanceof Error ? error.name : 'Unknown' 
            });
            throw error;
        }
    }

    /**
     * Find template by ID with advanced caching
     */
    async findById(
        templateId: string,
        options: TemplateQueryOptions = {}
    ): Promise<any> {
        const {
            select = "_id title description thumbnail demoLink price averageRating downloads views reviewCount categories tags builtWith isFeatured createdAt",
            lean = true,
            includeContent = false,
            populate = true
        } = options;

        // Don't cache if content is included (for security and size)
        if (includeContent) {
            await connectToDatabase();
            
            const selectFields = `${select} content`;
            return await measureQuery(
                `findTemplateById_${templateId}_withContent`,
                Template.findById(templateId)
                    .select(selectFields)
                    .populate(populate ? [
                        { path: 'author', select: 'name avatar' },
                        { path: 'categories', select: 'name slug' }
                    ] : [])
                    .lean(lean)
            );
        }

        return this.executeWithCache(
            'template',
            { id: templateId, select, populate },
            async () => {
                return await Template.findById(templateId)
                    .select(select)
                    .populate(populate ? [
                        { path: 'author', select: 'name avatar' },
                        { path: 'categories', select: 'name slug' }
                    ] : [])
                    .lean(lean);
            },
            `findTemplateById_${templateId}`
        );
    }

    /**
     * Get popular templates with advanced caching and performance optimization
     */
    async getPopularTemplates(
        limit: number = 20,
        skip: number = 0,
        timeframe: 'all' | 'week' | 'month' = 'all',
        category?: string
    ): Promise<any[]> {
        return this.executeWithCache(
            'popular',
            { limit, skip, timeframe, category },
            async () => {
                let matchStage: any = { isActive: true };

                // Add timeframe filter
                if (timeframe !== 'all') {
                    const now = new Date();
                    let cutoffDate: Date;
                    
                    switch (timeframe) {
                        case 'week':
                            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            break;
                        case 'month':
                            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            break;
                        default:
                            cutoffDate = new Date(0);
                    }
                    
                    matchStage.createdAt = { $gte: cutoffDate };
                }

                // Add category filter
                if (category) {
                    matchStage.categories = new Types.ObjectId(category);
                }

                return await Template.findPopularTemplates(limit, skip);
            },
            `getPopularTemplates_${limit}_${skip}_${timeframe}_${category || 'all'}`
        );
    }

    /**
     * Search templates with optimized caching and query performance
     */
    async searchTemplates(
        searchOptions: SearchOptions,
        limit: number = 20,
        skip: number = 0
    ): Promise<any[]> {
        return this.executeWithCache(
            'search',
            { searchOptions, limit, skip },
            async () => {
                return await Template.searchTemplates(searchOptions, limit, skip);
            },
            `searchTemplates_${JSON.stringify(searchOptions)}_${limit}_${skip}`
        );
    }

    /**
     * Get templates by category with caching
     */
    async getByCategory(
        categoryId: string,
        limit: number = 20,
        skip: number = 0,
        sortBy: 'rating' | 'downloads' | 'recent' = 'rating'
    ): Promise<any[]> {
        return this.executeWithCache(
            'category',
            { categoryId, limit, skip, sortBy },
            async () => {
                return await Template.findByCategory(categoryId, limit, skip);
            },
            `getByCategory_${categoryId}_${limit}_${skip}_${sortBy}`
        );
    }

    /**
     * Get free templates with caching
     */
    async getFreeTemplates(limit: number = 20, skip: number = 0): Promise<any[]> {
        return this.executeWithCache(
            'free',
            { limit, skip },
            async () => {
                return await Template.findFreeTemplates(limit, skip);
            },
            `getFreeTemplates_${limit}_${skip}`
        );
    }

    /**
     * Get trending templates
     */
    async getTrendingTemplates(
        days: number = 7,
        limit: number = 20
    ): Promise<any[]> {
        return this.executeWithCache(
            'trending',
            { days, limit },
            async () => {
                return await Template.getTrendingTemplates(days, limit);
            },
            `getTrendingTemplates_${days}_${limit}`
        );
    }

    /**
     * Get template statistics with caching
     */
    async getStats(): Promise<any> {
        return this.executeWithCache(
            'stats',
            'general',
            async () => {
                return await Template.getTemplateStats();
            },
            'getTemplateStats'
        );
    }

    /**
     * Create new template with cache invalidation
     */
    async createTemplate(data: any): Promise<any> {
        const startTime = Date.now();
        
        try {
            await connectToDatabase();
            
            const template = new Template(data);
            const saved = await measureQuery("createTemplate", template.save());
            const result = saved.toObject();

            // Invalidate related caches
            await this.invalidateRelatedCaches('create', result);

            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'createTemplate', 201, duration);

            return result;

        } catch (error) {
            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'createTemplate', 500, duration, {
                errorType: error instanceof Error ? error.name : 'Unknown'
            });
            throw error;
        }
    }

    /**
     * Update template with cache invalidation
     */
    async updateTemplate(
        templateId: string,
        updateData: any,
        options: TemplateQueryOptions = {}
    ): Promise<any> {
        const startTime = Date.now();
        
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
                    { $set: { ...updateData, updatedAt: new Date() } },
                    { new: true, runValidators: true, select }
                ).lean(lean)
            );

            if (updated) {
                // Invalidate related caches
                await this.invalidateRelatedCaches('update', updated);
            }

            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'updateTemplate', 200, duration);

            return updated;

        } catch (error) {
            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'updateTemplate', 500, duration, {
                errorType: error instanceof Error ? error.name : 'Unknown'
            });
            throw error;
        }
    }

    /**
     * Delete template with cache invalidation
     */
    async deleteTemplate(templateId: string, softDelete: boolean = true): Promise<any> {
        const startTime = Date.now();
        
        try {
            await connectToDatabase();

            let result;
            if (softDelete) {
                result = await measureQuery(
                    `softDeleteTemplate_${templateId}`,
                    Template.findByIdAndUpdate(
                        templateId,
                        { isActive: false, updatedAt: new Date() },
                        { new: true }
                    )
                );
            } else {
                result = await measureQuery(
                    `deleteTemplate_${templateId}`,
                    Template.findByIdAndDelete(templateId)
                );
            }

            if (result) {
                // Invalidate all related caches
                await this.invalidateRelatedCaches('delete', result);
            }

            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'deleteTemplate', 200, duration);

            return result;

        } catch (error) {
            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'deleteTemplate', 500, duration, {
                errorType: error instanceof Error ? error.name : 'Unknown'
            });
            throw error;
        }
    }

    /**
     * Increment template views with rate limiting
     */
    async incrementViews(templateId: string, userId?: string): Promise<void> {
        const startTime = Date.now();
        
        try {
            // Rate limiting: one view per user per template per hour
            if (userId) {
                const viewKey = `view:${templateId}:${userId}`;
                const hasViewed = await cache.get(viewKey);
                if (hasViewed) {
                    return; // User already viewed this template recently
                }
                await cache.set(viewKey, true, 60 * 60 * 1000); // 1 hour
            }

            await connectToDatabase();
            
            await measureQuery(
                `incrementViews_${templateId}`,
                Template.findByIdAndUpdate(
                    templateId,
                    { 
                        $inc: { views: 1 },
                        $set: { lastViewedAt: new Date() }
                    }
                )
            );

            // Invalidate template cache
            await cache.invalidatePattern(`${this.cacheConfig.template.prefix}*${templateId}*`);

            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'incrementViews', 200, duration);

        } catch (error) {
            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'incrementViews', 500, duration, {
                errorType: error instanceof Error ? error.name : 'Unknown'
            });
            console.error('Failed to increment template views:', error);
        }
    }

    /**
     * Increment template downloads
     */
    async incrementDownloads(templateId: string): Promise<void> {
        const startTime = Date.now();
        
        try {
            await connectToDatabase();
            
            await measureQuery(
                `incrementDownloads_${templateId}`,
                Template.findByIdAndUpdate(
                    templateId,
                    { $inc: { downloads: 1 } }
                )
            );

            // Invalidate related caches
            await cache.invalidatePattern(`${this.cacheConfig.template.prefix}*${templateId}*`);
            await cache.invalidatePattern(`${this.cacheConfig.popular.prefix}*`);

            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'incrementDownloads', 200, duration);

        } catch (error) {
            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'incrementDownloads', 500, duration, {
                errorType: error instanceof Error ? error.name : 'Unknown'
            });
            throw error;
        }
    }

    /**
     * Batch operations for multiple templates
     */
    async batchUpdate(
        updates: Array<{ id: string; data: any }>
    ): Promise<{ successful: string[]; failed: Array<{ id: string; error: string }> }> {
        const startTime = Date.now();
        const successful: string[] = [];
        const failed: Array<{ id: string; error: string }> = [];

        try {
            await connectToDatabase();

            // Process in batches of 10
            const batchSize = 10;
            for (let i = 0; i < updates.length; i += batchSize) {
                const batch = updates.slice(i, i + batchSize);
                
                const promises = batch.map(async ({ id, data }) => {
                    try {
                        await Template.findByIdAndUpdate(
                            id,
                            { $set: { ...data, updatedAt: new Date() } },
                            { runValidators: true }
                        );
                        successful.push(id);
                    } catch (error) {
                        failed.push({
                            id,
                            error: error instanceof Error ? error.message : 'Unknown error'
                        });
                    }
                });

                await Promise.allSettled(promises);
            }

            // Invalidate all caches after batch update
            await this.invalidateAllCaches();

            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'batchUpdate', 200, duration);

            return { successful, failed };

        } catch (error) {
            const duration = Date.now() - startTime;
            recordRequest('TemplateService', 'batchUpdate', 500, duration, {
                errorType: error instanceof Error ? error.name : 'Unknown'
            });
            throw error;
        }
    }

    /**
     * Invalidate related caches based on operation
     */
    private async invalidateRelatedCaches(operation: 'create' | 'update' | 'delete', template: any): Promise<void> {
        try {
            const patterns = [
                `${this.cacheConfig.template.prefix}*${template._id}*`,
                `${this.cacheConfig.popular.prefix}*`,
                `${this.cacheConfig.stats.prefix}*`
            ];

            // Add category-specific invalidation
            if (template.categories && template.categories.length > 0) {
                template.categories.forEach((categoryId: string) => {
                    patterns.push(`${this.cacheConfig.category.prefix}*${categoryId}*`);
                });
            }

            // Add search invalidation
            patterns.push(`${this.cacheConfig.search.prefix}*`);

            // Add free templates invalidation if price is 0
            if (template.price === 0) {
                patterns.push(`${this.cacheConfig.free.prefix}*`);
            }

            // Add trending invalidation
            patterns.push(`${this.cacheConfig.trending.prefix}*`);

            // Execute invalidations in parallel
            await Promise.all(patterns.map(pattern => cache.invalidatePattern(pattern)));

            console.log(`🗑️ Invalidated caches for template ${template._id} (${operation})`);

        } catch (error) {
            console.error('Failed to invalidate caches:', error);
        }
    }

    /**
     * Invalidate all template-related caches
     */
    async invalidateAllCaches(): Promise<void> {
        try {
            const patterns = Object.values(this.cacheConfig).map(config => `${config.prefix}*`);
            await Promise.all(patterns.map(pattern => cache.invalidatePattern(pattern)));
            console.log('🗑️ All template caches invalidated');
        } catch (error) {
            console.error('Failed to invalidate all caches:', error);
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): any {
        return cache.stats();
    }

    /**
     * Warm up cache with popular content
     */
    async warmupCache(): Promise<void> {
        console.log('🔥 Warming up template cache...');
        
        try {
            // Warm up popular templates
            await this.getPopularTemplates(20, 0);
            await this.getFreeTemplates(20, 0);
            await this.getStats();

            console.log('✅ Template cache warmed up');
        } catch (error) {
            console.error('❌ Cache warmup failed:', error);
        }
    }
}

// Export singleton instance
export const TemplateService = new OptimizedTemplateService();
export { OptimizedTemplateService };
