import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  author?: mongoose.Schema.Types.ObjectId; // Optional for now, or link to User
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 300,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ publishedAt: -1, isPublished: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

export interface IBlogModel extends Model<IBlog> { }

const Blog =
  (mongoose.models.Blog as unknown as IBlogModel) ||
  mongoose.model<IBlog, IBlogModel>("Blog", BlogSchema);

Blog.syncIndexes().catch(console.error);

export default Blog;
