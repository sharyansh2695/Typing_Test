import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ✅ Add a new paragraph
export const addParagraph = mutation({
  args: {
    content: v.string(),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("paragraphs", {
      content: args.content,
      difficulty: args.difficulty ?? "medium",
    });
  },
});

// ✅ Fetch all paragraphs
export const getAllParagraphs = query({
  handler: async (ctx) => {
    return await ctx.db.query("paragraphs").collect();
  },
});

// ✅ Fetch a random paragraph
export const getRandomParagraph = query({
  handler: async (ctx) => {
    const paragraphs = await ctx.db.query("paragraphs").collect();
    if (paragraphs.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    return paragraphs[randomIndex];
  },
});
