// pages/api/stripe/webhook.ts
// Stripe sends events here when payment succeeds/fails/cancels.
// We write subscription status to Clerk's user metadata.

import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { buffer } from "micro";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"]!;
  const rawBody = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const clerk = await clerkClient();

  switch (event.type) {
    // ── Payment succeeded → grant access ──────────────────────────────────
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const isActive = sub.status === "active" || sub.status === "trialing";
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          subscriptionStatus: sub.status,
          subscriptionId: sub.id,
          planId: sub.items.data[0]?.price.id,
          isActive,
          currentPeriodEnd: new Date((sub as any).current_period_end * 1000).toISOString(),
        },
      });
      console.log(`✅ Subscription ${sub.status} for user ${userId}`);
      break;
    }

    // ── Subscription cancelled/expired → revoke access ────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          subscriptionStatus: "cancelled",
          isActive: false,
          subscriptionId: null,
        },
      });
      console.log(`❌ Subscription cancelled for user ${userId}`);
      break;
    }

    // ── Payment failed ────────────────────────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = (invoice.subscription_details?.metadata as any)?.userId;
      if (!userId) break;

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { subscriptionStatus: "past_due", isActive: false },
      });
      break;
    }
  }

  res.json({ received: true });
}
