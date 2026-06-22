import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    const name = body.name?.trim();

    // ✅ Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // ✅ Check existing user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      const existingUser = existing[0];

      if (existingUser.provider === "google") {
        return NextResponse.json(
          {
            error:
              "This email is already registered with Google. Please continue with Google sign in.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // ✅ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ Insert user
    const inserted = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        provider: "credentials",
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    return NextResponse.json({ user: inserted[0] }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
