import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// hash string using WebCrypto SHA-256
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // hex string
}

 //Admin: create a student record.
export const createStudent = mutation({
  args: {
    name: v.string(),
    applicationNumber: v.string(),
    dob: v.string(), // "DD-MM-YYYY"
  },

  handler: async (ctx, { name, applicationNumber, dob }) => {
    if (!name || !applicationNumber || !dob) {
      return { success: false, message: "Missing required fields" };
    }

    // first 4 letters of firstName + DDMMYYYY
    const firstName = name.trim().split(/\s+/)[0].toLowerCase();
    const firstFour = firstName.slice(0, 4);

    // dob = "DD-MM-YYYY"
    const [dd, mm, yyyy] = dob.split("-");

    // DDMMYYYY
    const ddmmyyyy = `${dd}${mm}${yyyy}`;

    // final password
    const generatedPassword = `${firstFour}${ddmmyyyy}`;

    // Hash password
    const passwordHash = await hashString(generatedPassword);

    // Check if existing
    const existing = await ctx.db
      .query("students")
      .withIndex("by_applicationNumber", (q) =>
        q.eq("applicationNumber", applicationNumber)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        dob,
        passwordHash,
      });

      return {
        success: true,
        updated: true,
        applicationNumber,
        generatedPassword,
      };
    }

    const inserted = await ctx.db.insert("students", {
      name,
      applicationNumber,
      dob,
      passwordHash,
    });

    return {
      success: true,
      insertedId: inserted._id,
      applicationNumber,
      generatedPassword,
    };
  },
});

// Verify student (login)
export const verifyStudent = mutation({
  args: {
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()), // legacy alias
  },

  handler: async (ctx, args) => {
    const username = args.username ?? args.name;
    const password = args.password;

    if (!username || !password) {
      return { success: false, message: "Missing username or password" };
    }

    const student = await ctx.db
      .query("students")
      .withIndex("by_applicationNumber", (q) =>
        q.eq("applicationNumber", username)
      )
      .first();

    if (!student) {
      return { success: false, message: "Invalid login credentials" };
    }

    const incomingHash = await hashString(password);

    if (incomingHash !== student.passwordHash) {
      return { success: false, message: "Invalid login credentials" };
    }

    return {
      success: true,
      studentId: student.applicationNumber,
    };
  },
});

// checkExists
export const checkExists = query({
  args: { studentId: v.string() },

  handler: async (ctx, { studentId }) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_applicationNumber", (q) =>
        q.eq("applicationNumber", studentId)
      )
      .first();

    return !!student;
  },
});
