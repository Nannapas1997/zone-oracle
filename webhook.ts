import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { setSubscriptionStatus } from "@/lib/subscriptionStore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"]!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).json({ error: err.message });
  }

  // ดึง email ของลูกค้าจาก Stripe
  const getEmail = async (customerId: string): Promise<string | null> => {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).email;
  };

  try {
    switch (event.type) {
      // จ่ายเงินสำเร็จ → เปิด subscription
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const email = await getEmail(sub.customer as string);
        if (email) {
          const isActive = sub.status === "active" || sub.status === "trialing";
          setSubscriptionStatus(email, isActive);
          console.log(`✅ Subscription updated: ${email} → ${isActive}`);
        }
        break;
      }

      // ยกเลิก / หมดอายุ → ปิด subscription
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const email = await getEmail(sub.customer as string);
        if (email) {
          setSubscriptionStatus(email, false);
          console.log(`❌ Subscription cancelled: ${email}`);
        }
        break;
      }

      // จ่ายเงินไม่ผ่าน → ปิด subscription
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const email = await getEmail(invoice.customer as string);
        if (email) {
          setSubscriptionStatus(email, false);
          console.log(`⚠️ Payment failed: ${email}`);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: err.message });
  }
}
