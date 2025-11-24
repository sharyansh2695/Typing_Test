// pages/api/validate-test.js
import { validateSession } from "../../lib/sessionStore";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, token } = req.body;
  if (!userId || !token) {
    return res.status(400).json({ error: "Missing userId or token" });
  }

  // 🔧 In development, sessionStore resets — so skip validation locally
  const isDev = process.env.NODE_ENV === "development";
  const isValid = isDev ? true : validateSession(userId, token);

  if (!isValid) {
    return res.status(403).json({ error: "Invalid or expired session" });
  }

  res.status(200).json({ success: true });
}
