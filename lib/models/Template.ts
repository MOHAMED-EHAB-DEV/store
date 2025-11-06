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
    builtWith: "framer" | "figma" | "vite" | "next.js";
    views: number;
    reviewCount: number;
    type: "framer" | "coded" | "figma";
    isPaid: Boolean;
    createdAt: Date;
    updatedAt: Date;
    lastViewedAt: Date;
    fileKey: String;
}

const TemplateSchema = new Schema<ITemplate>(
    {
        title: {
            type: String,
            required: true,
            text: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            text: true,
        },
        content: {
            type: String,
            required: true,
            select: false,
        },
        price: {
            type: Number,
            default: 0,
            min: 0,
            max: 9999.9,
            index: true,
        },
        thumbnail: {
            type: String,
            required: true,
            trim: true,
        },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
                index: true,
            },
        ],
        tags: [
            {
                type: String,
                lowercase: true,
                trim: true,
                index: true,
            },
        ],
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            select: false,
            index: true,
        },
        downloads: {
            type: Number,
            default: 0,
            min: 0,
            index: true,
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
            index: true,
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
            index: true,
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        demoLink: {
            type: String,
            required: true,
            trim: true,
        },
        builtWith: {
            type: String,
            enum: ["vite", "figma", "framer", "next.js"],
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["coded", "framer", "figma"],
            required: true,
            default: "coded",
        },
        isPaid: Boolean,
        lastViewedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        fileKey: {
            type: String,
            required: true,
            trim: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
        minimize: false,
        autoIndex: process.env.NODE_ENV !== "production",
    }
);

TemplateSchema.index({isActive: 1, isFeatured: -1, averageRating: -1}); // Featured templates
TemplateSchema.index({isActive: 1, price: 1, downloads: -1}); // Free/paid popular templates
TemplateSchema.index({isActive: 1, downloads: -1, averageRating: -1}); // Most popular
TemplateSchema.index({isActive: 1, createdAt: -1}); // Recent templates
TemplateSchema.index({isActive: 1, lastViewedAt: -1}); // Trending templates
TemplateSchema.index({author: 1, isActive: 1, createdAt: -1}); // Author's templates
TemplateSchema.index({categories: 1, isActive: 1, averageRating: -1}); // Category templates
TemplateSchema.index({tags: 1, isActive: 1, downloads: -1}); // Tag-based search
TemplateSchema.index({builtWith: 1, isActive: 1, averageRating: -1}); // Built-with filter
TemplateSchema.index({price: 1, isActive: 1, averageRating: -1}); // Price filtering
TemplateSchema.index({views: -1, isActive: 1}); // Most viewed
TemplateSchema.index({reviewCount: -1, isActive: 1}); // Most reviewed

// Text search index for title and description
TemplateSchema.index(
    {
        title: "text",
        description: "text",
        tags: "text",
    },
    {
        weights: {
            title: 10,
            tags: 5,
            description: 1,
        },
        name: "template_search_index",
    }
);

TemplateSchema.virtual("popularityScore").get(function () {
    const now = Date.now();
    const daysSinceCreated =
        (now - this.createdAt?.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceViewed =
        (now - this.lastViewedAt?.getTime()) / (1000 * 60 * 60 * 24);

    // Combine downloads, rating, recency, and views for popularity
    return (
        (this.downloads * 2 +
            this.averageRating * 20 +
            this.views * 0.5 +
            Math.max(0, 30 - daysSinceViewed) * 2 + // Recency boost
            (this.categories.some((category) => category === "6895e37824be395fbc0b72ae") ? 100 : 0)) / // Featured boost
        Math.max(1, daysSinceCreated * 0.1)
    ); // Age penalty
});

TemplateSchema.statics.findPopularTemplates = function (
    limit = 20,
    skip = 0,
    useCache = true
) {
    return this.aggregate([
        {$match: {isActive: true}},
        {
            $addFields: {
                popularityScore: {
                    $add: [
                        {$multiply: ["$downloads", 2]},
                        {$multiply: ["$averageRating", 20]},
                        {$multiply: ["$views", 0.5]},
                        {$cond: ["$isFeatured", 100, 0]},
                    ],
                },
            },
        },
        {$sort: {popularityScore: -1, createdAt: -1}},
        {$skip: skip},
        {$limit: limit},
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [{$project: {name: 1, avatar: 1}}],
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categories",
                pipeline: [{$project: {name: 1, slug: 1}}],
            },
        },
        {$unwind: {path: "$author", preserveNullAndEmptyArrays: true}},
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                demoLink: 1,
                price: 1,
                downloads: 1,
                views: 1,
                averageRating: 1,
                reviewCount: 1,
                author: 1,
                categories: 1,
                tags: 1,
                builtWith: 1,
                isFeatured: 1,
                createdAt: 1,
                popularityScore: 1,
            },
        },
    ]).allowDiskUse(true); // Allow disk usage for large datasets
};

