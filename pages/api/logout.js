// pages/api/logout.js
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("session="));

  if (match) {
    const raw = match.substring("session=".length);
    const token = decodeURIComponent(raw).replace(/^"|"$/g, "").trim();

    // attempt to delete session in Convex (server-side call)
    try {
      await convex.mutation("sessions.deleteSession", { token });
    } catch (e) {
      // ignore if fails
      console.error("Error deleting convex session", e);
    }
  }

  // Clear cookie in browser
  const isLocalhost = (req.headers.host || "").includes("localhost");
  const deleteCookie = [
    "session=;",
    "Path=/;",
    "HttpOnly;",
    "SameSite=Lax;",
    "Max-Age=0;",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT;",
    isLocalhost ? "" : "Secure;",
  ]
    .filter(Boolean)
    .join(" ");

  res.setHeader("Set-Cookie", deleteCookie);
  return res.status(200).json({ success: true });
}
