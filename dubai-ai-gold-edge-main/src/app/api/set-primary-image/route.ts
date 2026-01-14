import { NextResponse } from "next/server";
import { db } from "@/db";
import { communityMedia } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { location_id, media_id } = await req.json();

    if (!location_id || !media_id) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      // Reset existing primary
      await tx
        .update(communityMedia)
        .set({ isPrimary: false })
        .where(eq(communityMedia.locationId, location_id));

      // Set new primary
      await tx
        .update(communityMedia)
        .set({ isPrimary: true })
        .where(eq(communityMedia.mediaId, media_id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update primary image" },
      { status: 500 }
    );
  }
}
