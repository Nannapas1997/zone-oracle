import { NextAuthOptions } from "next-auth";
// Import providers ที่คุณใช้งาน เช่น Google, Credentials, etc.

export const authOptions: NextAuthOptions = {
  providers: [
    // ใส่ Provider ของคุณที่นี่
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        // เพิ่ม id เข้าไปใน session เพื่อให้ Stripe นำไปใช้งานได้
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  // การตั้งค่าอื่นๆ เช่น secret, pages
};