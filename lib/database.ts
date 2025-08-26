import mongoose from 'mongoose';

declare global {
    var mongoose: any;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// Performance monitoring class
class QueryPerformanceMonitor {
    private static slowQueries = new Map<string, { count: number; totalTime: number; avgTime: number }>();
    private static readonly SLOW_QUERY_THRESHOLD = 100; // ms

    static logQuery<T>(queryName: string, duration: number): void {
        if (duration > this.SLOW_QUERY_THRESHOLD) {
            const existing = this.slowQueries.get(queryName) || { count: 0, totalTime: 0, avgTime: 0 };
            existing.count++;
            existing.totalTime += duration;
            existing.avgTime = existing.totalTime / existing.count;
            this.slowQueries.set(queryName, existing);
            
            console.warn(`🐌 Slow query "${queryName}": ${duration}ms (avg: ${existing.avgTime.toFixed(2)}ms)`);
        }
    }

    static getSlowQueries() {
        return Array.from(this.slowQueries.entries())
            .sort(([,a], [,b]) => b.avgTime - a.avgTime)
            .slice(0, 10);
    }

    static clearStats() {
        this.slowQueries.clear();
    }
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            // Connection pool optimization - CRITICAL for performance
            maxPoolSize: 10, // Maximum number of connections
            minPoolSize: 2,  // Minimum number of connections
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
            family: 4, // Use IPv4, skip trying IPv6
            
            // Buffer optimization
            bufferCommands: false, // Disable mongoose buffering
            bufferMaxEntries: 0, // Disable mongoose buffering
            
            // Performance optimizations
            retryWrites: true,
            readPreference: 'primaryPreferred', // Read from primary, fallback to secondary
            readConcern: { level: 'local' }, // Faster reads, eventual consistency
            writeConcern: { 
                w: 'majority', 
                j: true, // Journal for durability
                wtimeout: 10000 // Write timeout
            },
            
            // Compression for better network performance
            compressors: ['zlib'],
            zlibCompressionLevel: 6,
            
            // Auth optimization
            authMechanism: 'SCRAM-SHA-256',
            
            // Heartbeat optimization
            heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
            
            // Additional performance settings
            maxStalenessSeconds: 90, // Allow secondary reads up to 90 seconds stale
            localThresholdMS: 15, // Consider servers within 15ms as equivalent
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ Connected to MongoDB with optimized settings');
            
            // Connection event handlers for monitoring
            mongoose.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                console.warn('⚠️ MongoDB disconnected');
                cached.conn = null;
                cached.promise = null;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
            });

            // Query performance monitoring
            mongoose.connection.on('command.started', (event) => {
                (event as any).startTime = Date.now();
            });

            mongoose.connection.on('command.succeeded', (event) => {
                const duration = Date.now() - ((event as any).startTime || 0);
                QueryPerformanceMonitor.logQuery(event.commandName, duration);
            });

            // Set read/write concerns globally for better performance
            mongoose.connection.db.readConcern = { level: 'local' };
            
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ Failed to connect to MongoDB:', e);
        throw e;
    }

    return cached.conn;
}

// Enhanced performance monitoring with detailed metrics
export function measureQuery<T>(queryName: string, queryPromise: Promise<T>): Promise<T> {
    const start = Date.now();
    return queryPromise.then((result) => {
        const duration = Date.now() - start;
        QueryPerformanceMonitor.logQuery(queryName, duration);
        return result;
    }).catch((error) => {
        const duration = Date.now() - start;
        console.error(`❌ Query "${queryName}" failed after ${duration}ms:`, error);
        throw error;
    });
}

// Batch operation helper for bulk writes
export async function batchOperation<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 10,
    delayMs: number = 0
): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(op => op()));
        results.push(...batchResults);
        
        // Optional delay between batches to prevent overwhelming the database
        if (delayMs > 0 && i + batchSize < operations.length) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    
    return results;
}

// Aggregation pipeline helper with automatic optimization
export function optimizeAggregationPipeline(pipeline: any[]): any[] {
    // Move $match stages as early as possible
    const matchStages = pipeline.filter(stage => stage.$match);
    const otherStages = pipeline.filter(stage => !stage.$match);
    
    // Add index hints for better performance
    const optimizedPipeline = [
        ...matchStages,
        ...otherStages
    ];
    
    return optimizedPipeline;
}

// Connection health check
export async function checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    connections: number;
    slowQueries: Array<[string, any]>;
}> {
    const start = Date.now();
    
    try {
        await connectToDatabase();
        
        // Simple ping to measure latency
        await mongoose.connection.db.admin().ping();
        const latency = Date.now() - start;
        
        // Get connection pool stats
        const stats = mongoose.connection.db.serverStatus ? 
            await mongoose.connection.db.admin().serverStatus() : {};
        
        return {
            status: 'healthy',
            latency,
            connections: stats.connections?.current || 0,
            slowQueries: QueryPerformanceMonitor.getSlowQueries()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            latency: Date.now() - start,
            connections: 0,
            slowQueries: []
        };
    }
}

// Graceful shutdown helper
export async function closeDatabaseConnection(): Promise<void> {
    if (cached.conn) {
        await mongoose.connection.close();
        cached.conn = null;
        cached.promise = null;
        console.log('✅ Database connection closed gracefully');
    }
}

// Export performance monitor for external usage
export { QueryPerformanceMonitor };
