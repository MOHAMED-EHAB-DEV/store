import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: string;
    createdAt: Date;
    purchasedTemplates: String[];
    favorites: String[]
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true, index: true }, // Index for search
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true, // Normalize email
        trim: true,
        index: true // Primary lookup field
    },
    password: { type: String, required: true, select: false }, // Don't include in queries by default
    avatar: { type: String, default: "" },
    role: { 
        type: String, 
        enum: ["user", "admin"], 
        default: "user",
        index: true // For role-based queries
    },
    purchasedTemplates: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Template"
    }],
    favorites: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Template"
    }],
    createdAt: { type: Date, default: Date.now, index: true },
}, { 
    timestamps: true, 
    strict: true,
    // Optimization options
    versionKey: false, // Remove __v field
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.password; // Never return password
            return ret;
        }
    }
});

// Compound indexes for common query patterns
UserSchema.index({ email: 1, role: 1 }); // Login + role check
UserSchema.index({ role: 1, createdAt: -1 }); // Admin dashboard queries
UserSchema.index({ createdAt: -1 }); // Recent users

// Pre-save middleware for password hashing (if you're not already doing this)
UserSchema.pre('save', function(next) {
    // Only hash if password is modified and not already hashed
    if (!this.isModified('password') || this.password.startsWith('$2')) {
        return next();
    }
    // Your password hashing logic here
    next();
});

// Static methods for optimized queries
UserSchema.statics.findByEmailOptimized = function(email: string) {
    return this.findOne({ email: email.toLowerCase() })
        .select('name email role avatar createdAt')
        .lean();
};

UserSchema.statics.findActiveUsersOptimized = function(limit = 20, skip = 0) {
    return this.find({ role: { $ne: 'deleted' } })
        .select('name email role avatar createdAt')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

UserSchema.statics.getUserStatsOptimized = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 },
                latestUser: { $max: '$createdAt' }
            }
        }
    ]);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;