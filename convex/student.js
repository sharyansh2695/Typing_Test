import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ✅ Verify student login (Convex backend)
export const verifyStudent = mutation({
  args: {
    name: v.string(),
    rollNumber: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the student with matching name and roll number
    const student = await ctx.db
      .query("students")
      .filter((q) =>
        q.and(
          q.eq(q.field("name"), args.name),
          q.eq(q.field("rollNumber"), args.rollNumber)
        )
      )
      .first();

    // If student not found, return error
    if (!student) {
      return { success: false, message: "Invalid credentials" };
    }

    // ✅ Return the Convex student ID so we can store results later
    return {
      success: true,
      message: "Login successful",
      studentId: student._id,
    };
  },
});
