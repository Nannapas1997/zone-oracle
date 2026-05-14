import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSubscriptionStatus } from "@/lib/subscriptionStore";

export const authOptions: NextAuthOptions = {
  providers: [
    // ตัวเลือกที่ 1: Login ด้วย Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ตัวเลือกที่ 2: Login ด้วย Email + Password
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ⚠️ ตัวอย่างง่าย ๆ — ในโปรเจกต์จริงควรเชื่อม DB
        // ตอนนี้รับ email/password ใด ๆ ก็ได้ (เพื่อ test)
        if (credentials?.email && credentials?.password) {
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split("@")[0],
          };
        }
        return null;
      },
    }),
  ],

  // ใช้ JWT (ไม่ต้องมี DB สำหรับ session)
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token }) {
      // เช็ค subscription status จาก store
      if (token.email) {
        token.isSubscribed = getSubscriptionStatus(token.email);
      }
      return token;
    },

    async session({ session, token }) {
      // ส่ง subscription status ไปให้ client
      if (session.user) {
        (session.user as any).isSubscribed = token.isSubscribed ?? false;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",  // หน้า login ของเรา
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
