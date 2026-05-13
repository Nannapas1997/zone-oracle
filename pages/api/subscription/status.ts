// pages/api/subscription/status.ts
// Returns current user's subscription status from Clerk metadata.

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ isActive: false });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.publicMetadata as any;

  res.json({
    isActive: meta?.isActive === true,
    status: meta?.subscriptionStatus ?? "none",
    planId: meta?.planId ?? null,
    currentPeriodEnd: meta?.currentPeriodEnd ?? null,
  });
}
