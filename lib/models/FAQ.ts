import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFAQ extends Document {
    _id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    isPublished: boolean;
    coverImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
    {
        question: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        answer: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
            index: true,
            default: "general",
        },
        order: {
            type: Number,
            default: 0,
            index: true,
        },
        isPublished: {
            type: Boolean,
            default: true,
            index: true,
        },
        coverImage: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes
FAQSchema.index({ category: 1, order: 1 });
FAQSchema.index({ isPublished: 1, category: 1, order: 1 });
FAQSchema.index({ question: "text", answer: "text" });

// Static methods
FAQSchema.statics.findPublished = function (category?: string) {
    const query: any = { isPublished: true };
    if (category) query.category = category;

    return this.find(query)
        .select("question answer category order coverImage")
        .sort({ category: 1, order: 1 })
        .lean();
};

FAQSchema.statics.findByCategory = function (category: string) {
    return this.find({ category, isPublished: true })
        .select("question answer order coverImage")
        .sort({ order: 1 })
        .lean();
};

FAQSchema.statics.getCategories = function () {
    return this.aggregate([
        { $match: { isPublished: true } },
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
};

FAQSchema.statics.getStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                published: { $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] } },
                draft: { $sum: { $cond: [{ $eq: ["$isPublished", false] }, 1, 0] } },
            },
        },
    ]);
};

export interface IFAQModel extends Model<IFAQ> {
    findPublished(category?: string): Promise<IFAQ[]>;
    findByCategory(category: string): Promise<IFAQ[]>;
    getCategories(): Promise<{ _id: string; count: number }[]>;
    getStats(): Promise<any[]>;
}

const FAQ =
    (mongoose.models.FAQ as unknown as IFAQModel) ||
    mongoose.model<IFAQ, IFAQModel>("FAQ", FAQSchema);

if (process.env.NODE_ENV !== "production") {
    FAQ.syncIndexes().catch(console.error);
}

export default FAQ;
