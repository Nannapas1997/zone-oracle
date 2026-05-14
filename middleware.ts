// middleware.ts — NextAuth route protection
// ป้องกัน /dashboard ให้ต้อง login ก่อน
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard(.*)"],
};
