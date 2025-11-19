// pages/api/submit-test.js
import { validateSession, submitSession } from "../../lib/sessionStore";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, token, answers } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "Missing userId or token" });
  }

  // 🔧 Skip validation in dev (memory resets)
  const isDev = process.env.NODE_ENV === "development";
  const isValid = isDev ? true : validateSession(userId, token);

  if (!isValid) {
    return res.status(403).json({ error: "Invalid or expired session" });
  }

  // 🧠 Save answers to DB or Convex (placeholder)
 // console.log(`User ${userId} submitted answers:`, answers);

  // ✅ Mark test as submitted
  submitSession(userId);

  res.status(200).json({ success: true });
}
