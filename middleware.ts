import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/** Role-gated route prefixes. */
const ROUTE_GUARDS: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/provider", roles: ["PROVIDER", "ADMIN"] },
  { prefix: "/dashboard", roles: ["CUSTOMER", "PROVIDER", "ADMIN"] },
];

const AUTH_PAGES = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const role = session?.user?.role;
  const path = nextUrl.pathname;

  // Signed-in users shouldn't see login/register.
  if (AUTH_PAGES.some((p) => path.startsWith(p))) {
    if (session) {
      const dest =
        role === "ADMIN"
          ? "/admin"
          : role === "PROVIDER"
            ? "/provider"
            : "/dashboard";
      return NextResponse.redirect(new URL(dest, nextUrl));
    }
    return NextResponse.next();
  }

  const guard = ROUTE_GUARDS.find((g) => path.startsWith(g.prefix));
  if (!guard) return NextResponse.next();

  if (!session) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (!role || !guard.roles.includes(role)) {
    // Authenticated but wrong role → send to their own home.
    const dest =
      role === "ADMIN"
        ? "/admin"
        : role === "PROVIDER"
          ? "/provider"
          : "/dashboard";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/provider/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
