import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("messages");
    
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }
    
    const messages = await query
      .order("desc")
      .take(50);
    
    return messages;
  },
});

export const sendMessage = mutation({
  args: {
    content: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Vous devez être connecté pour envoyer un message");
    }
    
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    
    // Récupérer le profil utilisateur
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    const displayName = profile?.displayName || user.name || user.email || "Utilisateur anonyme";
    
    await ctx.db.insert("messages", {
      content: args.content,
      authorId: userId,
      authorName: displayName,
      type: "message",
      category: args.category,
    });
  },
});

export const sendAnnouncement = mutation({
  args: {
    content: v.string(),
    password: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Vous devez être connecté pour envoyer une annonce");
    }
    
    // Vérifier le mot de passe secret
    if (args.password !== "noussommeslecvl") {
      throw new Error("Mot de passe incorrect pour publier une annonce");
    }
    
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    
    // Récupérer le profil utilisateur
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    const displayName = profile?.displayName || user.name || user.email || "Administration";
    
    await ctx.db.insert("messages", {
      content: args.content,
      authorId: userId,
      authorName: displayName,
      type: "announcement",
      category: args.category,
    });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Vous devez être connecté");
    }
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message non trouvé");
    }
    
    // Seul l'auteur peut supprimer son message
    if (message.authorId !== userId) {
      throw new Error("Vous ne pouvez supprimer que vos propres messages");
    }
    
    await ctx.db.delete(args.messageId);
  },
});
