import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false });
  const { name, rollNumber } = req.body;

  try {
    const result = await convex.query(api.student.verifyStudent, { name, rollNumber });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
