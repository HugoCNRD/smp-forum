import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  messages: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    type: v.union(v.literal("message"), v.literal("announcement")),
    category: v.optional(v.string()),
  }).index("by_type", ["type"])
    .index("by_category", ["category"]),
  
  categories: defineTable({
    name: v.string(),
    description: v.string(),
    color: v.string(),
  }),
  
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    className: v.string(),
    bio: v.string(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
