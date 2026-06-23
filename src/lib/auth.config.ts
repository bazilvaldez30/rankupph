import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import Google from "next-auth/providers/google";
import { features } from "./env";

/**
 * Edge-safe Auth.js config (no Prisma, no bcrypt) — imported by middleware.
 * The Credentials provider and Prisma adapter live in `auth.ts` (Node runtime).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Google only registered when configured; absent keys → graceful no-op.
    ...(features.googleAuth
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
