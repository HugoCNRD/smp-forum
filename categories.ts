import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Vous devez être connecté");
    }
    
    return await ctx.db.insert("categories", {
      name: args.name,
      description: args.description,
      color: args.color,
    });
  },
});

// Créer les catégories par défaut
export const initializeDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").first();
    if (existing) return; // Déjà initialisé
    
    const defaultCategories = [
      { name: "Général", description: "Discussions générales", color: "#3B82F6" },
      { name: "Cours", description: "Questions sur les cours", color: "#10B981" },
      { name: "Examens", description: "Informations sur les examens", color: "#F59E0B" },
      { name: "Événements", description: "Événements scolaires", color: "#8B5CF6" },
      { name: "Aide", description: "Demandes d'aide", color: "#EF4444" },
    ];
    
    for (const category of defaultCategories) {
      await ctx.db.insert("categories", category);
    }
  },
});
