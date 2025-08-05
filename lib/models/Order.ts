import mongoose, {Model, Schema, Document, ObjectId} from "mongoose";

export interface IOrder extends Document {
    _id: string;
    user: ObjectId;
    templates: ObjectId[]; // Fixed: should be array based on schema
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    paymentId?: string; // Add payment provider ID
    currency: string; // Add currency support
}

const OrderSchema = new Schema<IOrder>({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true // Primary lookup field
    },
    templates: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Template",
        required: true
    }],
    totalAmount: { 
        type: Number, 
        required: true,
        min: 0,
        index: true // For revenue queries
    },
    paymentStatus: { 
        type: String, 
        enum: ["pending", "completed", "failed", "refunded", "cancelled"], 
        default: "pending",
        index: true // Critical for status queries
    },
    paymentMethod: { 
        type: String, 
        enum: ["credit_card", "paypal", "stripe"], 
        default: "stripe"
    },
    paymentId: {
        type: String,
        sparse: true, // Allow null but index when present
        index: true
    },
    currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP"] // Add supported currencies
    }
}, { 
    timestamps: true,
    versionKey: false
});

// Compound indexes for common query patterns
OrderSchema.index({ user: 1, paymentStatus: 1, createdAt: -1 }); // User order history
OrderSchema.index({ paymentStatus: 1, createdAt: -1 }); // Admin order management
OrderSchema.index({ createdAt: -1, paymentStatus: 1 }); // Recent orders
OrderSchema.index({ templates: 1, paymentStatus: 1 }); // Template sales tracking
OrderSchema.index({ paymentId: 1, paymentStatus: 1 }); // Payment provider lookup

// Static methods for optimized queries
OrderSchema.statics.findUserOrders = function(userId: string, limit = 20, skip = 0) {
    return this.find({ 
        user: userId,
        paymentStatus: { $in: ['completed', 'pending'] }
    })
        .select('template totalAmount paymentStatus paymentMethod currency createdAt')
        .populate('templates', 'title thumbnail price')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

OrderSchema.statics.findCompletedOrdersByUser = function(userId: string) {
    return this.find({ 
        user: userId,
        paymentStatus: 'completed'
    })
        .select('templates')
        .lean();
};

OrderSchema.statics.getRevenueStats = function(startDate?: Date, endDate?: Date) {
    const matchStage: any = { paymentStatus: 'completed' };
    
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
                totalRevenue: { $sum: '$totalAmount' },
                totalOrders: { $sum: 1 },
                averageOrderValue: { $avg: '$totalAmount' },
                revenueByMethod: {
                    $push: {
                        method: '$paymentMethod',
                        amount: '$totalAmount'
                    }
                }
            }
        },
        {
            $addFields: {
                paymentMethodBreakdown: {
                    $reduce: {
                        input: '$revenueByMethod',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[{
                                        k: '$$this.method',
                                        v: {
                                            $add: [
                                                { $ifNull: [{ $getField: { field: '$$this.method', input: '$$value' } }, 0] },
                                                '$$this.amount'
                                            ]
                                        }
                                    }]]
                                }
                            ]
                        }
                    }
                }
            }
        }
    ]);
};

OrderSchema.statics.getTemplatePopularityStats = function(limit = 20) {
    return this.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $unwind: '$template' },
        {
            $group: {
                _id: '$template',
                purchaseCount: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' }
            }
        },
        {
            $lookup: {
                from: 'templates',
                localField: '_id',
                foreignField: '_id',
                as: 'template'
            }
        },
        { $unwind: '$template' },
        {
            $project: {
                templateId: '$_id',
                templateTitle: '$template.title',
                purchaseCount: 1,
                totalRevenue: 1
            }
        },
        { $sort: { purchaseCount: -1 } },
        { $limit: limit }
    ]);
};

OrderSchema.statics.findPendingOrders = function(olderThanMinutes = 30) {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    
    return this.find({
        paymentStatus: 'pending',
        createdAt: { $lte: cutoffTime }
    })
        .select('user paymentId paymentMethod totalAmount createdAt')
        .populate('user', 'name email')
        .sort({ createdAt: 1 })
        .lean();
};

// Pre-save middleware to update template download count
OrderSchema.post('save', async function() {
    if (this.paymentStatus === 'completed' && this.isModified('paymentStatus')) {
        try {
            const Template = mongoose.model('Template');
            // Increment download count for all template in the order
            await Template.updateMany(
                { _id: { $in: this.templates } },
                { $inc: { downloads: 1 } }
            );
        } catch (error) {
            console.error('Error updating template download count:', error);
        }
    }
});

// Index for efficient cleanup of old pending orders
OrderSchema.index({ 
    paymentStatus: 1, 
    createdAt: 1 
}, { 
    expireAfterSeconds: 7 * 24 * 60 * 60, // Auto-delete pending orders after 7 days
    partialFilterExpression: { paymentStatus: 'pending' }
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;