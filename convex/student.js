import { mutation } from "./_generated/server";

export const verifyStudent = mutation(async ({ db }, { name, rollNumber }) => {
  if (!name || !rollNumber) {
    return { success: false, message: "Missing name or roll number" };
  }

  // Match both name + roll number (avoids wrong login)
  const results = await db
    .query("students")
    .filter((q) => q.eq(q.field("rollNumber"), rollNumber))
    .filter((q) => q.eq(q.field("name"), name))
    .collect();

  const student = results.length ? results[0] : null;

  if (!student) {
    return { success: false, message: "Invalid login credentials" };
  }

  // Login success
  return { success: true, studentId: student.name };
});
