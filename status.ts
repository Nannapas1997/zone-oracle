import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { getSubscriptionStatus } from "@/lib/subscriptionStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ isActive: false, error: "Not signed in" });
  }

  const isActive = getSubscriptionStatus(session.user.email);
  return res.json({ isActive });
}
