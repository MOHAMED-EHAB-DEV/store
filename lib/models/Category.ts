import mongoose, {Document, Model, Schema} from "mongoose";

export interface ICategory extends Document {
    _id: string;
    name: string;
    description: string;
    slug: string;
    isActive: boolean; // For soft delete
    templateCount: number; // Denormalized count for performance
    sortOrder: number; // For custom ordering
    parentCategory?: string; // For nested categories
}

const CategorySchema = new Schema<ICategory>({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        index: true
    },
    description: { 
        type: String,
        trim: true
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        index: true // Primary lookup for URLs
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    templateCount: {
        type: Number,
        default: 0,
        min: 0
    },
    sortOrder: {
        type: Number,
        default: 0,
        index: true
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
        index: true
    }
}, { 
    timestamps: true,
    versionKey: false
});

// Compound indexes for common query patterns
CategorySchema.index({ isActive: 1, sortOrder: 1 }); // Active categories sorted
CategorySchema.index({ parentCategory: 1, isActive: 1, sortOrder: 1 }); // Subcategories
CategorySchema.index({ templateCount: -1, isActive: 1 }); // Popular categories

// Virtual for subcategories
CategorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategory'
});

// Static methods for optimized queries
CategorySchema.statics.findActiveCategories = function() {
    return this.find({ isActive: true })
        .select('name slug description templateCount sortOrder')
        .sort({ sortOrder: 1, name: 1 })
        .lean();
};

CategorySchema.statics.findCategoriesWithTemplateCount = function() {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $lookup: {
                from: 'templates',
                let: { categoryId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ['$categoryId', '$categories'] },
                                    { $eq: ['$isActive', true] }
                                ]
                            }
                        }
                    }
                ],
                as: 'templates'
            }
        },
        {
            $addFields: {
                actualTemplateCount: { $size: '$templates' }
            }
        },
        {
            $project: {
                name: 1,
                slug: 1,
                description: 1,
                templateCount: '$actualTemplateCount',
                sortOrder: 1
            }
        },
        { $sort: { sortOrder: 1, name: 1 } }
    ]);
};

CategorySchema.statics.findCategoryBySlug = function(slug: string) {
    return this.findOne({ slug: slug.toLowerCase(), isActive: true })
        .select('name slug description templateCount')
        .lean();
};

CategorySchema.statics.findMainCategories = function() {
    return this.find({ 
        isActive: true, 
        parentCategory: null 
    })
        .select('name slug description templateCount sortOrder')
        .sort({ sortOrder: 1, name: 1 })
        .lean();
};

CategorySchema.statics.findSubcategories = function(parentId: string) {
    return this.find({ 
        parentCategory: parentId, 
        isActive: true 
    })
        .select('name slug description templateCount sortOrder')
        .sort({ sortOrder: 1, name: 1 })
        .lean();
};

CategorySchema.statics.getCategoryHierarchy = function() {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $graphLookup: {
                from: 'categories',
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parentCategory',
                as: 'subcategories',
                maxDepth: 2,
                restrictSearchWithMatch: { isActive: true }
            }
        },
        {
            $match: { parentCategory: null }
        },
        {
            $project: {
                name: 1,
                slug: 1,
                description: 1,
                templateCount: 1,
                sortOrder: 1,
                subcategories: {
                    $map: {
                        input: '$subcategories',
                        as: 'sub',
                        in: {
                            _id: '$sub._id',
                            name: '$sub.name',
                            slug: '$sub.slug',
                            templateCount: '$sub.templateCount'
                        }
                    }
                }
            }
        },
        { $sort: { sortOrder: 1, name: 1 } }
    ]);
};

// Pre-save middleware for slug generation
CategorySchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Post-save middleware to update template count
CategorySchema.post('save', async function() {
    await this.updateTemplateCount();
});

// Instance method to update template count
CategorySchema.methods.updateTemplateCount = async function() {
    try {
        const Template = mongoose.model('Template');
        const count = await Template.countDocuments({
            categories: this._id,
            isActive: true
        });
        
        await this.constructor.findByIdAndUpdate(this._id, {
            templateCount: count
        });
    } catch (error) {
        console.error('Error updating category template count:', error);
    }
};

// Static method to refresh all template counts
CategorySchema.statics.refreshAllTemplateCounts = async function() {
    try {
        const Template = mongoose.model('Template');
        const categories = await this.find({ isActive: true });
        
        for (const category of categories) {
            const count = await Template.countDocuments({
                categories: category._id,
                isActive: true
            });
            
            await this.findByIdAndUpdate(category._id, {
                templateCount: count
            });
        }
        
        console.log('✅ All category template counts updated');
    } catch (error) {
        console.error('❌ Error refreshing category template counts:', error);
    }
};

// Validate slug uniqueness
CategorySchema.pre('validate', async function(next) {
    if (this.isModified('slug')) {
        const existing = await this.constructor.findOne({
            slug: this.slug,
            _id: { $ne: this._id }
        });
        
        if (existing) {
            const error = new Error('Slug must be unique');
            error.name = 'ValidationError';
            return next(error);
        }
    }
    next();
});

// Prevent deletion if category has templates
CategorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        const Template = mongoose.model('Template');
        const templateCount = await Template.countDocuments({
            categories: this._id,
            isActive: true
        });
        
        if (templateCount > 0) {
            const error = new Error(`Cannot delete category with ${templateCount} active templates`);
            error.name = 'ValidationError';
            return next(error);
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// Soft delete method
CategorySchema.methods.softDelete = async function() {
    this.isActive = false;
    await this.save();
    
    // Update child categories
    await this.constructor.updateMany(
        { parentCategory: this._id },
        { parentCategory: null }
    );
    
    console.log(`Category ${this.name} soft deleted`);
};

// Restore method
CategorySchema.methods.restore = async function() {
    this.isActive = true;
    await this.save();
    console.log(`Category ${this.name} restored`);
};

const Category : Model<ICategory> = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;