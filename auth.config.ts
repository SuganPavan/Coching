import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth configuration.
 *
 * This file is intentionally kept free of any Node.js-only imports
 * (Mongoose, bcryptjs, etc.) because it is imported by middleware.ts,
 * which runs in the Next.js Edge Runtime. The Edge Runtime is a
 * restricted environment that does not support most Node.js built-ins.
 *
 * The full config (with the Credentials provider, dbConnect, Admin model,
 * and bcryptjs) lives in auth.ts and is only imported by:
 *   - app/api/auth/[...nextauth]/route.ts  (Node.js API route)
 *   - Server components that call auth() to read the session
 *
 * middleware.ts imports NextAuth from THIS file only.
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  callbacks: {
    /**
     * JWT callback runs on every session read.
     * Preserves the custom `role` and `id` fields set during sign-in.
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "admin";
        token.id = user.id;
      }
      return token;
    },

    /**
     * Session callback shapes what's returned to the client.
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },

    /**
     * Authorized callback: called by middleware to decide whether a request
     * is allowed. Returning false triggers a redirect to the signIn page.
     * Keeping logic minimal here — the middleware file itself handles the
     * more nuanced routing (already-logged-in redirect from /login, etc.).
     */
    authorized({ auth }) {
      // Simply expose session state; routing logic lives in middleware.ts
      return true;
    },
  },

  // No providers here — Credentials (with Mongoose + bcrypt) are added
  // only in auth.ts which runs in the Node.js runtime.
  providers: [],

  trustHost: true,
};
