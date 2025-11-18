import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

//save result
export const saveResult = mutation({
  args: {
    studentId: v.id("students"),
    paragraphId: v.id("paragraphs"),
    symbols: v.number(),
    seconds: v.number(),
    accuracy: v.number(),
    wpm: v.number(),
    text: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const { studentId, paragraphId, symbols, seconds, accuracy, wpm, text } = args;

    const result = await ctx.db.insert("results", {
      studentId,
      paragraphId,
      symbols,
      seconds,
      accuracy,
      wpm,
      text: text ?? "",
      createdAt: new Date().toISOString(),
    });

    return { success: true, result };
  },
});

//get all results-admin
export const getAllResults = query({
  handler: async (ctx) => {
    return ctx.db.query("results").collect();
  },
});
