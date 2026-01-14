import { NextResponse } from "next/server";
import { getRootCommunities } from "@/db/queries/listLocations";

export async function GET() {
  try {
    const communities = await getRootCommunities();
    return NextResponse.json(communities);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}
