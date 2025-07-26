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
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    purchasedTemplates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Template" }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Template" }],
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true, strict: true, });

const User: Model<IUser>  = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;