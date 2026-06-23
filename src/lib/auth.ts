import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { loginSchema } from "./validations/auth";
import type { Role } from "@prisma/client";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});

// ── Server helpers ───────────────────────────────────────────

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Throws if not signed in; returns the session user otherwise. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("UNAUTHENTICATED");
  return user;
}

/** Throws unless the signed-in user has one of the allowed roles. (API routes) */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthError("FORBIDDEN");
  return user;
}

function roleHome(role?: Role): string {
  if (role === "ADMIN") return "/admin";
  if (role === "PROVIDER") return "/provider";
  return "/dashboard";
}

/**
 * Page-level guard for server components: redirects (never throws) so a
 * logged-out or wrong-role visitor lands somewhere sensible instead of a 500.
 * Defense-in-depth behind middleware.
 */
export async function requirePageRole(roles: Role[], callbackPath: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  if (!roles.includes(user.role)) redirect(roleHome(user.role));
  return user;
}

export class AuthError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(code);
    this.name = "AuthError";
  }
}
