import mongoose, { Document, Model, Schema } from "mongoose";

// 1️⃣ Define the document interface
export interface ICategory extends Document {
  _id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  templateCount: number;
  sortOrder: number;
  parentCategory?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateTemplateCount(): Promise<void>;
  softDelete(): Promise<void>;
  restore(): Promise<void>;
}

// 2️⃣ Define the static model interface
export interface ICategoryModel extends Model<ICategory> {
  findActiveCategories(): Promise<ICategory[]>;
  findCategoriesWithTemplateCount(): Promise<any[]>;
  findCategoryBySlug(slug: string): Promise<ICategory | null>;
  findMainCategories(): Promise<ICategory[]>;
  findSubcategories(parentId: string): Promise<ICategory[]>;
  getCategoryHierarchy(): Promise<any[]>;
  refreshAllTemplateCounts(): Promise<void>;
}

// 3️⃣ Schema definition
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: { type: String, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    templateCount: { type: Number, default: 0, min: 0 },
    sortOrder: { type: Number, default: 0, index: true },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// 4️⃣ Indexes
CategorySchema.index({ isActive: 1, sortOrder: 1 });
CategorySchema.index({ parentCategory: 1, isActive: 1, sortOrder: 1 });
CategorySchema.index({ templateCount: -1, isActive: 1 });

// 5️⃣ Virtual population
CategorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

// 6️⃣ Static methods
CategorySchema.statics.findActiveCategories = function () {
  return this.find({ isActive: true })
    .select("name slug description templateCount sortOrder")
    .sort({ sortOrder: 1, name: 1 })
    .lean();
};

CategorySchema.statics.findCategoriesWithTemplateCount = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "templates",
        let: { categoryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$categoryId", "$categories"] },
                  { $eq: ["$isActive", true] },
                ],
              },
            },
          },
        ],
        as: "templates",
      },
    },
    { $addFields: { actualTemplateCount: { $size: "$templates" } } },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        templateCount: "$actualTemplateCount",
        sortOrder: 1,
      },
    },
    { $sort: { sortOrder: 1, name: 1 } },
  ]);
};

CategorySchema.statics.findCategoryBySlug = function (slug: string) {
  return this.findOne({ slug: slug.toLowerCase(), isActive: true })
    .select("name slug description templateCount")
    .lean();
};

CategorySchema.statics.findMainCategories = function () {
  return this.find({ isActive: true, parentCategory: null })
    .select("name slug description templateCount sortOrder")
    .sort({ sortOrder: 1, name: 1 })
    .lean();
};

CategorySchema.statics.findSubcategories = function (parentId: string) {
  return this.find({ parentCategory: parentId, isActive: true })
    .select("name slug description templateCount sortOrder")
    .sort({ sortOrder: 1, name: 1 })
    .lean();
};

CategorySchema.statics.getCategoryHierarchy = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentCategory",
        as: "subcategories",
        maxDepth: 2,
        restrictSearchWithMatch: { isActive: true },
      },
    },
    { $match: { parentCategory: null } },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        templateCount: 1,
        sortOrder: 1,
        subcategories: {
          $map: {
            input: "$subcategories",
            as: "sub",
            in: {
              _id: "$$sub._id",
              name: "$$sub.name",
              slug: "$$sub.slug",
              templateCount: "$$sub.templateCount",
            },
          },
        },
      },
    },
    { $sort: { sortOrder: 1, name: 1 } },
  ]);
};

CategorySchema.statics.refreshAllTemplateCounts = async function () {
  try {
    const Template = mongoose.model("Template");
    const categories = await this.find({ isActive: true });

    for (const category of categories) {
      const count = await Template.countDocuments({
        categories: category._id,
        isActive: true,
      });

      await this.findByIdAndUpdate(category._id, { templateCount: count });
    }

    console.log("✅ All category template counts updated");
  } catch (error) {
    console.error("❌ Error refreshing category template counts:", error);
  }
};

// 7️⃣ Instance methods
CategorySchema.methods.updateTemplateCount = async function () {
  try {
    const Template = mongoose.model("Template");
    const count = await Template.countDocuments({
      categories: this._id,
      isActive: true,
    });

    await this.findByIdAndUpdate(this._id, {
      templateCount: count,
    });
  } catch (error) {
    console.error("Error updating category template count:", error);
  }
};

CategorySchema.methods.softDelete = async function () {
  this.isActive = false;
  await this.save();

  await this.updateMany(
    { parentCategory: this._id },
    { parentCategory: null }
  );

  console.log(`Category ${this.name} soft deleted`);
};

CategorySchema.methods.restore = async function () {
  this.isActive = true;
  await this.save();
  console.log(`Category ${this.name} restored`);
};

// 8️⃣ Middleware
CategorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

CategorySchema.post("save", async function () {
  await this.updateTemplateCount();
});

CategorySchema.pre("validate", async function (next) {
  if (this.isModified("slug")) {
    const existing = await (this.constructor as ICategoryModel).findOne({
      slug: this.slug,
      _id: { $ne: this._id },
    });

    if (existing) {
      const error = new Error("Slug must be unique");
      error.name = "ValidationError";
      return next(error);
    }
  }
  next();
});

CategorySchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const Template = mongoose.model("Template");
      const templateCount = await Template.countDocuments({
        categories: this._id,
        isActive: true,
      });

      if (templateCount > 0) {
        const error = new Error(
          `Cannot delete category with ${templateCount} active templates`
        );
        error.name = "ValidationError";
        return next(error);
      }

      next();
    } catch (error) {
      next(error as any);
    }
  }
);

// 9️⃣ Create model
const Category =
  (mongoose.models.Category as unknown as ICategoryModel) ||
  mongoose.model<ICategory, ICategoryModel>("Category", CategorySchema);

export default Category;