TemplateSchema.statics.findByCategory = function (
    categoryId: string,
    limit = 20,
    skip = 0
) {
    return this.aggregate([
        {
            $match: {
                categories: new mongoose.Types.ObjectId(categoryId),
                isActive: true,
            },
        },
        {$sort: {averageRating: -1, downloads: -1}},
        {$skip: skip},
        {$limit: limit},
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [{$project: {name: 1, avatar: 1}}],
            },
        },
        {$unwind: {path: "$author", preserveNullAndEmptyArrays: true}},
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                price: 1,
                downloads: 1,
                averageRating: 1,
                reviewCount: 1,
                author: 1,
                builtWith: 1,
                createdAt: 1,
            },
        },
    ]);
};

TemplateSchema.statics.searchTemplates = function (
    searchOptions: {
        search?: string;
        categories?: string[];
        tags?: string[];
        builtWith?: string[];
        priceRange?: { min?: number; max?: number };
        minRating?: number;
        sortBy?: "popular" | "recent" | "rating" | "price" | "downloads";
    },
    limit = 20,
    skip = 0
) {
    const {
        search,
        categories = [],
        tags = [],
        builtWith = [],
        priceRange,
        minRating,
        sortBy = "popular",
    } = searchOptions;

    // Build match stage
    const matchStage: any = {isActive: true};

    if (search) {
        const regex = {$regex: search?.trim(), $options: "i"};
        matchStage.$or = [
            {
                title: regex,
            },
        ];
    }

    if (categories.length > 0) {
        matchStage.categories = {
            $in: categories.map((id) => new mongoose.Types.ObjectId(id)),
        };
    }

    if (tags.length > 0) {
        matchStage.tags = {
            $elemMatch: {
                $in: tags.map((tag) => new RegExp(`^${tag}$`, "i")),
            },
        };
    }

    if (builtWith.length > 0) {
        matchStage.builtWith = {$in: builtWith};
    }

    if (priceRange) {
        matchStage.price = {};
        if (priceRange.min !== undefined) matchStage.price.$gte = priceRange.min;
        if (priceRange.max !== undefined) matchStage.price.$lte = priceRange.max;
    }

    if (minRating) {
        matchStage.averageRating = {$gte: minRating};
    }

    // Build sort stage
    let sortStage: any;
    switch (sortBy) {
        case "recent":
            sortStage = {createdAt: -1};
            break;
        case "rating":
            sortStage = {averageRating: -1, reviewCount: -1};
            break;
        case "price":
            sortStage = {price: 1, averageRating: -1};
            break;
        case "downloads":
            sortStage = {downloads: -1, averageRating: -1};
            break;
        default: // popular
            sortStage = search
                ? {averageRating: -1, downloads: -1}
                : {downloads: -1, averageRating: -1};
    }

    const pipeline = [
        {$match: matchStage},
        {$sort: sortStage},
        {$skip: skip},
        {$limit: limit},
        // {
        //   $lookup: {
        //     from: "users",
        //     localField: "author",
        //     foreignField: "_id",
        //     as: "author",
        //     pipeline: [{ $project: { name: 1, avatar: 1 } }],
        //   },
        // },
        {
            $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categories",
                pipeline: [{$project: {name: 1, slug: 1}}],
            },
        },
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "template",
                as: "reviews",
            }
        },
        {
            $addFields: {
                reviews: {$size: "$reviews"}
            }
        },
        {$unwind: {path: "$author", preserveNullAndEmptyArrays: true}},
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                demoLink: 1,
                price: 1,
                downloads: 1,
                views: 1,
                averageRating: 1,
                reviews: 1,
                author: 1,
                categories: 1,
                tags: 1,
                builtWith: 1,
                createdAt: 1,
            },
        },
    ];

    return this.aggregate(pipeline).allowDiskUse(true);
};

TemplateSchema.statics.findFreeTemplates = function (limit = 20, skip = 0) {
    return this.aggregate([
        {$match: {price: 0, isActive: true}},
        {$sort: {downloads: -1, averageRating: -1}},
        {$skip: skip},
        {$limit: limit},
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [{$project: {name: 1, avatar: 1}}],
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "categories",
                foreignField: "_id",
                as: "categories",
                pipeline: [{$project: {name: 1, slug: 1}}],
            },
        },
        {$unwind: {path: "$author", preserveNullAndEmptyArrays: true}},
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                downloads: 1,
                averageRating: 1,
                reviewCount: 1,
                author: 1,
                categories: 1,
                builtWith: 1,
                createdAt: 1,
            },
        },
    ]);
};

