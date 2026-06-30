import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import { authConfig } from "@/auth.config";

/**
 * Full auth configuration for Node.js runtime only.
 *
 * Extends the edge-compatible authConfig with the Credentials provider,
 * which requires Mongoose (dbConnect + Admin model) and bcryptjs — none
 * of which are available in the Edge Runtime used by middleware.
 *
 * Imported by:
 *   - app/api/auth/[...nextauth]/route.ts
 *   - Server components that call auth() to read the session
 *
 * Never import this file from middleware.ts.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          await dbConnect();
          const admin = await Admin.findOne({
            email: (credentials.email as string).toLowerCase().trim(),
          });
          if (!admin) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            admin.password
          );
          if (!isValid) return null;

          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
          };
        } catch (error) {
          // Log server-side only — never leak error details to the client
          console.error("[Auth] authorize error:", error);
          return null;
        }
      },
    }),
  ],
});

