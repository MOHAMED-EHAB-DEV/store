import mongoose, { Schema, Document, Model } from "mongoose";
import "./Template";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: string;
    createdAt: Date;
    purchasedTemplates: string[];
    favorites: string[];
    updatedAt: Date;
    lastLogin?: Date;
    isEmailVerified: boolean;
    loginAttempts: number;
    lockUntil?: Date;
    tier: "starter" | "pro" | "lifetime";
    banned: boolean;
    banId: string;
    banMetadata?: {
        reason: string;
        bannedAt: Date;
        bannedBy: string;
        notes?: string;
        expiresAt?: Date;
    };
    online: boolean;
    lastSeen: Date;
    preferences: {
        emailNotifications: boolean;
        marketingEmails: boolean;
        weeklyDigest: boolean;
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
        default: "starter",
        index: true,
        lowercase: true,
        enum: ["starter", "pro", "lifetime"],
    },
    banned: {
        type: Boolean,
        default: false
    },
    banId: {
        type: String,
        unique: true,
        sparse: true,
    },
    banMetadata: {
        reason: {
            type: String
        },
        bannedAt: {
            type: Date
        },
        bannedBy: {
            type: String // Admin user ID
        },
        notes: {
            type: String
        },
        expiresAt: {
            type: Date // For temporary bans
        }
    },
    online: {
        type: Boolean,
        default: false,
        index: true
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true,
        },
        marketingEmails: {
            type: Boolean,
            default: false,
        },
        weeklyDigest: {
            type: Boolean,
            default: true,
        },
    },
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
UserSchema.index({ lastSeen: 1, online: 1 }); // User activity tracking

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



UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.password.startsWith('$2')) {
        return next();
    }

    next();
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
    cleanupExpiredLocks(): Promise<any>;
}

const User =
    (mongoose.models.User as unknown as IUserModel) ||
    mongoose.model<IUser, IUserModel>("User", UserSchema);

// Create indexes if they don't exist (development only)
// if (process.env.NODE_ENV !== 'production') {
//     User.syncIndexes().catch(console.error);
// }

export default User;