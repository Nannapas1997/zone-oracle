import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";  // ✅ ไม่มี [...] แล้ว
import { getSubscriptionStatus } from "@/lib/subscriptionStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ isActive: false, error: "Not signed in" });
    }

    const isActive = getSubscriptionStatus(session.user.email);
    return res.status(200).json({ isActive });

  } catch (err: any) {
    console.error("Subscription status error:", err);
    return res.status(500).json({ isActive: false, error: "Internal server error" });
  }
}