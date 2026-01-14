import { db } from "@/db";
import { locations } from "@/db/schema";
import { and, isNull, eq, sql } from "drizzle-orm";

export async function getRootCommunities() {
  return await db.execute(sql`
WITH RECURSIVE location_tree AS (
    SELECT
        l.location_id AS root_location_id,
        l.location_id
    FROM locations l
    WHERE l.parent_location_id IS NULL
      AND l.level = 'community'

    UNION ALL

    SELECT
        lt.root_location_id,
        l.location_id
    FROM locations l
    JOIN location_tree lt
      ON l.parent_location_id = lt.location_id
),
price_stats AS (
    SELECT
        lt.root_location_id,
        ppt.property_type,
        ROUND(AVG(p.starting_price)) AS avg_starting_price,
        COUNT(DISTINCT p.project_id) AS project_count
    FROM location_tree lt
    JOIN projects p
      ON p.location_id = lt.location_id
    JOIN project_property_types ppt
      ON ppt.project_id = p.project_id
    WHERE p.starting_price IS NOT NULL
    GROUP BY lt.root_location_id, ppt.property_type
),
primary_images AS (
    SELECT DISTINCT ON (cm.location_id)
        cm.location_id,
        cm.media_url
    FROM community_media cm
    ORDER BY cm.location_id, cm.is_primary DESC NULLS LAST, cm.created_at DESC
)

SELECT
    l.location_id AS id,
    l.name,
    l.slug,
    pi.media_url AS image,
    COALESCE(SUM(ps.project_count), 0) AS project_count,
    json_agg(
        json_build_object(
            'property_type', ps.property_type,
            'avg_starting_price', ps.avg_starting_price
        )
        ORDER BY ps.avg_starting_price
    ) FILTER (WHERE ps.property_type IS NOT NULL) AS avg_prices
FROM locations l
LEFT JOIN price_stats ps
  ON ps.root_location_id = l.location_id
LEFT JOIN primary_images pi
  ON pi.location_id = l.location_id
WHERE l.parent_location_id IS NULL
  AND l.level = 'community'
GROUP BY l.location_id, l.name, l.slug, pi.media_url
ORDER BY l.name;


  `);
}

export async function getCommunityBySlug(slug: string) {
  const [community] = await db
    .select()
    .from(locations)
    .where(eq(locations.slug, slug))
    .limit(1);

  return community;
}
