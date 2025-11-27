import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a strong random session token
function randomToken() {
  return crypto.randomUUID() + crypto.randomUUID();
}


//    CREATE SESSION  (runs after successful login)
export const createSession = mutation({
  args: {
    studentId: v.string(),      // applicationNumber
    expiresInMs: v.number(),    // how long session is valid
  },

  handler: async (ctx, { studentId, expiresInMs }) => {
    const token = randomToken();
    const expiresAt = Date.now() + expiresInMs;

    await ctx.db.insert("sessions", {
      studentId,
      token,
      expiresAt,
      testActive: false,
    });

    console.log("CREATED SESSION TOKEN:", token, "expiresAt:", expiresAt);

    return { token, expiresAt };
  }
});

export const markTestActive = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!session) return { success: false };

    await ctx.db.patch(session._id, { testActive: true });

    return { success: true };
  }
});



  // VALIDATE SESSION (called on /test page)
export const validateSession = query({
  
  args: {
    token: v.string(),
  },

  handler: async (ctx, { token }) => {
 
    console.log("VALIDATE TOKEN RAW:", token);


    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

      console.log("VALIDATE FOUND SESSION:", session);


    if (!session) {
      return { valid: false };
    }

    if (session.expiresAt < Date.now()) {
      return { valid: false };
    }

   console.log("TEST ACTIVE STATE IN VALIDATE:", session.testActive);


    return {
      valid: true,
      studentId: session.studentId,
      testActive: session.testActive ?? false,
    };
    
  }

  
});



export const updateTestActive = mutation({
  args: {
    token: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, { token, active }) => {
    // Find session by token
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session) {
      console.log("⚠ No session found for token:", token);
      return { success: false };
    }

    // Update the field
    await ctx.db.patch(session._id, {
      testActive: active,
    });

    console.log("✅ Updated testActive to:", active);

    return { success: true };
  },
});

export const deleteOldSessions = mutation({
  args: { studentId: v.string() },

  handler: async (ctx, { studentId }) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    return { deleted: sessions.length };
  }
});


  // DELETE SESSION (logout)
export const deleteSession = mutation({
  args: {
    token: v.string(),
  },

  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  }
});
