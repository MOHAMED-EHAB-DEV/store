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

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Connection pool optimization
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 60000, // Close sockets after 45 seconds of inactivity
            connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
            family: 4, // Use IPv4, skip trying IPv6
            // Performance optimizations
            retryWrites: true,
            readPreference: 'secondaryPreferred', // Read from secondary when possible
            writeConcern: { w: 'majority', j: true }, // Ensure writes are acknowledged
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ Connected to MongoDB');
            
            // Connection event handlers for monitoring
            mongoose.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                console.warn('⚠️ MongoDB disconnected');
                cached.conn = null;
                cached.promise = null;
            });

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

// Performance monitoring helper
export function measureQuery<T>(queryName: string, queryPromise: Promise<T>): Promise<T> {
    const start = Date.now();
    return queryPromise.then((result) => {
        const duration = Date.now() - start;
        if (duration > 100) {
            console.warn(`🐌 Slow query "${queryName}": ${duration}ms`);
        }
        return result;
    }).catch((error) => {
        const duration = Date.now() - start;
        console.error(`❌ Query "${queryName}" failed after ${duration}ms:`, error);
        throw error;
    });
}