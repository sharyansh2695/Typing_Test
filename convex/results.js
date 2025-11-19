import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


//check if student has attempted paragraph
export const hasAttempted = query({
  args: {
    studentId: v.string(),          // username
    paragraphId: v.id("paragraphs"),
  },

  handler: async (ctx, args) => {
    const { studentId, paragraphId } = args;

    const existing = await ctx.db
      .query("results")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) => q.eq(q.field("paragraphId"), paragraphId))
      .first();

    console.log("CHECK ATTEMPT:", { studentId, paragraphId, existing });

    return existing ? true : false;
  },
});


// Save Result (Snapshot + Block SAME PARAGRAPH reattempt)
export const saveResult = mutation({
  args: {
    studentId: v.string(),          // now username
    paragraphId: v.id("paragraphs"),
    symbols: v.number(),
    seconds: v.number(),
    accuracy: v.number(),
    wpm: v.number(),
    text: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const { studentId, paragraphId } = args;

    // Block reattempt only for SAME paragraph
    const existing = await ctx.db
      .query("results")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) => q.eq(q.field("paragraphId"), paragraphId))
      .first();

    if (existing) {
      return { success: false, message: "Already Attempted" };
    }

    // Snapshot paragraph
    const paragraph = await ctx.db.get(paragraphId);
    const paragraphContent = paragraph?.content ?? "";
    const originalSymbols = paragraphContent.length;

    // Insert result
    const result = await ctx.db.insert("results", {
      studentId,                 // now storing username
      paragraphId,
      symbols: args.symbols,
      seconds: args.seconds,
      accuracy: args.accuracy,
      wpm: args.wpm,
      text: args.text ?? "",
      paragraphContent,
      originalSymbols,
      submittedAt: new Date().toISOString(),
    });

    return { success: true, result };
  },
});


// Get all Results (Admin)
export const getAllResults = query({
  handler: async (ctx) => {
    return await ctx.db.query("results").order("desc").collect();
  },
});
