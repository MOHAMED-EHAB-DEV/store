import { ObjectId } from "mongoose";

declare type IUser = {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: string;
  createdAt: Date;
  purchasedTemplates: String[];
  favorites: String[];
  updatedAt: Date;
  lastLogin?: Date;
  isEmailVerified: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  tier: "free" | "premium";
  banned: boolean;
  banId: string;
  banMetadata?: {
    reason: string;
    bannedAt: Date;
    bannedBy: string;
    notes?: string;
    expiresAt?: Date;
  };
  online: boolean;
  lastSeen: Date;
  preferences: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
  };
};

declare type ITemplate = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  demoLink: string;
  price: number;
  content: string;
  categories: ICategory[] | string[];
  gradient?: string;
  reviews?: number;
  averageRating: number;
  tags: string[];
  author: ObjectId;
  downloads: number;
  averageRating: number;
  isActive: boolean; // Add for soft delete
  builtWith: "framer" | "figma" | "vite" | "next.js";
  views: number;
  reviewCount: number;
  type: "framer" | "coded" | "figma";
  isPaid: Boolean;
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt: Date;
  fileKey: String;
};

declare type IOrder = {
  _id: string;
  user: string;
  template: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
};

declare type IReview = {
  _id: string;
  user: string;
  template: string;
  rating: Number;
  comment: String;
};

declare type ICategory = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  templateCount: number;
  sortOrder: number;
  parentCategory?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

declare type IDownloadLog = {
  _id: string;
  userId?: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  ip: string;
  userAgent?: string;
  filename: string;
  fileKey?: string;
  bytes?: number;
  status: "success" | "failed";
  statusCode?: number;
  meta?: any;
  createdAt: Date;
  updatedAt: Date;
}