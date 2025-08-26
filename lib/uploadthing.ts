import { UTApi, UTFile } from "uploadthing/server";

// Enhanced UTApi with connection pooling and retry logic
class OptimizedUTApi extends UTApi {
    private static instance: OptimizedUTApi;
    private uploadQueue: Array<() => Promise<any>> = [];
    private isProcessing = false;
    private readonly maxConcurrentUploads = 3;
    private readonly retryAttempts = 3;
    private readonly retryDelay = 1000; // 1 second

    constructor() {
        super();
    }

    static getInstance(): OptimizedUTApi {
        if (!OptimizedUTApi.instance) {
            OptimizedUTApi.instance = new OptimizedUTApi();
        }
        return OptimizedUTApi.instance;
    }

    // Process upload queue to prevent overwhelming the service
    private async processQueue() {
        if (this.isProcessing || this.uploadQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.uploadQueue.length > 0) {
            const batch = this.uploadQueue.splice(0, this.maxConcurrentUploads);
            await Promise.allSettled(batch.map(upload => upload()));
        }
        
        this.isProcessing = false;
    }

    // Retry wrapper for upload operations
    private async withRetry<T>(operation: () => Promise<T>, attempts = this.retryAttempts): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (attempts > 1) {
                console.warn(`Upload failed, retrying... (${this.retryAttempts - attempts + 1}/${this.retryAttempts})`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.withRetry(operation, attempts - 1);
            }
            throw error;
        }
    }

    // Enhanced upload with queue management
    async queueUpload<T>(uploadFn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.uploadQueue.push(async () => {
                try {
                    const result = await this.withRetry(uploadFn);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            
            this.processQueue();
        });
    }
}

// Image compression utility
async function compressImage(file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<File> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate dimensions maintaining aspect ratio
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Compression failed'));
                    }
                },
                file.type,
                quality
            );
        };
        
        img.onerror = () => reject(new Error('Image loading failed'));
        img.src = URL.createObjectURL(file);
    });
}

// File validation utility
interface FileValidationOptions {
    maxSize?: number;
    allowedTypes?: string[];
    maxDimensions?: { width: number; height: number };
}

async function validateFile(file: File, options: FileValidationOptions = {}): Promise<{
    isValid: boolean;
    error?: string;
    metadata?: any;
}> {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxDimensions = { width: 4096, height: 4096 }
    } = options;

    // Check file size
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`
        };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `File type ${file.type} not allowed. Supported: ${allowedTypes.join(', ')}`
        };
    }

    // Check image dimensions (for images)
    if (file.type.startsWith('image/')) {
        try {
            const dimensions = await getImageDimensions(file);
            if (dimensions.width > maxDimensions.width || dimensions.height > maxDimensions.height) {
                return {
                    isValid: false,
                    error: `Image dimensions ${dimensions.width}x${dimensions.height} exceed limit ${maxDimensions.width}x${maxDimensions.height}`
                };
            }

            return {
                isValid: true,
                metadata: {
                    dimensions,
                    aspectRatio: dimensions.width / dimensions.height
                }
            };
        } catch (error) {
            return {
                isValid: false,
                error: 'Invalid image file'
            };
        }
    }

    return { isValid: true };
}

// Helper to get image dimensions
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

// Enhanced upload function with comprehensive optimizations
export interface UploadOptions {
    compress?: boolean;
    compressionQuality?: number;
    maxWidth?: number;
    generateThumbnail?: boolean;
    thumbnailSize?: number;
    metadata?: Record<string, any>;
    onProgress?: (progress: number) => void;
}

export async function uploadThingOptimized(
    file: File, 
    key: "profilePicture" | "templateThumbnail" | "templateFiles",
    options: UploadOptions = {}
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    metadata?: any;
}> {
    const startTime = Date.now();
    const utapi = OptimizedUTApi.getInstance();

    try {
        // Validate file
        const validationOptions = {
            maxSize: key === 'profilePicture' ? 5 * 1024 * 1024 : 50 * 1024 * 1024, // 5MB for profile, 50MB for templates
            allowedTypes: key === 'profilePicture' 
                ? ['image/jpeg', 'image/png', 'image/webp']
                : ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/zip', 'application/x-zip-compressed'],
            maxDimensions: { width: 4096, height: 4096 }
        };

        const validation = await validateFile(file, validationOptions);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error
            };
        }

        // Compress image if requested and if it's an image
        let processedFile = file;
        if (options.compress && file.type.startsWith('image/')) {
            try {
                options.onProgress?.(25);
                processedFile = await compressImage(
                    file, 
                    options.compressionQuality || 0.8,
                    options.maxWidth || 1920
                );
                console.log(`🗜️ Compressed image: ${file.size} → ${processedFile.size} bytes (${Math.round((1 - processedFile.size / file.size) * 100)}% reduction)`);
            } catch (error) {
                console.warn('Image compression failed, using original file:', error);
                processedFile = file;
            }
        }

        options.onProgress?.(50);

        // Convert to UTFile with enhanced metadata
        const arrayBuffer = await processedFile.arrayBuffer();
        const utFile = new UTFile(new Uint8Array(arrayBuffer), processedFile.name, {
            customId: key,
            contentType: processedFile.type,
            // Enhanced metadata
            metadata: {
                originalSize: file.size,
                processedSize: processedFile.size,
                uploadedAt: new Date().toISOString(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
                ...validation.metadata,
                ...options.metadata
            }
        });

        options.onProgress?.(75);

        // Upload with retry logic and queue management
        const uploadResult = await utapi.queueUpload(async () => {
            return await utapi.uploadFiles(utFile);
        });

        options.onProgress?.(100);

        const duration = Date.now() - startTime;
        
        // Log performance metrics
        console.log(`✅ Upload completed: ${processedFile.name} (${processedFile.size} bytes) in ${duration}ms`);

        // Generate thumbnail if requested
        let thumbnailUrl;
        if (options.generateThumbnail && file.type.startsWith('image/') && uploadResult.data?.url) {
            try {
                // Use UploadThing's built-in image transformations
                const baseUrl = uploadResult.data.url;
                const thumbnailSize = options.thumbnailSize || 200;
                thumbnailUrl = `${baseUrl}?w=${thumbnailSize}&h=${thumbnailSize}&fit=cover&auto=format`;
            } catch (error) {
                console.warn('Thumbnail generation failed:', error);
            }
        }

        return {
            success: true,
            data: {
                ...uploadResult.data,
                thumbnailUrl,
                metadata: {
                    originalSize: file.size,
                    processedSize: processedFile.size,
                    uploadDuration: duration,
                    compressionRatio: file.size > 0 ? (1 - processedFile.size / file.size) : 0
                }
            }
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ Upload failed after ${duration}ms:`, error);
        
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
            metadata: {
                uploadDuration: duration
            }
        };
    }
}

