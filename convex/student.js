import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const verifyStudent = mutation({
  args: {
    name: v.string(),
    rollNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .filter((q) => q.eq(q.field("name"), args.name))
      .filter((q) => q.eq(q.field("rollNumber"), args.rollNumber))
      .first();

    if (!student) {
      return { success: false, message: "Invalid credentials" };
    }

    return { success: true };
  },
});
