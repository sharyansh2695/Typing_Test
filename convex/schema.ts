import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  students: defineTable({
    name: v.string(),
    rollNumber: v.string(),
  })
    .index("by_rollNumber", ["rollNumber"])
    .index("by_name", ["name"]),

  // 🆕 New table for typing test content
  paragraphs: defineTable({
    content: v.string(), // the paragraph text
    difficulty: v.optional(v.string()), // optional (easy, medium, hard)
  }),
  results: defineTable({
  studentId: v.id("students"),
  paragraphId: v.id("paragraphs"),
  symbols: v.number(),
  seconds: v.number(),
  wpm: v.number(),
  accuracy: v.optional(v.number()),
  createdAt: v.string(),
})
  .index("by_student", ["studentId"])
  .index("by_paragraph", ["paragraphId"]),

});
