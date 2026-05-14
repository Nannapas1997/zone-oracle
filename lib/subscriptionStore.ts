/**
 * subscriptionStore.ts
 * เก็บ subscription status แทน Clerk metadata
 *
 * ⚠️ หมายเหตุ: ตอนนี้เก็บใน memory (หายเมื่อ server restart)
 * แนะนำให้เพิ่ม DB (เช่น PlanetScale, Supabase) ในอนาคต
 */

// email → isActive
const subscriptions = new Map<string, boolean>();

export function setSubscriptionStatus(email: string, isActive: boolean) {
  subscriptions.set(email, isActive);
  console.log(`[Store] ${email} → isActive: ${isActive}`);
}

export function getSubscriptionStatus(email: string): boolean {
  return subscriptions.get(email) ?? false;
}
