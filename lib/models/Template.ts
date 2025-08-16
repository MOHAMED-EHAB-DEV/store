import mongoose, {Document, Model, Schema, ObjectId} from "mongoose";
import "./Category";
import "./User";

export interface ITemplate extends Document {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    demoLink: string;
    price: number;
    content: string;
    categories: string[];
    tags: string[];
    author: ObjectId;
    downloads: number;
    averageRating: number;
    isActive: boolean; // Add for soft delete
    builtWith: "framer" | "figma" | "coded";
}

const TemplateSchema = new Schema<ITemplate>({
    title: { 
        type: String, 
        required: true,
        text: true, // Text search index
        index: true
    },
    description: { 
        type: String, 
        required: true,
        text: true // Text search index
    },
    content: { 
        type: String, 
        required: true,
        select: false // Don't include by default (large field)
    },
    price: { 
        type: Number, 
        default: 0,
        min: 0,
        index: true // For price range queries
    },
    thumbnail: { type: String, required: true },
    categories: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category",
        index: true // For category filtering
    }],
    tags: [{ 
        type: String,
        lowercase: true,
        trim: true
    }],
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true,
        index: true // For author queries
    },
    downloads: { 
        type: Number, 
        default: 0,
        min: 0,
        index: true // For popular template
    },
    averageRating: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5,
        index: true // For rating-based sorting
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true // For filtering active template
    },
    demoLink: {
        type: String,
        required: true,
    },
    builtWith: {
        type: String,
        default: "coded",
        enum: ["coded", "figma", "framer"],
        required: true,
        index: true,
    }
}, { 
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound indexes for common query patterns
TemplateSchema.index({ isActive: 1, price: 1, averageRating: -1 }); // Active paid template by rating
TemplateSchema.index({ isActive: 1, downloads: -1, createdAt: -1 }); // Popular template
TemplateSchema.index({ author: 1, isActive: 1, createdAt: -1 }); // Author's template
TemplateSchema.index({ categories: 1, isActive: 1, averageRating: -1 }); // Category template by rating
TemplateSchema.index({ tags: 1, isActive: 1 }); // Tag-based search
TemplateSchema.index({ price: 1, isActive: 1 }); // Price filtering
TemplateSchema.index({ createdAt: -1, isActive: 1 }); // Recent template

// Text search index for title and description
TemplateSchema.index({ 
    title: 'text', 
    description: 'text',
    tags: 'text'
}, {
    weights: {
        title: 10,
        description: 5,
        tags: 1
    }
});

// Virtual for review count (if needed)
TemplateSchema.virtual('reviewCount', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'template',
    count: true
});

// Static methods for optimized queries
TemplateSchema.statics.findPopularTemplates = function(limit = 20, skip = 0) {
    return this.find({ isActive: true })
        .select('title description thumbnail demoLink price downloads averageRating author tags builtWith categories')
        .populate('author', 'name avatar')
        .populate('categories', 'name slug')
        .sort({ downloads: -1, averageRating: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

TemplateSchema.statics.findByCategory = function(categoryId: string, limit = 20, skip = 0) {
    return this.find({ 
        categories: categoryId, 
        isActive: true 
    })
        .select('title description thumbnail price downloads averageRating author')
        .populate('author', 'name avatar')
        .sort({ averageRating: -1, downloads: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

TemplateSchema.statics.searchTemplates = function (
    query,
    limit = 20,
    skip = 0
) {
    return this.find(query, query.search ? { score: { $meta: "textScore" } } : {})
        .select("title description thumbnail price downloads averageRating builtWith author categories")
        .populate("author", "name avatar")
        .populate("categories", "name slug")
        .sort(search ? { score: { $meta: "textScore" }, averageRating: -1 } : { averageRating: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

TemplateSchema.statics.findFreeTemplates = function(limit = 20, skip = 0) {
    return this.find({ 
        price: 0, 
        isActive: true 
    })
        .select('title description thumbnail downloads averageRating builtWith author categories')
        .populate('author', 'name avatar')
        .populate('categories', 'name slug')
        .sort({ downloads: -1, averageRating: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

TemplateSchema.statics.getTemplateStats = function() {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: null,
                totalTemplates: { $sum: 1 },
                totalDownloads: { $sum: '$downloads' },
                averagePrice: { $avg: '$price' },
                averageRating: { $avg: '$averageRating' }
            }
        }
    ]);
};

// Pre-save middleware for tag normalization
TemplateSchema.pre('save', function(next) {
    if (this.isModified('tags')) {
        this.tags = this.tags.map((tag: string) => tag.toLowerCase().trim());
    }
    next();
});

const Template: Model<ITemplate> = mongoose.models.Template || mongoose.model<ITemplate>("Template", TemplateSchema);

export default Template;