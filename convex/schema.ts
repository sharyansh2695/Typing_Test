import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  
  // students table
  students: defineTable({
    name: v.string(),
    rollNumber: v.string(),
  })
    .index("by_rollNumber", ["rollNumber"])
    .index("by_name", ["name"]),

  //paragraph-typing content
  paragraphs: defineTable({
    content: v.string(),                 // typing passage
    difficulty: v.optional(v.string()),  // easy | medium | hard 
  }),

  //timeSettings
  timeSettings: defineTable({
    duration: v.number(),                // e.g. 60 seconds
    label: v.optional(v.string()),       
  }),

 //Results Table
  results: defineTable({
    studentId: v.id("students"),         // FK → students table
    paragraphId: v.id("paragraphs"),     // FK → paragraphs table

    symbols: v.number(),                 // typed characters
    seconds: v.number(),                 // time used
    wpm: v.number(),                     // words per minute
    accuracy: v.number(),                // accuracy %

    text: v.optional(v.string()),        // full typed text (optional)

    createdAt: v.string(),               // ISO timestamp
  })
    .index("by_student", ["studentId"])
    .index("by_paragraph", ["paragraphId"]),
});
