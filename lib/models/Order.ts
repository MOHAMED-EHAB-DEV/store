import mongoose, { Model, Schema, Document, Types } from "mongoose";
import "./User";
import "./Template";

export interface IOrder extends Document {
  _id: string;
  user: Types.ObjectId;
  templates: Types.ObjectId[];
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed" | "refunded" | "cancelled";
  paymentMethod: "credit_card" | "paypal" | "stripe";
  paymentId?: string;
  currency: "USD" | "EUR" | "GBP";
  createdAt: Date;
  updatedAt: Date;
}

interface IOrderModel extends Model<IOrder> {
  findUserOrders(userId: string, limit?: number, skip?: number): Promise<IOrder[]>;
  findCompletedOrdersByUser(userId: string): Promise<IOrder[]>;
  getRevenueStats(startDate?: Date, endDate?: Date): Promise<any>;
  getTemplatePopularityStats(limit?: number): Promise<any>;
  findPendingOrders(olderThanMinutes?: number): Promise<IOrder[]>;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    templates: [
      {
        type: Schema.Types.ObjectId,
        ref: "Template",
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "stripe"],
      default: "stripe",
    },
    paymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//
// 🧠 Indexes
//
OrderSchema.index({ user: 1, paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1, paymentStatus: 1 });
OrderSchema.index({ templates: 1, paymentStatus: 1 });
OrderSchema.index({ paymentId: 1, paymentStatus: 1 });
OrderSchema.index(
  { paymentStatus: 1, createdAt: 1 },
  {
    expireAfterSeconds: 7 * 24 * 60 * 60,
    partialFilterExpression: { paymentStatus: "pending" },
  }
);

//
// ⚙️ Static Methods
//
OrderSchema.statics.findUserOrders = function (userId: string, limit = 20, skip = 0) {
  return this.find({
    user: userId,
    paymentStatus: { $in: ["completed", "pending"] },
  })
    .select("templates totalAmount paymentStatus paymentMethod currency createdAt")
    .populate("templates", "title thumbnail price")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

OrderSchema.statics.findCompletedOrdersByUser = function (userId: string) {
  return this.find({
    user: userId,
    paymentStatus: "completed",
  })
    .select("templates")
    .lean();
};

OrderSchema.statics.getRevenueStats = function (startDate?: Date, endDate?: Date) {
  const matchStage: any = { paymentStatus: "completed" };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: "$totalAmount" },
        revenueByMethod: {
          $push: {
            method: "$paymentMethod",
            amount: "$totalAmount",
          },
        },
      },
    },
    {
      $addFields: {
        paymentMethodBreakdown: {
          $reduce: {
            input: "$revenueByMethod",
            initialValue: {},
            in: {
              $mergeObjects: [
                "$$value",
                {
                  $arrayToObject: [
                    [
                      {
                        k: "$$this.method",
                        v: {
                          $add: [
                            {
                              $ifNull: [
                                {
                                  $getField: {
                                    field: "$$this.method",
                                    input: "$$value",
                                  },
                                },
                                0,
                              ],
                            },
                            "$$this.amount",
                          ],
                        },
                      },
                    ],
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ]);
};

OrderSchema.statics.getTemplatePopularityStats = function (limit = 20) {
  return this.aggregate([
    { $match: { paymentStatus: "completed" } },
    { $unwind: "$templates" }, // ✅ fixed typo here (was `$template`)
    {
      $group: {
        _id: "$templates",
        purchaseCount: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
    {
      $lookup: {
        from: "templates",
        localField: "_id",
        foreignField: "_id",
        as: "template",
      },
    },
    { $unwind: "$template" },
    {
      $project: {
        templateId: "$_id",
        templateTitle: "$template.title",
        purchaseCount: 1,
        totalRevenue: 1,
      },
    },
    { $sort: { purchaseCount: -1 } },
    { $limit: limit },
  ]);
};

OrderSchema.statics.findPendingOrders = function (olderThanMinutes = 30) {
  const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);

  return this.find({
    paymentStatus: "pending",
    createdAt: { $lte: cutoffTime },
  })
    .select("user paymentId paymentMethod totalAmount createdAt")
    .populate("user", "name email")
    .sort({ createdAt: 1 })
    .lean();
};

//
// 🔁 Post-save Hook
//
OrderSchema.post("save", async function (doc) {
  if (doc.paymentStatus === "completed" && doc.isModified("paymentStatus")) {
    try {
      const Template = mongoose.model("Template");
      await Template.updateMany(
        { _id: { $in: doc.templates } },
        { $inc: { downloads: 1 } }
      );
    } catch (err) {
      console.error("Error updating template download count:", err);
    }
  }
});

const Order =
  (mongoose.models.Order as unknown as IOrderModel) ||
  mongoose.model<IOrder, IOrderModel>("Order", OrderSchema);

export default Order;
