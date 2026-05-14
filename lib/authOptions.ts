import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSubscriptionStatus } from "@/lib/subscriptionStore";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
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
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      if (token.email) {
        token.isSubscribed = getSubscriptionStatus(token.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).isSubscribed = token.isSubscribed ?? false;
      }
      return session;
    },
  },
  pages: { signIn: "/sign-in" },
  secret: process.env.NEXTAUTH_SECRET,
};