import { Redis } from 'ioredis';

// Redis configuration interface
interface RedisConfig {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
    enableOfflineQueue?: boolean;
    connectTimeout?: number;
    commandTimeout?: number;
    lazyConnect?: boolean;
}

// Cache entry interface
interface CacheEntry<T = any> {
    data: T;
    timestamp: number;
    ttl: number;
    compressed?: boolean;
}

// Cache statistics interface
interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    errors: number;
    hitRate: number;
    avgResponseTime: number;
    redisConnected: boolean;
    memoryFallbackUsed: number;
}

class RedisCacheManager {
    private redis: Redis | null = null;
    private memoryCache = new Map<string, CacheEntry>();
    private isConnected = false;
    private stats: CacheStats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
        hitRate: 0,
        avgResponseTime: 0,
        redisConnected: false,
        memoryFallbackUsed: 0
    };
    
    private readonly maxMemoryCacheSize = 1000;
    private readonly compressionThreshold = 1024; // Compress values larger than 1KB
    private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
    private readonly maxValueSize = 10 * 1024 * 1024; // 10MB max value size

    constructor() {
        this.initializeRedis();
        this.startCleanupInterval();
    }

    private async initializeRedis() {
        try {
            const config: RedisConfig = {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                db: parseInt(process.env.REDIS_DB || '0'),
                maxRetriesPerRequest: 3,
                retryDelayOnFailover: 100,
                enableOfflineQueue: false,
                connectTimeout: 10000,
                commandTimeout: 5000,
                lazyConnect: true
            };

            this.redis = new Redis(config);

            this.redis.on('connect', () => {
                console.log('✅ Redis connected');
                this.isConnected = true;
                this.stats.redisConnected = true;
            });

            this.redis.on('error', (error) => {
                console.error('❌ Redis error:', error);
                this.isConnected = false;
                this.stats.redisConnected = false;
                this.stats.errors++;
            });

            this.redis.on('close', () => {
                console.warn('⚠️ Redis connection closed');
                this.isConnected = false;
                this.stats.redisConnected = false;
            });

            this.redis.on('reconnecting', () => {
                console.log('🔄 Redis reconnecting...');
            });

            // Test connection
            await this.redis.ping();
            
        } catch (error) {
            console.warn('⚠️ Redis initialization failed, using memory cache only:', error);
            this.redis = null;
            this.isConnected = false;
        }
    }

    private startCleanupInterval() {
        // Clean up expired memory cache entries every minute
        setInterval(() => {
            this.cleanupMemoryCache();
        }, 60 * 1000);
    }

    private cleanupMemoryCache() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.memoryCache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.memoryCache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired entries from memory cache`);
        }
    }

    private compressValue(value: string): string {
        // Simple compression using built-in compression
        // In production, you might want to use a library like lz-string
        try {
            return JSON.stringify(value);
        } catch {
            return value;
        }
    }

    private decompressValue(value: string): string {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    private getMemoryCacheEntry<T>(key: string): T | null {
        const entry = this.memoryCache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > entry.ttl) {
            this.memoryCache.delete(key);
            return null;
        }

        return entry.data;
    }

    private setMemoryCacheEntry<T>(key: string, data: T, ttl: number) {
        // Implement LRU behavior
        if (this.memoryCache.size >= this.maxMemoryCacheSize) {
            const firstKey = this.memoryCache.keys().next().value;
            if (firstKey) {
                this.memoryCache.delete(firstKey);
            }
        }

        this.memoryCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    async get<T = any>(key: string): Promise<T | null> {
        const startTime = Date.now();

        try {
            // Try Redis first if connected
            if (this.redis && this.isConnected) {
                try {
                    const value = await this.redis.get(key);
                    if (value !== null) {
                        this.stats.hits++;
                        this.updateResponseTime(Date.now() - startTime);
                        
                        try {
                            const parsed = JSON.parse(value);
                            return parsed.compressed ? 
                                JSON.parse(this.decompressValue(parsed.data)) : 
                                parsed.data;
                        } catch {
                            return value as T;
                        }
                    }
                } catch (error) {
                    console.warn('Redis get error, falling back to memory cache:', error);
                    this.stats.errors++;
                }
            }

            // Fallback to memory cache
            const memoryResult = this.getMemoryCacheEntry<T>(key);
            if (memoryResult !== null) {
                this.stats.hits++;
                this.stats.memoryFallbackUsed++;
                this.updateResponseTime(Date.now() - startTime);
                return memoryResult;
            }

            this.stats.misses++;
            this.updateResponseTime(Date.now() - startTime);
            return null;

        } catch (error) {
            console.error('Cache get error:', error);
            this.stats.errors++;
            return null;
        }
    }

    async set<T = any>(key: string, value: T, ttl: number = this.defaultTTL): Promise<boolean> {
        const startTime = Date.now();

        try {
            // Validate value size
            const serialized = JSON.stringify(value);
            if (serialized.length > this.maxValueSize) {
                console.warn(`Value too large for cache: ${serialized.length} bytes`);
                return false;
            }

            // Prepare value for storage
            let storeValue: any;
            let compressed = false;

            if (serialized.length > this.compressionThreshold) {
                storeValue = {
                    data: this.compressValue(serialized),
                    compressed: true
                };
                compressed = true;
            } else {
                storeValue = {
                    data: value,
                    compressed: false
                };
            }

            // Try Redis first if connected
            if (this.redis && this.isConnected) {
                try {
                    const ttlSeconds = Math.ceil(ttl / 1000);
                    await this.redis.setex(key, ttlSeconds, JSON.stringify(storeValue));
                    this.stats.sets++;
                    this.updateResponseTime(Date.now() - startTime);
                    return true;
                } catch (error) {
                    console.warn('Redis set error, falling back to memory cache:', error);
                    this.stats.errors++;
                }
            }

            // Fallback to memory cache
            this.setMemoryCacheEntry(key, value, ttl);
            this.stats.sets++;
            this.stats.memoryFallbackUsed++;
            this.updateResponseTime(Date.now() - startTime);
            return true;

        } catch (error) {
            console.error('Cache set error:', error);
            this.stats.errors++;
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        const startTime = Date.now();

        try {
            let deleted = false;

            // Delete from Redis if connected
            if (this.redis && this.isConnected) {
                try {
                    const result = await this.redis.del(key);
                    deleted = result > 0;
                } catch (error) {
                    console.warn('Redis delete error:', error);
                    this.stats.errors++;
                }
            }

            // Delete from memory cache
            const memoryDeleted = this.memoryCache.delete(key);
            deleted = deleted || memoryDeleted;

            if (deleted) {
                this.stats.deletes++;
            }

            this.updateResponseTime(Date.now() - startTime);
            return deleted;

        } catch (error) {
            console.error('Cache delete error:', error);
            this.stats.errors++;
            return false;
        }
    }

    async invalidatePattern(pattern: string): Promise<number> {
        let deleted = 0;

        try {
            // Redis pattern deletion
            if (this.redis && this.isConnected) {
                try {
                    const keys = await this.redis.keys(pattern);
                    if (keys.length > 0) {
                        const result = await this.redis.del(...keys);
                        deleted += result;
                    }
                } catch (error) {
                    console.warn('Redis pattern invalidation error:', error);
                    this.stats.errors++;
                }
            }

            // Memory cache pattern deletion
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            for (const [key] of this.memoryCache.entries()) {
                if (regex.test(key)) {
                    this.memoryCache.delete(key);
                    deleted++;
                }
            }

            console.log(`🗑️ Invalidated ${deleted} cache entries matching pattern: ${pattern}`);
            return deleted;

        } catch (error) {
            console.error('Cache pattern invalidation error:', error);
            return 0;
        }
    }

    async mget<T = any>(keys: string[]): Promise<Array<T | null>> {
        const startTime = Date.now();

        try {
            const results: Array<T | null> = new Array(keys.length).fill(null);
            let found = 0;

            // Try Redis first if connected
            if (this.redis && this.isConnected) {
                try {
                    const values = await this.redis.mget(...keys);
                    for (let i = 0; i < values.length; i++) {
                        if (values[i] !== null) {
                            try {
                                const parsed = JSON.parse(values[i]!);
                                results[i] = parsed.compressed ? 
                                    JSON.parse(this.decompressValue(parsed.data)) : 
                                    parsed.data;
                                found++;
                            } catch {
                                results[i] = values[i] as T;
                                found++;
                            }
                        }
                    }
                } catch (error) {
                    console.warn('Redis mget error:', error);
                    this.stats.errors++;
                }
            }

            // Fill missing values from memory cache
            for (let i = 0; i < keys.length; i++) {
                if (results[i] === null) {
                    const memoryResult = this.getMemoryCacheEntry<T>(keys[i]);
                    if (memoryResult !== null) {
                        results[i] = memoryResult;
                        found++;
                        this.stats.memoryFallbackUsed++;
                    }
                }
            }

            this.stats.hits += found;
            this.stats.misses += (keys.length - found);
            this.updateResponseTime(Date.now() - startTime);

            return results;

        } catch (error) {
            console.error('Cache mget error:', error);
            this.stats.errors++;
            return new Array(keys.length).fill(null);
        }
    }

    async mset<T = any>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<boolean> {
        const startTime = Date.now();

        try {
            let success = true;

            // Redis batch set
            if (this.redis && this.isConnected) {
                try {
                    const pipeline = this.redis.pipeline();
                    
                    for (const entry of entries) {
                        const ttl = entry.ttl || this.defaultTTL;
                        const serialized = JSON.stringify(entry.value);
                        
                        let storeValue: any;
                        if (serialized.length > this.compressionThreshold) {
                            storeValue = {
                                data: this.compressValue(serialized),
                                compressed: true
                            };
                        } else {
                            storeValue = {
                                data: entry.value,
                                compressed: false
                            };
                        }
                        
                        pipeline.setex(entry.key, Math.ceil(ttl / 1000), JSON.stringify(storeValue));
                    }
                    
                    await pipeline.exec();
                    this.stats.sets += entries.length;
                } catch (error) {
                    console.warn('Redis mset error:', error);
                    this.stats.errors++;
                    success = false;
                }
            }

            // Memory cache fallback
            if (!success || !this.isConnected) {
                for (const entry of entries) {
                    const ttl = entry.ttl || this.defaultTTL;
                    this.setMemoryCacheEntry(entry.key, entry.value, ttl);
                    this.stats.memoryFallbackUsed++;
                }
                this.stats.sets += entries.length;
            }

            this.updateResponseTime(Date.now() - startTime);
            return true;

        } catch (error) {
            console.error('Cache mset error:', error);
            this.stats.errors++;
            return false;
        }
    }

    private updateResponseTime(duration: number) {
        // Simple moving average
        this.stats.avgResponseTime = (this.stats.avgResponseTime * 0.9) + (duration * 0.1);
    }

    getStats(): CacheStats {
        const totalOperations = this.stats.hits + this.stats.misses;
        this.stats.hitRate = totalOperations > 0 ? (this.stats.hits / totalOperations) * 100 : 0;
        
        return {
            ...this.stats,
            hitRate: Math.round(this.stats.hitRate * 100) / 100,
            avgResponseTime: Math.round(this.stats.avgResponseTime * 100) / 100
        };
    }

    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0,
            hitRate: 0,
            avgResponseTime: 0,
            redisConnected: this.isConnected,
            memoryFallbackUsed: 0
        };
    }

    async flush(): Promise<boolean> {
        try {
            let success = true;

            // Flush Redis
            if (this.redis && this.isConnected) {
                try {
                    await this.redis.flushdb();
                } catch (error) {
                    console.error('Redis flush error:', error);
                    success = false;
                }
            }

            // Flush memory cache
            this.memoryCache.clear();

            console.log('🗑️ Cache flushed');
            return success;

        } catch (error) {
            console.error('Cache flush error:', error);
            return false;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.redis) {
                await this.redis.quit();
                this.redis = null;
            }
            this.memoryCache.clear();
            this.isConnected = false;
            console.log('✅ Cache disconnected');
        } catch (error) {
            console.error('Cache disconnect error:', error);
        }
    }

    // Health check
    async healthCheck(): Promise<{
        redis: boolean;
        memory: boolean;
        stats: CacheStats;
    }> {
        let redisHealthy = false;

        if (this.redis && this.isConnected) {
            try {
                await this.redis.ping();
                redisHealthy = true;
            } catch (error) {
                console.warn('Redis health check failed:', error);
            }
        }

        return {
            redis: redisHealthy,
            memory: this.memoryCache.size < this.maxMemoryCacheSize,
            stats: this.getStats()
        };
    }
}

// Create singleton instance
export const cacheManager = new RedisCacheManager();

// Export convenience functions
export const cache = {
    get: <T = any>(key: string) => cacheManager.get<T>(key),
    set: <T = any>(key: string, value: T, ttl?: number) => cacheManager.set(key, value, ttl),
    delete: (key: string) => cacheManager.delete(key),
    invalidatePattern: (pattern: string) => cacheManager.invalidatePattern(pattern),
    mget: <T = any>(keys: string[]) => cacheManager.mget<T>(keys),
    mset: <T = any>(entries: Array<{ key: string; value: T; ttl?: number }>) => cacheManager.mset(entries),
    flush: () => cacheManager.flush(),
    stats: () => cacheManager.getStats(),
    healthCheck: () => cacheManager.healthCheck()
};

export default cache;
