import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ✅ Save typing test result
export const saveResult = mutation({
  args: {
    studentId: v.id("students"),
    paragraphId: v.id("paragraphs"),
    symbols: v.number(),
    seconds: v.number(),
    accuracy: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { studentId, paragraphId, symbols, seconds, accuracy } = args;

    // Avoid divide by zero
    if (seconds <= 0) {
      throw new Error("Invalid seconds value");
    }

    // ✅ Correct WPM calculation
    const wpm = (symbols * 60) / (5 * seconds);

    // Save result in DB
    await ctx.db.insert("results", {
      studentId,
      paragraphId,
      symbols,
      seconds,
      accuracy: accuracy ?? null,
      wpm: Math.round(wpm),
      createdAt: new Date().toISOString(),
    });

    return { success: true, wpm: Math.round(wpm) };
  },
});

// 🧾 Get the highest speed of a student
export const getHighestSpeed = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, { studentId }) => {
    const results = await ctx.db
      .query("results")
      .filter((q) => q.eq(q.field("studentId"), studentId))
      .collect();

    if (results.length === 0) return { highestWpm: 0 };

    const highestWpm = Math.max(...results.map((r) => r.wpm));
    return { highestWpm };
  },
});
