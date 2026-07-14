import mongoose, { Document, Model, Schema, ObjectId } from "mongoose";
import "./Category";
import "./User";

export interface ITemplate extends Document {
  slug: string;
  title: string;
  demoVideo?: string;
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
  views: number;
  reviewCount: number;
  type: "framer" | "coded" | "figma";
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt: Date;
  fileKey: string;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    type: {
      type: String,
      enum: ["coded", "framer", "figma"],
      required: true,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    fileKey: {
      type: String,
      required: true,
      trim: true,
    },
    demoVideo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    minimize: false,
    autoIndex: process.env.NODE_ENV !== "production",
  },
);

TemplateSchema.index({ isActive: 1, averageRating: -1 }); // Featured templates
TemplateSchema.index({ isActive: 1, price: 1, downloads: -1 }); // Free/paid popular templates
TemplateSchema.index({ isActive: 1, downloads: -1, averageRating: -1 }); // Most popular
TemplateSchema.index({ isActive: 1, createdAt: -1 }); // Recent templates
TemplateSchema.index({ isActive: 1, lastViewedAt: -1 }); // Trending templates
TemplateSchema.index({ author: 1, isActive: 1, createdAt: -1 }); // Author's templates
TemplateSchema.index({ categories: 1, isActive: 1, averageRating: -1 }); // Category templates
TemplateSchema.index({ tags: 1, isActive: 1, downloads: -1 }); // Tag-based search
TemplateSchema.index({ price: 1, isActive: 1, averageRating: -1 }); // Price filtering
TemplateSchema.index({ views: -1, isActive: 1 }); // Most viewed
TemplateSchema.index({ reviewCount: -1, isActive: 1 }); // Most reviewed

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
  },
);

TemplateSchema.statics.searchTemplates = function (
  searchOptions: {
    search?: string;
    categories?: string[];
    tags?: string[];
    priceRange?: { min?: number; max?: number };
    minRating?: number;
    sortBy?: "popular" | "recent" | "rating" | "price" | "downloads";
    type?: "framer" | "figma" | "coded";
    includedFields?: string[];
  },
  limit = 20,
  skip = 0,
) {
  const {
    search,
    categories = [],
    tags = [],
    priceRange,
    minRating,
    sortBy = "popular",
    type,
    includedFields,
  } = searchOptions;

  // Build match stage
  const matchStage: any = { isActive: true };

  const searchTerms = search ? search.trim().split(/\s+/) : [];

  if (search) {
    matchStage.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      ...searchTerms.map((term) => ({
        title: { $regex: term, $options: "i" },
      })),
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

  if (type) matchStage.type = type;

  if (priceRange) {
    matchStage.price = {};
    if (priceRange.min !== undefined) matchStage.price.$gte = priceRange.min;
    if (priceRange.max !== undefined) matchStage.price.$lte = priceRange.max;
  }

  if (minRating) {
    matchStage.averageRating = { $gte: minRating };
  }

  // Build sort stage
  let sortStage: any;
  switch (sortBy) {
    case "recent":
      sortStage = { createdAt: -1 };
      break;
    case "rating":
      sortStage = { averageRating: -1, reviewCount: -1 };
      break;
    case "price":
      sortStage = { price: 1, averageRating: -1 };
      break;
    case "downloads":
      sortStage = { downloads: -1, averageRating: -1 };
      break;
    default: // popular
      sortStage =
        search || tags.length > 0
          ? { searchScore: -1, averageRating: -1, downloads: -1 }
          : { downloads: -1, averageRating: -1 };
  }

  const scoreStage = {
    $addFields: {
      searchScore: {
        $add: [
          0,
          ...(search
            ? [
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: { $ifNull: ["$title", ""] },
                        regex: search.trim(),
                        options: "i",
                      },
                    },
                    10,
                    0,
                  ],
                },
              ]
            : []),
          ...(searchTerms.length > 0
            ? searchTerms.map((term) => ({
                $cond: [
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$title", ""] },
                      regex: term,
                      options: "i",
                    },
                  },
                  5,
                  0,
                ],
              }))
            : []),
          ...(tags.length > 0
            ? [
                {
                  $size: {
                    $setIntersection: [
                      {
                        $map: {
                          input: { $ifNull: ["$tags", []] },
                          as: "t",
                          in: { $toLower: "$$t" },
                        },
                      },
                      tags.map((t) => t.toLowerCase()),
                    ],
                  },
                },
              ]
            : []),
        ],
      },
    },
  };

  const pipeline = [
    { $match: matchStage },
    scoreStage,
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit },
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
        pipeline: [{ $project: { name: 1, slug: 1 } }],
      },
    },
    { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1,
        slug: 1,
        description: 1,
        thumbnail: 1,
        demoLink: 1,
        demoVideo: 1,
        price: 1,
        downloads: 1,
        views: 1,
        averageRating: 1,
        reviewCount: 1,
        author: 1,
        categories: 1,
        tags: 1,
        createdAt: 1,
        ...(includedFields?.length &&
          includedFields.reduce(
            (acc, field) => {
              acc[field] = 1;
              return acc;
            },
            {} as Record<string, number>,
          )),
      },
    },
  ];

  return this.aggregate(pipeline).allowDiskUse(true);
};



// Pre-save middleware for tag normalization
TemplateSchema.pre("save", function (next) {
  if (this.isModified("tags")) {
    // Normalize tags and remove duplicates
    this.tags = [
      ...new Set(this.tags.map((tag: string) => tag.toLowerCase().trim())),
    ];
  }
  next();
});

export interface ITemplateModel extends Model<ITemplate> {
  searchTemplates(
    searchOptions: {
      search?: string;
      categories?: string[];
      tags?: string[];
      priceRange?: { min?: number; max?: number };
      minRating?: number;
      sortBy?: "popular" | "recent" | "rating" | "price" | "downloads";
      type?: "framer" | "figma" | "coded";
      includedFields?: string[];
    },
    limit?: number,
    skip?: number,
  ): Promise<ITemplate[]>;
}

const Template =
  (mongoose.models.Template as unknown as ITemplateModel) ||
  mongoose.model<ITemplate, ITemplateModel>("Template", TemplateSchema);

// if (process.env.NODE_ENV !== "production") {
//   Template.syncIndexes().catch(console.error);
// }

export default Template;
