// pages/api/subscription/status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // ตรวจสอบ path ไฟล์ authOptions ของคุณ
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ isActive: false });
  }

  try {
    // หา Customer จาก Email
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.json({ isActive: false, status: "none" });
    }

    // ดึง Subscription ล่าสุด
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "all",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.json({ isActive: false, status: "none" });
    }

    const sub = subscriptions.data[0];
    res.json({
      isActive: sub.status === "active" || sub.status === "trialing",
      status: sub.status,
      planId: sub.items.data[0]?.price.id,
      currentPeriodEnd: sub.current_period_end,
    });
  } catch (error) {
    res.status(500).json({ isActive: false });
  }
}