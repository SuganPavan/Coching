import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

/**
 * Middleware uses the Edge-compatible authConfig, NOT auth.ts.
 *
 * auth.ts imports Mongoose, bcryptjs, and dbConnect — none of which are
 * available in the Next.js Edge Runtime. Importing auth.ts from middleware
 * causes the crash:
 *   "mongoose is not defined" / models.Admin error at middleware.js:23
 *
 * authConfig has no such imports — only JWT/session callbacks that read
 * the signed cookie, which is all middleware ever needs to do.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Already-logged-in admin visiting /login → skip the form, go to dashboard
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Unauthenticated request to any /admin/* route → redirect to login
  if (pathname.startsWith("/admin") && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    // Store only the relative path to prevent open redirect attacks
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  // Run on /login (already-logged-in redirect) and all /admin/* routes.
  // Static assets, _next internals, and API routes are excluded so the
  // Edge function doesn't run on every file request.
  matcher: ["/login", "/admin/:path*"],
};
