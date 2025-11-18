// pages/api/test.js
import { validateSession as fallbackValidate } from "../../lib/sessionStore";
import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:8187";
const client = new ConvexHttpClient(convexUrl);

/**
 * Validates session token and ensures user can access the test page.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "Missing userId or token" });
  }

  try {
    // ✅ Try validating session from Convex first
    const isValid = await client.query("sessions:validateSession", { userId, token });

    if (isValid) {
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.warn("Convex session validation failed:", error?.message || error);
  }

  // Fallback to local validation (useful in dev mode)
  const isDev = process.env.NODE_ENV === "development";
  const isStillValid = isDev ? true : fallbackValidate(userId, token);

  if (!isStillValid) {
    return res.status(403).json({ error: "Invalid or expired session" });
  }

  return res.status(200).json({ success: true });
}
