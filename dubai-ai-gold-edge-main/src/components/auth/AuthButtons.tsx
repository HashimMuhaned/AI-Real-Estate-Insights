"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"; // shadcn button
import { useState } from "react";

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      // Use callbackUrl: false to prevent redirect
      // The session will update automatically via useSession
      await signIn("google", { 
        redirect: false,  // 👈 CRITICAL: Prevents page refresh
      });
      
      // Session will automatically update via useSession hook
      console.log("✅ Sign in completed without redirect");
    } catch (error) {
      console.error("❌ Sign in error:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

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

  return (
    <Button 
      onClick={handleSignIn}
      disabled={isSigningIn}
    >
      {isSigningIn ? "Signing in..." : "Sign In with Google"}
    </Button>
  );
}