// Batch upload utility for multiple files
export async function batchUploadOptimized(
    files: File[],
    key: "profilePicture" | "templateThumbnail" | "templateFiles",
    options: UploadOptions & { 
        maxConcurrency?: number;
        onFileProgress?: (fileIndex: number, progress: number) => void;
        onOverallProgress?: (completed: number, total: number) => void;
    } = {}
): Promise<{
    success: boolean;
    results: Array<{ success: boolean; data?: any; error?: string; fileName: string }>;
    summary: {
        successful: number;
        failed: number;
        totalSize: number;
        totalDuration: number;
    };
}> {
    const startTime = Date.now();
    const { maxConcurrency = 3 } = options;
    const results: Array<{ success: boolean; data?: any; error?: string; fileName: string }> = [];
    
    let completed = 0;
    let totalSize = 0;

    // Process files in batches
    for (let i = 0; i < files.length; i += maxConcurrency) {
        const batch = files.slice(i, i + maxConcurrency);
        
        const batchPromises = batch.map(async (file, batchIndex) => {
            const fileIndex = i + batchIndex;
            
            const result = await uploadThingOptimized(file, key, {
                ...options,
                onProgress: (progress) => {
                    options.onFileProgress?.(fileIndex, progress);
                }
            });

            totalSize += file.size;
            completed++;
            options.onOverallProgress?.(completed, files.length);

            return {
                ...result,
                fileName: file.name
            };
        });

        const batchResults = await Promise.allSettled(batchPromises);
        
        for (const result of batchResults) {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                results.push({
                    success: false,
                    error: result.reason?.message || 'Unknown error',
                    fileName: 'unknown'
                });
            }
        }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalDuration = Date.now() - startTime;

    console.log(`📊 Batch upload completed: ${successful}/${files.length} successful, ${totalSize} bytes, ${totalDuration}ms`);

    return {
        success: failed === 0,
        results,
        summary: {
            successful,
            failed,
            totalSize,
            totalDuration
        }
    };
}

// Cleanup utility for orphaned files
export async function cleanupOrphanedFiles(fileUrls: string[]): Promise<{
    deleted: number;
    failed: number;
    errors: string[];
}> {
    const utapi = OptimizedUTApi.getInstance();
    const errors: string[] = [];
    let deleted = 0;
    let failed = 0;

    for (const url of fileUrls) {
        try {
            // Extract file key from URL
            const fileKey = url.split('/').pop();
            if (fileKey) {
                await utapi.deleteFiles(fileKey);
                deleted++;
            }
        } catch (error) {
            failed++;
            errors.push(`Failed to delete ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return { deleted, failed, errors };
}

// Export the optimized UTApi instance
export const utapi = OptimizedUTApi.getInstance();

// Export default upload function for backwards compatibility
export { uploadThingOptimized as uploadThing };

// Legacy function for backwards compatibility
export async function uploadThing(file: File, key: "profilePicture") {
    // Convert the browser File into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Wrap it in UTFile (needs a Uint8Array, filename, and metadata)
    const utFile = new UTFile(new Uint8Array(arrayBuffer), file.name, {
        customId: key,
    });

    // Upload with UTApi
    const res = await utapi.uploadFiles(utFile);

    return res;
}
