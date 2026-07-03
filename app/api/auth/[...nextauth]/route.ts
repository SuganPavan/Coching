/**
 * NextAuth catch-all route handler.
 *
 * This is the actual HTTP entry point for every NextAuth endpoint:
 *   GET  /api/auth/session
 *   GET  /api/auth/csrf
 *   POST /api/auth/callback/credentials   (sign-in)
 *   POST /api/auth/signout
 *   ...and others.
 *
 * `handlers` comes from the full Node.js-runtime config in auth.ts (which
 * includes the Credentials provider, dbConnect, and bcryptjs) — never from
 * auth.config.ts, which is the Edge-compatible subset used by middleware.ts.
 *
 * Without this file, none of the above endpoints exist and every NextAuth
 * client call (signIn(), signOut(), useSession(), etc.) 404s.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
