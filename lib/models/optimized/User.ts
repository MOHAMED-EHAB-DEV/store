import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date; // Add for analytics
    purchasedTemplates: string[];
    favorites: string[];
    isEmailVerified: boolean; // Add for security
    loginAttempts: number; // Add for security
    lockUntil?: Date; // Add for security
}

const UserSchema = new Schema<IUser>({
    name: { 
        type: String, 
        required: true, 
        trim: true,
        index: true,
        maxlength: 100
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: { 
        type: String, 
        required: true, 
        select: false,
        minlength: 6
    },
    avatar: { 
        type: String, 
        default: "user",
        trim: true
    },
    role: { 
        type: String, 
        enum: ["user", "admin"], 
        default: "user",
        index: true
    },
    purchasedTemplates: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Template"
    }],
    favorites: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Template"
    }],
    lastLogin: {
        type: Date,
        index: true // For analytics queries
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        sparse: true,
        index: true
    }
}, { 
    timestamps: true, 
    strict: true,
    versionKey: false,
    // Optimize document size
    minimize: false,
    // Auto-index in development only
    autoIndex: process.env.NODE_ENV !== 'production',
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.loginAttempts;
            delete ret.lockUntil;
            return ret;
        }
    }
});

// CRITICAL: Compound indexes for optimal query performance
UserSchema.index({ email: 1, role: 1 }); // Login + role check - MOST IMPORTANT
UserSchema.index({ role: 1, createdAt: -1 }); // Admin dashboard queries
UserSchema.index({ createdAt: -1, isEmailVerified: 1 }); // Recent verified users
UserSchema.index({ lastLogin: -1, role: 1 }); // Active user analytics
UserSchema.index({ isEmailVerified: 1, role: 1 }); // Verification status queries
UserSchema.index({ lockUntil: 1 }, { sparse: true }); // Security - locked accounts
UserSchema.index({ purchasedTemplates: 1 }); // User purchases lookup
UserSchema.index({ favorites: 1 }); // User favorites lookup

// Text search index for admin user search
UserSchema.index({ 
    name: 'text', 
    email: 'text' 
}, {
    weights: {
        email: 10,
        name: 5
    },
    name: 'user_search_index'
});

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// OPTIMIZED Static methods with lean queries and projections
UserSchema.statics.findByEmailOptimized = function(email: string) {
    return this.findOne({ email: email.toLowerCase() })
        .select('_id name email role avatar createdAt lastLogin isEmailVerified')
        .lean();
};

UserSchema.statics.findByEmailWithPassword = function(email: string) {
    return this.findOne({ email: email.toLowerCase() })
        .select('_id name email password role avatar loginAttempts lockUntil isEmailVerified')
        .lean();
};

UserSchema.statics.findActiveUsersOptimized = function(limit = 20, skip = 0) {
    return this.find({ 
        role: { $ne: 'deleted' },
        isEmailVerified: true
    })
        .select('name email role avatar createdAt lastLogin')
        .sort({ lastLogin: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

UserSchema.statics.getUserStatsOptimized = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                verifiedUsers: {
                    $sum: { $cond: ['$isEmailVerified', 1, 0] }
                },
                adminUsers: {
                    $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                },
                activeLastMonth: {
                    $sum: {
                        $cond: [
                            {
                                $gte: [
                                    '$lastLogin',
                                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                recentSignups: {
                    $sum: {
                        $cond: [
                            {
                                $gte: [
                                    '$createdAt',
                                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);
};

UserSchema.statics.findUsersWithPurchases = function(limit = 20, skip = 0) {
    return this.find({
        purchasedTemplates: { $exists: true, $not: { $size: 0 } }
    })
        .select('name email role avatar purchasedTemplates createdAt')
        .populate('purchasedTemplates', 'title price')
        .sort({ 'purchasedTemplates.length': -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

UserSchema.statics.searchUsers = function(searchTerm: string, limit = 20, skip = 0) {
    const query = searchTerm ? {
        $text: { $search: searchTerm }
    } : {};

    return this.find(query)
        .select('name email role avatar createdAt')
        .sort(searchTerm ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

// Optimized batch operations
UserSchema.statics.findByIds = function(userIds: string[]) {
    return this.find({ _id: { $in: userIds } })
        .select('_id name email role avatar')
        .lean();
};

UserSchema.statics.incrementLoginAttempts = function(userId: string) {
    return this.findByIdAndUpdate(
        userId,
        { 
            $inc: { loginAttempts: 1 },
            $set: { 
                lockUntil: new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
            }
        },
        { new: true }
    );
};

UserSchema.statics.resetLoginAttempts = function(userId: string) {
    return this.findByIdAndUpdate(
        userId,
        { 
            $unset: { loginAttempts: 1, lockUntil: 1 },
            $set: { lastLogin: new Date() }
        }
    );
};

// Pre-save middleware optimizations
UserSchema.pre('save', function(next) {
    // Only hash password if modified and not already hashed
    if (!this.isModified('password') || this.password.startsWith('$2')) {
        return next();
    }
    
    // Password hashing would be done here in production
    next();
});

// Index management in production
UserSchema.post('init', function() {
    if (process.env.NODE_ENV === 'production') {
        // Ensure critical indexes exist in production
        this.collection.createIndex({ email: 1, role: 1 }, { background: true });
        this.collection.createIndex({ role: 1, createdAt: -1 }, { background: true });
    }
});

// Cleanup expired locks regularly
UserSchema.statics.cleanupExpiredLocks = function() {
    return this.updateMany(
        { lockUntil: { $lte: new Date() } },
        { $unset: { lockUntil: 1, loginAttempts: 1 } }
    );
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

// Create indexes if they don't exist (development only)
if (process.env.NODE_ENV !== 'production') {
    User.syncIndexes().catch(console.error);
}

export default User;
