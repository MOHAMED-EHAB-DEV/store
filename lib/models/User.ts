import mongoose, {Schema, Document, Model} from "mongoose";

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: string;
    createdAt: Date;
<<<<<<< HEAD
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
=======
    purchasedTemplates: String[];
    favorites: String[];
    updatedAt: Date;
    lastLogin?: Date;
    isEmailVerified: boolean;
    loginAttempts: number;
    lockUntil?: Date;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
>>>>>>> refs/remotes/origin/main
        trim: true,
        index: true,
        maxlength: 100
    },
<<<<<<< HEAD
    email: { 
        type: String, 
        required: true, 
=======
    email: {
        type: String,
        required: true,
>>>>>>> refs/remotes/origin/main
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
<<<<<<< HEAD
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
=======
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
>>>>>>> refs/remotes/origin/main
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
<<<<<<< HEAD
    lastLogin: {
        type: Date,
        index: true // For analytics queries
=======
    createdAt: {type: Date, default: Date.now, index: true},
    lastLogin: {
        type: Date,
        index: true,
>>>>>>> refs/remotes/origin/main
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
<<<<<<< HEAD
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
=======
    }
}, {
    timestamps: true,
    strict: true,
    versionKey: false,
    toJSON: {
        transform: function (doc, ret) {
>>>>>>> refs/remotes/origin/main
            delete ret.password;
            delete ret.loginAttempts;
            delete ret.lockUntil;
            return ret;
        }
    },
    minimize: false,
    autoIndex: process.env.NODE_ENV !== 'production',
});

<<<<<<< HEAD
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
=======
// Compound indexes for common query patterns
UserSchema.index({email: 1, role: 1}); // Login + role check - MOST IMPORTANT
UserSchema.index({role: 1, createdAt: -1}); // Admin dashboard queries
UserSchema.index({createdAt: -1, isEmailVerified: 1}); // Recent verified users
UserSchema.index({lastLogin: -1, role: 1}); // Active user analytics
UserSchema.index({isEmailVerified: 1, role: 1}); // Verification status queries
UserSchema.index({lockUntil: 1}, {sparse: true}); // Security - locked accounts
UserSchema.index({purchasedTemplates: 1}); // User purchases lookup
UserSchema.index({favorites: 1}); // User favorites lookup

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
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.statics.findByEmail = function (email: string) {
    return this.findOne({email: email.toLowerCase()})
        .select('_id name email role avatar createdAt lastLogin') // TODO: Add isEmailVerified when its functionality being added
        .lean();
};

UserSchema.statics.findByEmailWithPassword = function (email: string) {
    return this.findOne({email: email.toLowerCase()})
        .select('_id name email password role avatar loginAttempts lockUntil') // TODO: Add isEmailVerified when its functionality being added
        .lean();
};

UserSchema.statics.findActiveUsers = function (limit = 20, skip = 0) {
    return this.find({
        role: {$ne: 'deleted'},
        // isEmailVerified: true TODO: Uncomment when isEmailVerified Functionality added
    })
        .select('name email role avatar createdAt lastLogin')
        .sort({lastLogin: -1, createdAt: -1})
>>>>>>> refs/remotes/origin/main
        .limit(limit)
        .skip(skip)
        .lean();
};

UserSchema.statics.getUserStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: null,
<<<<<<< HEAD
                totalUsers: { $sum: 1 },
                verifiedUsers: {
                    $sum: { $cond: ['$isEmailVerified', 1, 0] }
                },
                adminUsers: {
                    $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
=======
                totalUsers: {$sum: 1},
                verifiedUsers: {
                    $sum: {$cond: ['$isEmailVerified', 1, 0]}
                },
                adminUsers: {
                    $sum: {$cond: [{$eq: ['$role', 'admin']}, 1, 0]}
>>>>>>> refs/remotes/origin/main
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

<<<<<<< HEAD
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
=======
UserSchema.statics.incrementLoginAttempts = function(userId: string) {
    return this.findByIdAndUpdate(
        userId,
        {
            $inc: { loginAttempts: 1 },
            $set: {
>>>>>>> refs/remotes/origin/main
                lockUntil: new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
            }
        },
        { new: true }
    );
};

UserSchema.statics.resetLoginAttempts = function(userId: string) {
    return this.findByIdAndUpdate(
        userId,
<<<<<<< HEAD
        { 
=======
        {
>>>>>>> refs/remotes/origin/main
            $unset: { loginAttempts: 1, lockUntil: 1 },
            $set: { lastLogin: new Date() }
        }
    );
};

<<<<<<< HEAD
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
=======
UserSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.password.startsWith('$2')) {
        return next();
    }

    next();
});

UserSchema.post('init', function() {
    if (process.env.NODE_ENV === 'production') {
>>>>>>> refs/remotes/origin/main
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

<<<<<<< HEAD
export default User;
=======
export default User;
>>>>>>> refs/remotes/origin/main
