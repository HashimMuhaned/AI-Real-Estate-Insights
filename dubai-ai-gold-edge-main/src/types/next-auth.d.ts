import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
  }

  interface Session {
    user?: User;
  }

  interface User extends DefaultUser {
    provider: string;
  }
}