TemplateSchema.statics.getTemplateStats = function () {
    return this.aggregate([
        {
            $facet: {
                overview: [
                    {$match: {isActive: true}},
                    {
                        $group: {
                            _id: null,
                            totalTemplates: {$sum: 1},
                            totalDownloads: {$sum: "$downloads"},
                            totalViews: {$sum: "$views"},
                            averagePrice: {$avg: "$price"},
                            averageRating: {$avg: "$averageRating"},
                            freeTemplates: {
                                $sum: {$cond: [{$eq: ["$price", 0]}, 1, 0]},
                            },
                            paidTemplates: {
                                $sum: {$cond: [{$gt: ["$price", 0]}, 1, 0]},
                            },
                        },
                    },
                ],
                byBuiltWith: [
                    {$match: {isActive: true}},
                    {
                        $group: {
                            _id: "$builtWith",
                            count: {$sum: 1},
                            totalDownloads: {$sum: "$downloads"},
                            averageRating: {$avg: "$averageRating"},
                        },
                    },
                ],
                topCategories: [
                    {$match: {isActive: true}},
                    {$unwind: "$categories"},
                    {
                        $group: {
                            _id: "$categories",
                            templateCount: {$sum: 1},
                            totalDownloads: {$sum: "$downloads"},
                        },
                    },
                    {$sort: {templateCount: -1}},
                    {$limit: 10},
                    {
                        $lookup: {
                            from: "categories",
                            localField: "_id",
                            foreignField: "_id",
                            as: "category",
                        },
                    },
                    {$unwind: "$category"},
                    {
                        $project: {
                            name: "$category.name",
                            templateCount: 1,
                            totalDownloads: 1,
                        },
                    },
                ],
            },
        },
    ]);
};

TemplateSchema.statics.getTrendingTemplates = function (days = 7, limit = 20) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.aggregate([
        {$match: {isActive: true, lastViewedAt: {$gte: cutoffDate}}},
        {
            $addFields: {
                trendingScore: {
                    $multiply: [
                        "$views",
                        {
                            $divide: [
                                {$subtract: [Date.now(), "$lastViewedAt"]},
                                days * 24 * 60 * 60 * 1000,
                            ],
                        },
                    ],
                },
            },
        },
        {$sort: {trendingScore: -1, views: -1}},
        {$limit: limit},
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [{$project: {name: 1, avatar: 1}}],
            },
        },
        {$unwind: {path: "$author", preserveNullAndEmptyArrays: true}},
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                price: 1,
                downloads: 1,
                views: 1,
                averageRating: 1,
                author: 1,
                builtWith: 1,
                trendingScore: 1,
            },
        },
    ]);
};

TemplateSchema.methods.incrementViews = function (amount = 1) {
    return this.findByIdAndUpdate(
        this._id,
        {
            $inc: {views: amount},
            $set: {lastViewedAt: new Date()},
        },
        {new: true}
    );
};

// Pre-save middleware for tag normalization
TemplateSchema.pre("save", function (next) {
    if (this.isModified("tags")) {
        // Normalize tags and remove duplicates
        this.tags = [
            ...new Set(this.tags.map((tag: string) => tag.toLowerCase().trim())),
        ];
    }

    if (this.price === 0) {
        this.isPaid = false;
    } else {
        this.isPaid = true;
    }
    next();
});

TemplateSchema.post("init", function () {
    if (process.env.NODE_ENV === "production") {
        // Ensure critical indexes exist
        this.collection.createIndex(
            {isActive: 1, downloads: -1, averageRating: -1},
            {background: true}
        );
    }
});

export interface ITemplateModel extends Model<ITemplate> {
  findPopularTemplates(limit?: number, skip?: number): Promise<ITemplate[]>;
  findByCategory(categoryId: string, limit?: number, skip?: number): Promise<ITemplate[]>;
  searchTemplates(
    searchOptions: {
      search?: string;
      categories?: string[];
      tags?: string[];
      builtWith?: string[];
      priceRange?: { min?: number; max?: number };
      minRating?: number;
      sortBy?: "popular" | "recent" | "rating" | "price" | "downloads";
    },
    limit?: number,
    skip?: number
  ): Promise<ITemplate[]>;
  findFreeTemplates(limit?: number, skip?: number): Promise<ITemplate[]>;
  getTemplateStats(): Promise<any>;
  getTrendingTemplates(days?: number, limit?: number): Promise<ITemplate[]>;
}

const Template =
  (mongoose.models.Template as unknown as ITemplateModel) ||
  mongoose.model<ITemplate, ITemplateModel>("Template", TemplateSchema);

if (process.env.NODE_ENV !== "production") {
    Template.syncIndexes().catch(console.error);
}

export default Template;
