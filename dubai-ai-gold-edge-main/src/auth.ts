import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (user.length === 0) {
          return null;
        }

        const dbUser = user[0];

        // Google account trying password login
        if (dbUser.provider !== "credentials") {
          throw new Error(
            "This account uses Google sign in. Please continue with Google.",
          );
        }

        const isValid = await bcrypt.compare(password, dbUser.passwordHash!);

        if (!isValid) {
          return null;
        }

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          provider: dbUser.provider,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase().trim();

        if (!email) return false;

        // ✅ check if user exists
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (existing.length === 0) {
          try {
            // ✅ insert safely
            await db.insert(users).values({
              email,
              name: user.name?.trim() ?? null,
              passwordHash: null,
              provider: "google",
            });
          } catch (err) {
            // 🔒 fallback in case of race condition (duplicate insert)
            console.error("Google signup insert error:", err);
          }
        }
      }

      return true;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      const email = session.user?.email?.toLowerCase();

      if (!email) return session;

      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (dbUser.length > 0) {
        session.user.id = dbUser[0].id;
        session.user.provider = dbUser[0].provider;
      }

      return session;
    },
  },

  // ✅ OPTIONAL but recommended
  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
});
