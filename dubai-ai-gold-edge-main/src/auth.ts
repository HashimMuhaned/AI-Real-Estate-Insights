import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // check if user exists
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!));

        if (existing.length === 0) {
          // insert into db
          await db.insert(users).values({
            email: user.email!,
            name: user.name ?? null,
            passwordHash: null,
            provider: "google",
          });
        }
      }
      return true;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      // fetch user from DB
      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.email, session.user.email));

      if (dbUser.length > 0) {
        session.user.id = dbUser[0].id; // attach db id
        session.user.provider = dbUser[0].provider;
      }

      return session;
    },
  },
});
