import mongoose, {Document, Model, Schema, ObjectId} from "mongoose";

export interface IReview extends Document {
    _id: string;
    user: ObjectId;
    template: ObjectId;
    rating: Number;
    comment: String;
}

const ReviewSchema = new Schema<IReview>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
}, { timestamps: true });

const Review : Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;