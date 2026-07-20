import * as v from "valibot";

export const UserSchema = v.object({
  _id: v.string(),
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  password: v.string(),
  avatar: v.optional(v.string()),
  role: v.union([v.literal("user"), v.literal("admin")]),
  purchasedTemplates: v.array(v.string()),
  favorites: v.array(v.string()),
  lastLogin: v.optional(v.union([v.date(), v.string()])),
  isEmailVerified: v.boolean(),
  loginAttempts: v.number(),
  lockUntil: v.optional(v.union([v.date(), v.string()])),
  tier: v.union([v.literal("starter"), v.literal("pro"), v.literal("lifetime")]),
  banned: v.boolean(),
  banId: v.nullable(v.optional(v.string())),
  banMetadata: v.optional(
    v.object({
      reason: v.string(),
      bannedAt: v.union([v.date(), v.string()]),
      bannedBy: v.string(),
      notes: v.optional(v.string()),
      expiresAt: v.optional(v.union([v.date(), v.string()])),
    })
  ),
  online: v.boolean(),
  lastSeen: v.union([v.date(), v.string()]),
  preferences: v.object({
    emailNotifications: v.boolean(),
    marketingEmails: v.boolean(),
    weeklyDigest: v.boolean(),
  }),
  createdAt: v.union([v.date(), v.string()]),
  updatedAt: v.union([v.date(), v.string()]),
});

export type IUser = v.InferOutput<typeof UserSchema>;
