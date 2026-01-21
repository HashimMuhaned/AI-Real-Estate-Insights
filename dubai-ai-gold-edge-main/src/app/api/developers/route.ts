import { NextResponse } from "next/server";
import { getDevelopers } from "@/db/queries/listDevelopers";

export async function GET() {
  try {
    const developers = await getDevelopers();

    return NextResponse.json({
      developers,
    });
  } catch (error) {
    console.error("Failed to fetch developers:", error);

    return NextResponse.json(
      { error: "Failed to fetch developers" },
      { status: 500 }
    );
  }
}
