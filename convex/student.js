// convex/student.js
import { mutation } from "./_generated/server";

/**
 * verifyStudent mutation
 * Input: { name, rollNumber }
 * Output: { success: boolean, studentId?: string, message?: string }
 *
 * Adjust DB logic to match your schema (students collection/table).
 */
export const verifyStudent = mutation(async ({ db }, { name, rollNumber }) => {
  if (!name || !rollNumber) {
    return { success: false, message: "Missing name or roll number" };
  }

  // Example: look up student by rollNumber (adjust field name to your schema)
  const results = await db
    .query("students")
    .filter((q) => q.eq(q.field("rollNumber"), rollNumber))
    .collect();

  const student = results && results.length ? results[0] : null;

  if (!student) {
    return { success: false, message: "Student not found" };
  }

  // Optionally verify name matches
  if (student.name && student.name.toLowerCase() !== name.toLowerCase()) {
    return { success: false, message: "Name does not match record" };
  }

  return { success: true, studentId: student._id };
});
