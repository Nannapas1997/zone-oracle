// pages/api/stripe/create-checkout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // ใช้ Path ที่คุณสร้างไฟล์ไว้

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ดึง Session ด้วย NextAuth
  const sessionAuth = await getServerSession(req, res, authOptions);

  // ตรวจสอบความถูกต้องของ User
  if (!sessionAuth || !sessionAuth.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { plan } = req.body;

  const priceId =
    plan === "yearly"
      ? process.env.STRIPE_PRICE_YEARLY!
      : process.env.STRIPE_PRICE_MONTHLY!;

  // ดึง User ID และ Email จาก Session
  const userId = (sessionAuth.user as any).id;
  const userEmail = sessionAuth.user.email;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail ?? undefined,
      metadata: { 
        userId: userId 
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
      subscription_data: {
        metadata: { 
          userId: userId 
        },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return res.status(500).json({ error: err.message });
  }
}