// pages/api/start-test.js
import { ConvexHttpClient } from "convex/browser";
import { createSession as fallbackCreate } from "../../lib/sessionStore";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:8187";
const client = new ConvexHttpClient(convexUrl);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // try Convex server function sessions.createSession (if exists)
    const result = await client.mutation({ name: "sessions.createSession" }, { userId });
    if (result?.token) return res.status(200).json({ testToken: result.token });
  } catch (err) {
    console.warn("Convex createSession failed:", err && err.message ? err.message : err);
  }
  // fallback to in-memory session
  const token = fallbackCreate(userId);
  return res.status(200).json({ testToken: token });
}
