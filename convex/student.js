import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * ✔️ Check whether a student with given rollNumber exists.
 * Called during session validation (in /test page)
 */
export const checkExists = query({
  args: { studentId: v.string() },
  handler: async (ctx, { studentId }) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_rollNumber", q => q.eq("rollNumber", studentId))
      .first();

    return student !== null;
  },
});

/**
 * ✔️ Verify student by both name and rollNumber.
 * Called during login.
 *
 * Returns:
 *   { success: true, studentId }
 *   { success: false, message }
 */
export const verifyStudent = mutation({
  args: {
    name: v.string(),
    rollNumber: v.string(),
  },

  handler: async (ctx, { name, rollNumber }) => {
    if (!name || !rollNumber) {
      return { success: false, message: "Missing name or roll number" };
    }

    // Fast lookup using index
    const student = await ctx.db
      .query("students")
      .withIndex("by_rollNumber", q => q.eq("rollNumber", rollNumber))
      .first();

    if (!student) {
      return { success: false, message: "Invalid login credentials" };
    }

    // Strict match on name (can modify to case-insensitive if needed)
    if (student.name !== name) {
      return { success: false, message: "Invalid login credentials" };
    }

    // SUCCESS → return rollNumber as studentId
    return {
      success: true,
      studentId: student.rollNumber,
    };
  },
});
