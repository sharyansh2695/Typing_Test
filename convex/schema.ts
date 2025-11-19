import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // Students table
  students: defineTable({
    name: v.string(),
    rollNumber: v.string(),
  })
    .index("by_rollNumber", ["rollNumber"])
    .index("by_name", ["name"]),

  // Paragraphs
  paragraphs: defineTable({
    content: v.string(),
    difficulty: v.optional(v.string()),
  }),

  // Time settings
  timeSettings: defineTable({
    duration: v.number(),
    label: v.optional(v.string()),
  }),

  // Results table
  results: defineTable({
    studentId: v.string(),              // roll number (STRING)
    paragraphId: v.id("paragraphs"),

    symbols: v.number(),
    seconds: v.number(),
    wpm: v.number(),
    accuracy: v.number(),

    text: v.optional(v.string()),

    paragraphContent: v.string(),       // snapshot stored permanently
    originalSymbols: v.number(),        // snapshot stored permanently

    submittedAt: v.string(),            // ISO timestamp
  })
    .index("by_student", ["studentId"])
    .index("by_paragraph", ["paragraphId"]),
});
