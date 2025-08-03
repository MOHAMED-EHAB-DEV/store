import mongoose, {Document, Model, Schema, ObjectId} from "mongoose";

export interface IReview extends Document {
    _id: string;
    user: ObjectId;
    template: ObjectId;
    rating: Number;
    comment: String;
    isActive: boolean; // For soft delete
    helpfulCount: number; // For helpful votes
}

const ReviewSchema = new Schema<IReview>({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true
    },
    template: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Template", 
        required: true,
        index: true
    },
    rating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: true,
        index: true // For rating queries
    },
    comment: { 
        type: String,
        trim: true,
        maxlength: 1000 // Prevent overly long comments
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    helpfulCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, { 
    timestamps: true,
    versionKey: false
});

// Compound indexes for common query patterns
ReviewSchema.index({ template: 1, isActive: 1, createdAt: -1 }); // Template reviews
ReviewSchema.index({ user: 1, isActive: 1, createdAt: -1 }); // User reviews
ReviewSchema.index({ template: 1, rating: 1, isActive: 1 }); // Rating filtering
ReviewSchema.index({ user: 1, template: 1 }, { unique: true }); // Prevent duplicate reviews

// Static methods for optimized queries
ReviewSchema.statics.findTemplateReviews = function(templateId: string, limit = 10, skip = 0) {
    return this.find({ 
        template: templateId, 
        isActive: true 
    })
        .select('rating comment helpfulCount createdAt user')
        .populate('user', 'name avatar')
        .sort({ helpfulCount: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

ReviewSchema.statics.getTemplateRatingStats = function(templateId: string) {
    return this.aggregate([
        { 
            $match: { 
                template: new mongoose.Types.ObjectId(templateId), 
                isActive: true 
            } 
        },
        {
            $group: {
                _id: '$template',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                ratingDistribution: {
                    $push: '$rating'
                }
            }
        },
        {
            $addFields: {
                ratingBreakdown: {
                    $reduce: {
                        input: { $range: [1, 6] },
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[{
                                        k: { $toString: '$$this' },
                                        v: {
                                            $size: {
                                                $filter: {
                                                    input: '$ratingDistribution',
                                                    cond: { $eq: ['$$item', '$$this'] }
                                                }
                                            }
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

ReviewSchema.statics.getUserReviews = function(userId: string, limit = 20, skip = 0) {
    return this.find({ 
        user: userId, 
        isActive: true 
    })
        .select('rating comment template createdAt')
        .populate('template', 'title thumbnail')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

// Post-save middleware to update template average rating
ReviewSchema.post('save', async function() {
    try {
        const Review = this.constructor as Model<IReview>;
        const stats = await Review.aggregate([
            { 
                $match: { 
                    template: this.template, 
                    isActive: true 
                } 
            },
            {
                $group: {
                    _id: '$template',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            const Template = mongoose.model('Template');
            await Template.findByIdAndUpdate(this.template, {
                averageRating: Math.round(stats[0].averageRating * 10) / 10 // Round to 1 decimal
            });
        }
    } catch (error) {
        console.error('Error updating template rating:', error);
    }
});

// Post-remove middleware to update template average rating
ReviewSchema.post('findOneAndUpdate', async function() {
    try {
        const doc = await this.model.findOne(this.getQuery());
        if (doc && doc.template) {
            const Review = this.model;
            const stats = await Review.aggregate([
                { 
                    $match: { 
                        template: doc.template, 
                        isActive: true 
                    } 
                },
                {
                    $group: {
                        _id: '$template',
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 }
                    }
                }
            ]);

            const Template = mongoose.model('Template');
            if (stats.length > 0) {
                await Template.findByIdAndUpdate(doc.template, {
                    averageRating: Math.round(stats[0].averageRating * 10) / 10
                });
            } else {
                await Template.findByIdAndUpdate(doc.template, {
                    averageRating: 0
                });
            }
        }
    } catch (error) {
        console.error('Error updating template rating after update:', error);
    }
});

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;