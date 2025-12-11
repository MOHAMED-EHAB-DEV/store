import mongoose, { Schema, Document, Model } from "mongoose";
import "./Template";

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: string;
    createdAt: Date;
    purchasedTemplates: String[];
    favorites: String[];
    updatedAt: Date;
    lastLogin?: Date;
    isEmailVerified: boolean;
    loginAttempts: number;
    lockUntil?: Date;
    tier: "free" | "premium";
    banned: boolean;
    banId: string;
    banMetadata?: {
        reason: string;
        bannedAt: Date;
        bannedBy: string; // Admin user ID
        notes?: string;
        expiresAt?: Date; // For temporary bans
    };
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
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 6
    },
    avatar: {
        type: String,
        default: "",
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
        index: true,
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
    },
    tier: {
        type: String,
        default: "free",
        index: true,
        lowercase: true,
        enum: ["free", "premium"],
    },
    banned: {
        type: Boolean,
        default: false
    },
    banId: {
        type: String,
        default: "",
        unique: true,
        sparse: true // Only enforce uniqueness when banId exists
    },
    banMetadata: {
        reason: {
            type: String,
            default: ""
        },
        bannedAt: {
            type: Date
        },
        bannedBy: {
            type: String, // Admin user ID
            default: ""
        },
        notes: {
            type: String,
            default: ""
        },
        expiresAt: {
            type: Date // For temporary bans
        }
    }
}, {
    timestamps: true,
    strict: true,
    versionKey: false,
    toJSON: {
        transform: function (doc, ret) {
            delete (ret as Partial<IUser>).password;
            delete (ret as Partial<IUser>).loginAttempts;
            delete (ret as Partial<IUser>).lockUntil;
            return ret;
        }
    },
    minimize: false,
    autoIndex: process.env.NODE_ENV !== 'production',
});

// Compound indexes for common query patterns
UserSchema.index({ email: 1, role: 1 }); // Login + role check - MOST IMPORTANT
UserSchema.index({ role: 1, createdAt: -1 }); // Admin dashboard queries
UserSchema.index({ createdAt: -1, isEmailVerified: 1 }); // Recent verified users
UserSchema.index({ lastLogin: -1, role: 1 }); // Active user analytics
UserSchema.index({ isEmailVerified: 1, role: 1 }); // Verification status queries
UserSchema.index({ lockUntil: 1 }, { sparse: true }); // Security - locked accounts
UserSchema.index({ purchasedTemplates: 1 }); // User purchases lookup
UserSchema.index({ favorites: 1 }); // User favorites lookup

// Pre-save middleware for password hashing (if you're not already doing this)
UserSchema.pre('save', function (next) {
    // Only hash if password is modified and not already hashed
    if (!this.isModified('password') || this.password.startsWith('$2')) {
        return next();
    }
    // Your password hashing logic here
    next();
});

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

UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
});

UserSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase() })
        .select('_id name email role avatar createdAt lastLogin') // TODO: Add isEmailVerified when its functionality being added
        .lean();
};

UserSchema.statics.findByEmailWithPassword = function (email: string) {
    return this.findOne({ email: email.toLowerCase() })
        .select('_id name email password role avatar loginAttempts lockUntil') // TODO: Add isEmailVerified when its functionality being added
        .lean();
};

UserSchema.statics.findActiveUsers = function (limit = 20, skip = 0) {
    return this.find({
        role: { $ne: 'deleted' },
        // isEmailVerified: true TODO: Uncomment when isEmailVerified Functionality added
    })
        .select('name email role avatar createdAt lastLogin')
        .sort({ lastLogin: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

UserSchema.statics.getUserStats = function () {
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

UserSchema.statics.findUsersWithPurchases = function (limit = 20, skip = 0) {
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

UserSchema.statics.incrementLoginAttempts = function (userId: string) {
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

UserSchema.statics.resetLoginAttempts = function (userId: string) {
    return this.findByIdAndUpdate(
        userId,
        {
            $unset: { loginAttempts: 1, lockUntil: 1 },
            $set: { lastLogin: new Date() }
        }
    );
};

UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.password.startsWith('$2')) {
        return next();
    }

    next();
});

UserSchema.post('init', function () {
    if (process.env.NODE_ENV === 'production') {
        this.collection.createIndex({ email: 1, role: 1 }, { background: true });
        this.collection.createIndex({ role: 1, createdAt: -1 }, { background: true });
    }
});

// Cleanup expired locks regularly
UserSchema.statics.cleanupExpiredLocks = function () {
    return this.updateMany(
        { lockUntil: { $lte: new Date() } },
        { $unset: { lockUntil: 1, loginAttempts: 1 } }
    );
};

export interface IUserModel extends Model<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
    findByEmailWithPassword(email: string): Promise<IUser | null>;
    findActiveUsers(limit?: number, skip?: number): Promise<IUser[]>;
    getUserStats(): Promise<any[]>; // you can define a more specific shape later
    findUsersWithPurchases(limit?: number, skip?: number): Promise<IUser[]>;
    incrementLoginAttempts(userId: string): Promise<IUser | null>;
    resetLoginAttempts(userId: string): Promise<IUser | null>;
    cleanupExpiredLocks(): Promise<any>;
}

const User =
    (mongoose.models.User as unknown as IUserModel) ||
    mongoose.model<IUser, IUserModel>("User", UserSchema);

// Create indexes if they don't exist (development only)
if (process.env.NODE_ENV !== 'production') {
    User.syncIndexes().catch(console.error);
}

export default User;