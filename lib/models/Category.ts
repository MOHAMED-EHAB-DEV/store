import mongoose, {Document, Model, Schema} from "mongoose";

export interface ICategory extends Document {
    _id: string;
    name: string;
    description: string;
    slug: string;
}

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true },
}, { timestamps: true });

const Category : Model<ICategory> = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;