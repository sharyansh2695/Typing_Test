import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


// ✅ STEP 6 — HARD BACKEND ATTEMPT BLOCKING
// Checks if student has already attempted this paragraph.
export const hasAttempted = query({
  args: {
    studentId: v.string(),
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


// ⭐ SAVE RESULT WITH BACKEND ENFORCEMENT
export const saveResult = mutation({
  args: {
    studentId: v.string(),
    paragraphId: v.id("paragraphs"),
    symbols: v.number(),
    seconds: v.number(),
    accuracy: v.number(),
    wpm: v.number(),
    text: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const { studentId, paragraphId } = args;

    // ⭐ STEP 6 (CRITICAL):
    // HARD BLOCK repeated attempts EVEN IF frontend is bypassed
    const existing = await ctx.db
      .query("results")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) => q.eq(q.field("paragraphId"), paragraphId))
      .first();

    if (existing) {
      // ❗ SAME LOGIC (BLOCK ATTEMPT), but DO NOT CRASH FRONTEND
      return { success: false, message: "Attempt blocked: Already attempted." };
    }

    // Snapshot paragraph for safety & audit logs
    const paragraph = await ctx.db.get(paragraphId);
    const paragraphContent = paragraph?.content ?? "";
    const originalSymbols = paragraphContent.length;

    // Insert new test result
    const result = await ctx.db.insert("results", {
      studentId,
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


// ADMIN: get all results
export const getAllResults = query({
  handler: async (ctx) => {
    return await ctx.db.query("results").order("desc").collect();
  },
});
