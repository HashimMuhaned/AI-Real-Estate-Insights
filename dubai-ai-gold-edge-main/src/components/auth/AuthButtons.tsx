"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"; // shadcn button

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={session.user?.image ?? "/default-avatar.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
        {/* <span>{session.user?.name}</span> */}
        <Button onClick={() => signOut()}>Sign Out</Button>
      </div>
    );
  }

  return <Button onClick={() => signIn("google")}>Sign In with Google</Button>;
}
