import User from "@/lib/models/User";
import { connectToDatabase, measureQuery } from "@/lib/database";
import { Types } from "mongoose";

// Types
interface CachedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  cacheTimestamp: number;
}

interface UserCacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

interface UserQueryOptions {
  select?: string;
  lean?: boolean;
  includePassword?: boolean;
}

class UserServiceClass {
  private userCache = new Map<string, CachedUser>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxCacheSize = 1000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval to remove expired cache entries
    this.startCleanupInterval();
  }

  /**
   * Start interval to clean up expired cache entries
   */
  private startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredEntries();
    }, 60 * 1000); // Run every minute
  }

  /**
   * Clean up expired cache entries
   */
  private cleanExpiredEntries() {
    const now = Date.now();
    for (const [key, user] of this.userCache.entries()) {
      if (now - user.cacheTimestamp > this.defaultTTL) {
        this.userCache.delete(key);
      }
    }
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(user: CachedUser, ttl: number = this.defaultTTL): boolean {
    return (Date.now() - user.cacheTimestamp) < ttl;
  }

  /**
   * Add user to cache
   */
  private setCacheEntry(userId: string, user: any, ttl: number = this.defaultTTL) {
    // Implement LRU-like behavior
    if (this.userCache.size >= this.maxCacheSize) {
      const firstKey = this.userCache.keys().next().value;
      if (firstKey) {
        this.userCache.delete(firstKey);
      }
    }

    const cachedUser: CachedUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      cacheTimestamp: Date.now()
    };

    this.userCache.set(userId, cachedUser);
  }

  /**
   * Get user from cache
   */
  private getCacheEntry(userId: string, ttl: number = this.defaultTTL): CachedUser | null {
    const cachedUser = this.userCache.get(userId);
    if (cachedUser && this.isCacheValid(cachedUser, ttl)) {
      return cachedUser;
    }
    
    // Remove expired entry
    if (cachedUser) {
      this.userCache.delete(userId);
    }
    
    return null;
  }

  /**
   * Find user by ID with caching
   */
  async findById(
    userId: string, 
    options: UserQueryOptions = {},
    cacheOptions: UserCacheOptions = {}
  ) {
    try {
      const { ttl = this.defaultTTL } = cacheOptions;
      const { select = '_id name email role avatar createdAt updatedAt', lean = true, includePassword = false } = options;

      // Don't use cache if password is requested for security
      if (!includePassword) {
        const cachedUser = this.getCacheEntry(userId, ttl);
        if (cachedUser) {
          return cachedUser;
        }
      }

      await connectToDatabase();

      const selectFields = includePassword ? `${select} password` : select;
      
      const user = await measureQuery(`findUserById_${userId}`,
        User.findById(userId)
          .select(selectFields)
          .lean(lean)
      );

      if (user && !includePassword) {
        this.setCacheEntry(userId, user, ttl);
      }

      return user;
    } catch (error) {
      console.error('UserService.findById error:', error);
      throw error;
    }
  }

  /**
   * Find user by email with caching
   */
  async findByEmail(
    email: string, 
    options: UserQueryOptions = {},
    cacheOptions: UserCacheOptions = {}
  ) {
    try {
      const { ttl = this.defaultTTL } = cacheOptions;
      const { select = '_id name email role avatar createdAt updatedAt', lean = true, includePassword = false } = options;

      const normalizedEmail = email.toLowerCase().trim();
      const emailCacheKey = `email:${normalizedEmail}`;

      // Don't use cache if password is requested
      if (!includePassword) {
        const cachedUser = this.getCacheEntry(emailCacheKey, ttl);
        if (cachedUser) {
          return cachedUser;
        }
      }

      await connectToDatabase();

      const selectFields = includePassword ? `${select} password` : select;

      const user = await measureQuery(`findUserByEmail_${normalizedEmail}`,
        User.findOne({ email: normalizedEmail })
          .select(selectFields)
          .lean(lean)
      );

      if (user && !includePassword) {
        // Cache by both ID and email
        this.setCacheEntry(user._id.toString(), user, ttl);
        this.setCacheEntry(emailCacheKey, user, ttl);
      }

      return user;
    } catch (error) {
      console.error('UserService.findByEmail error:', error);
      throw error;
    }
  }

  /**
   * Update user and clear cache
   */
  async updateUser(userId: string, updateData: any, options: UserQueryOptions = {}) {
    try {
      const { select = '_id name email role avatar updatedAt', lean = true } = options;

      await connectToDatabase();

      const updatedUser = await measureQuery(`updateUser_${userId}`,
        User.findByIdAndUpdate(
          userId,
          { 
            $set: { 
              ...updateData,
              updatedAt: new Date()
            }
          },
          { 
            runValidators: true, 
            new: true,
            select
          }
        ).lean(lean)
      );

      // Clear cache for this user
      this.clearUserCache(userId);

      // If email was updated, clear email-based cache too
      if (updateData.email) {
        const oldEmailKey = `email:${updateData.email.toLowerCase().trim()}`;
        this.userCache.delete(oldEmailKey);
      }

      return updatedUser;
    } catch (error) {
      console.error('UserService.updateUser error:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: any) {
    try {
      await connectToDatabase();

      const user = new User({
        ...userData,
        email: userData.email.toLowerCase().trim()
      });

      const savedUser = await measureQuery('createUser',
        user.save()
      );

      // Convert to plain object and cache
      const userObj = savedUser.toObject();
      this.setCacheEntry(userObj._id.toString(), userObj);

      return userObj;
    } catch (error) {
      console.error('UserService.createUser error:', error);
      throw error;
    }
  }

  /**
   * Delete user and clear cache
   */
  async deleteUser(userId: string) {
    try {
      await connectToDatabase();

      // Get user first to clear email cache
      const user = await this.findById(userId, { lean: true });
      
      const deletedUser = await measureQuery(`deleteUser_${userId}`,
        User.findByIdAndDelete(userId)
      );

      // Clear all cache entries for this user
      this.clearUserCache(userId);
      
      if (user?.email) {
        const emailCacheKey = `email:${user.email.toLowerCase().trim()}`;
        this.userCache.delete(emailCacheKey);
      }

      return deletedUser;
    } catch (error) {
      console.error('UserService.deleteUser error:', error);
      throw error;
    }
  }

  /**
   * Clear user cache by ID
   */
  clearUserCache(userId: string): void {
    this.userCache.delete(userId);
    
    // Also try to find and remove email-based cache entries
    // This is less efficient but ensures consistency
    for (const [key, user] of this.userCache.entries()) {
      if (user._id === userId) {
        this.userCache.delete(key);
      }
    }
  }

  /**
   * Clear user cache by email
   */
  clearUserCacheByEmail(email: string): void {
    const normalizedEmail = email.toLowerCase().trim();
    const emailCacheKey = `email:${normalizedEmail}`;
    
    const cachedUser = this.userCache.get(emailCacheKey);
    if (cachedUser) {
      // Clear both email and ID based entries
      this.userCache.delete(emailCacheKey);
      this.userCache.delete(cachedUser._id);
    }
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.userCache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const user of this.userCache.values()) {
      if (this.isCacheValid(user)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.userCache.size,
      validEntries,
      expiredEntries,
      maxSize: this.maxCacheSize,
      ttl: this.defaultTTL
    };
  }

  /**
   * Validate user exists
   */
  async validateUserExists(userId: string): Promise<boolean> {
    try {
      const user = await this.findById(userId, { select: '_id' });
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get multiple users by IDs
   */
  async findByIds(userIds: string[], options: UserQueryOptions = {}) {
    try {
      const { select = '_id name email role avatar', lean = true } = options;
      
      const uncachedIds: string[] = [];
      const cachedUsers: any[] = [];

      // Check cache first
      for (const userId of userIds) {
        const cachedUser = this.getCacheEntry(userId);
        if (cachedUser) {
          cachedUsers.push(cachedUser);
        } else {
          uncachedIds.push(userId);
        }
      }

      let dbUsers: any[] = [];
      if (uncachedIds.length > 0) {
        await connectToDatabase();
        
        dbUsers = await measureQuery(`findUsersByIds_${uncachedIds.length}`,
          User.find({ _id: { $in: uncachedIds } })
            .select(select)
            .lean(lean)
        );

        // Cache the results
        dbUsers.forEach(user => {
          this.setCacheEntry(user._id.toString(), user);
        });
      }

      return [...cachedUsers, ...dbUsers];
    } catch (error) {
      console.error('UserService.findByIds error:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clearAllCache();
  }
}

// Export singleton instance
export const UserService = new UserServiceClass();

// Also export the class for testing or multiple instances
export { UserServiceClass };