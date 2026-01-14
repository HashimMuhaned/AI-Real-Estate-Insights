import { db } from "@/db";
import { locations } from "@/db/schema";
import { communityMedia } from "@/db/schema";
import { eq, isNull, and, asc } from "drizzle-orm";

export async function getRootCommunitiesWithMedia() {
  const rows = await db
    .select({
      location_id: locations.locationId,
      name: locations.name,

      media_id: communityMedia.mediaId,
      media_url: communityMedia.mediaUrl,
      is_primary: communityMedia.isPrimary,
    })
    .from(locations)
    .leftJoin(
      communityMedia,
      eq(communityMedia.locationId, locations.locationId)
    )
    .where(
      and(
        isNull(locations.parentLocationId),
        eq(locations.level, "community")
      )
    )
    .orderBy(
      asc(locations.name),
      asc(communityMedia.createdAt)
    );

  // Group rows → communities[]
  const map = new Map<number, any>();

  for (const row of rows) {
    if (!map.has(row.location_id)) {
      map.set(row.location_id, {
        location_id: row.location_id,
        name: row.name,
        images: [],
      });
    }

    if (row.media_id) {
      map.get(row.location_id).images.push({
        media_id: row.media_id,
        media_url: row.media_url,
        is_primary: row.is_primary,
      });
    }
  }

  return Array.from(map.values());
}
