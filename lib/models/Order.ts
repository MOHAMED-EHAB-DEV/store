import mongoose, {Model, Schema, Document, ObjectId} from "mongoose";

export interface IOrder extends Document {
    _id: string;
    user: ObjectId;
    template: ObjectId;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
}

const OrderSchema = new Schema<IOrder>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    template: [{ type: mongoose.Schema.Types.ObjectId, ref: "Template" }],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    paymentMethod: { type: String, enum: ["credit_card", "paypal", "stripe"], default: "stripe" },
}, { timestamps: true });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;