import mongoose, {Document, Model, Schema, ObjectId} from "mongoose";

export interface ITemplate extends Document {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    content: string;
    categories: string[];
    tags: string[];
    author: ObjectId;
    downloads: number;
    averageRating: number;
}

const TemplateSchema = new Schema<ITemplate>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    price: { type: Number, default: 0 },
    thumbnail: { type: String },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    tags: [String],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    downloads: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
}, { timestamps: true });

const Template: Model<ITemplate> = mongoose.models.Template || mongoose.model<ITemplate>("Template", TemplateSchema);

export default Template;
