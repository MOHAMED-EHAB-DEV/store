import mongoose from "mongoose";

declare global {
  var mongoose: any;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Performance monitoring helper
export function measureQuery<T>(
  queryName: string,
  queryPromise: Promise<T>
): Promise<T> {
  const start = Date.now();
  return queryPromise
    .then((result) => {
      const duration = Date.now() - start;
      if (duration > 100) {
        console.warn(`🐌 Slow query "${queryName}": ${duration}ms`);
      }
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - start;
      console.error(
        `❌ Query "${queryName}" failed after ${duration}ms:`,
        error
      );
      throw error;
    });
}
