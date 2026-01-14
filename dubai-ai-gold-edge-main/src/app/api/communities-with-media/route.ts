import { NextResponse } from "next/server";
import { getRootCommunitiesWithMedia } from "@/db/queries/adminCommunities";

export async function GET() {
  try {
    const communities = await getRootCommunitiesWithMedia();
    return NextResponse.json(communities);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}
