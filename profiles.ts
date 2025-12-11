import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    return profile;
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    return profile;
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.string(),
    className: v.string(),
    bio: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Vous devez être connecté");
    }
    
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        displayName: args.displayName,
        className: args.className,
        bio: args.bio,
      });
    } else {
      await ctx.db.insert("profiles", {
        userId,
        displayName: args.displayName,
        className: args.className,
        bio: args.bio,
      });
    }
  },
});
