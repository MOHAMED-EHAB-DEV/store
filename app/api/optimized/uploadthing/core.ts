import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { authenticateUser } from "@/middleware/auth";
import { connectToDatabase } from "@/lib/database-optimized";
import User from "@/lib/models/optimized/User";

const f = createUploadthing({
    // Enhanced error handling and logging
    errorFormatter: (err) => {
        console.error('UploadThing error:', err);
        return {
            message: err.message,
            code: err.code,
            data: err.data,
        };
    },
});

// Enhanced file validation and security
const validateImageFile = {
    image: {
        maxFileSize: "4MB",
        maxFileCount: 1,
        contentDisposition: "inline",
        // Additional security headers
        additionalProperties: {
            'x-content-type-options': 'nosniff',
            'x-frame-options': 'DENY'
        }
    }
} as const;

const validateTemplateFiles = {
    image: {
        maxFileSize: "10MB",
        maxFileCount: 5,
        contentDisposition: "inline"
    },
    blob: {
        maxFileSize: "50MB",
        maxFileCount: 10,
        contentDisposition: "attachment"
    }
} as const;

// Advanced middleware with performance monitoring and security
async function enhancedAuthMiddleware(req: Request) {
    const startTime = Date.now();
    
    try {
        // Rate limiting check
        const clientIP = req.headers.get('x-forwarded-for') || 
                        req.headers.get('x-real-ip') || 'unknown';
        
        // Basic rate limiting for uploads (can be enhanced with Redis)
        // For now, we'll rely on UploadThing's built-in rate limiting
        
        // Authenticate user
        const user = await authenticateUser();
        if (!user) {
            throw new UploadThingError({
                code: "UNAUTHORIZED",
                message: "Authentication required"
            });
        }

        // Connect to database and verify user exists
        await connectToDatabase();
        const dbUser = await User.findById(user._id, {
            select: '_id role isEmailVerified',
            lean: true
        });

        if (!dbUser) {
            throw new UploadThingError({
                code: "UNAUTHORIZED", 
                message: "User not found"
            });
        }

        // Check if email is verified
        if (!dbUser.isEmailVerified) {
            throw new UploadThingError({
                code: "FORBIDDEN",
                message: "Email verification required"
            });
        }

        const duration = Date.now() - startTime;
        
        // Log slow authentication
        if (duration > 500) {
            console.warn(`🐌 Slow upload auth: ${duration}ms for user ${user._id}`);
        }

        return {
            userId: user._id,
            userRole: dbUser.role,
            authDuration: duration
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ Upload auth failed after ${duration}ms:`, error);
        
        if (error instanceof UploadThingError) {
            throw error;
        }
        
        throw new UploadThingError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Authentication failed"
        });
    }
}

// Enhanced completion handler with database updates and analytics
async function handleUploadComplete(
    metadata: { userId: string; userRole: string; authDuration: number },
    file: { key: string; name: string; size: number; url: string }
) {
    const startTime = Date.now();
    
    try {
        console.log(`📁 Upload completed:`, {
            userId: metadata.userId,
            fileName: file.name,
            fileSize: file.size,
            uploadKey: file.key
        });

        // Update user's last activity (optional analytics)
        await User.findByIdAndUpdate(
            metadata.userId,
            { 
                lastActivity: new Date(),
                // Optional: Track upload statistics
                $inc: { 
                    'stats.uploadsCount': 1,
                    'stats.totalUploadSize': file.size
                }
            },
            { upsert: false }
        );

        const duration = Date.now() - startTime;
        
        return {
            uploadedBy: metadata.userId,
            fileKey: file.key,
            processingDuration: duration,
            authDuration: metadata.authDuration,
            uploadSize: file.size
        };

    } catch (error) {
        console.error('Upload completion handler error:', error);
        // Don't throw here - upload already succeeded
        return {
            uploadedBy: metadata.userId,
            fileKey: file.key,
            error: 'Completion handler failed'
        };
    }
}

// File Router with optimized configurations
export const ourFileRouter = {
    // Profile picture upload with enhanced validation
    profilePicture: f(validateImageFile)
        .middleware(enhancedAuthMiddleware)
        .onUploadComplete(async ({ metadata, file }) => {
            return await handleUploadComplete(metadata, file);
        }),

    // Template thumbnail upload
    templateThumbnail: f(validateImageFile)
        .middleware(async ({ req }) => {
            const auth = await enhancedAuthMiddleware(req);
            
            // Additional check for admin/template creator permissions
            if (auth.userRole !== 'admin') {
                // Here you could add additional logic to check if user can upload template thumbnails
                // For example, check if they have a premium subscription or are verified creators
            }
            
            return auth;
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // Additional processing for template thumbnails
            console.log(`🖼️ Template thumbnail uploaded: ${file.name}`);
            return await handleUploadComplete(metadata, file);
        }),

    // Template files upload (for complete template packages)
    templateFiles: f(validateTemplateFiles)
        .middleware(async ({ req }) => {
            const auth = await enhancedAuthMiddleware(req);
            
            // Restrict template file uploads to admins only
            if (auth.userRole !== 'admin') {
                throw new UploadThingError({
                    code: "FORBIDDEN",
                    message: "Admin access required for template file uploads"
                });
            }
            
            return auth;
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log(`📦 Template file uploaded: ${file.name} (${file.size} bytes)`);
            
            // Here you could trigger additional processing:
            // - Extract zip files
            // - Generate preview images
            // - Scan for security issues
            // - Update template status
            
            return await handleUploadComplete(metadata, file);
        }),

    // Document uploads (for user documentation, etc.)
    documents: f({
        pdf: { maxFileSize: "16MB", maxFileCount: 1 },
        text: { maxFileSize: "1MB", maxFileCount: 3 }
    })
        .middleware(enhancedAuthMiddleware)
        .onUploadComplete(async ({ metadata, file }) => {
            console.log(`📄 Document uploaded: ${file.name}`);
            return await handleUploadComplete(metadata, file);
        }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Export additional utilities for monitoring
export { enhancedAuthMiddleware, handleUploadComplete };
