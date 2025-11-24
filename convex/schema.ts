import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ⭐ Students table
  students: defineTable({
    name: v.string(),
    applicationNumber: v.string(),  // username
    dob: v.string(),                // YYYY-MM-DD
    passwordHash: v.string(),       // SHA-256 hash
  })
    .index("by_applicationNumber", ["applicationNumber"])
    .index("by_name", ["name"]),


  // Paragraphs table (unchanged)
  paragraphs: defineTable({
    content: v.string(),
  }),

  //Results table
  results: defineTable({
    studentId: v.string(),               // applicationNumber
    paragraphId: v.id("paragraphs"),
    symbols: v.number(),
    seconds: v.number(),
    accuracy: v.number(),
    wpm: v.number(),
    text: v.string(),
    paragraphContent: v.string(),
    originalSymbols: v.number(),
    submittedAt: v.string(),            // ISO timestamp
  })
    .index("by_student", ["studentId"])     // required for attempt blocking
    .index("by_submittedAt", ["submittedAt"]) // required for sorted results
});
