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
    wpm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { studentId, paragraphId, symbols, seconds, accuracy, wpm } = args;

    // 🧮 Avoid invalid inputs
    if (!studentId || !paragraphId || seconds <= 0) {
      throw new Error("Invalid data provided");
    }

    // ✅ Compute WPM correctly
    const calculatedWpm = wpm ?? Math.round((symbols * 60) / (5 * seconds));

    // 💾 Insert into results table
    await ctx.db.insert("results", {
      studentId,
      paragraphId,
      symbols,
      seconds,
      accuracy: accuracy ?? null,
      wpm: calculatedWpm,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Result stored for student:", studentId);

    return { success: true, wpm: calculatedWpm };
  },
});

// 🧾 Fetch highest WPM of a student
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
