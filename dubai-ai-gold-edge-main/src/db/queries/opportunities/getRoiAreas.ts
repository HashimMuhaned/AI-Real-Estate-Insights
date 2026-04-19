import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getRoiAreas() {
  const result = await db.execute(sql`
    WITH rent_median AS (
      SELECT
        area_id,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annual_amount) AS median_rent
      FROM rents
      GROUP BY area_id
    ),
    price_median AS (
      SELECT
        area_id,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY actual_worth) AS median_price
      FROM transactions
      GROUP BY area_id
    ),
    area_names AS (
      SELECT DISTINCT ON (area_id)
        area_id,
        commercial_name,
        location_id
      FROM area_commercial_mapping
      ORDER BY area_id, confidence_score DESC NULLS LAST
    ),
    area_images AS (
      SELECT
        location_id,
        media_url
      FROM community_media
      WHERE is_primary = true
    )

    SELECT
      a.area_id,
      a.commercial_name AS name,
      rm.median_rent,
      pm.median_price,
      img.media_url AS image_url,
      ROUND(((rm.median_rent / NULLIF(pm.median_price, 0)) * 100)::numeric, 2) AS roi
    FROM area_names a
    JOIN rent_median rm ON rm.area_id = a.area_id
    JOIN price_median pm ON pm.area_id = a.area_id
    LEFT JOIN area_images img ON img.location_id = a.location_id
    ORDER BY roi DESC
    LIMIT 12;
  `);

  return result.map((r: any) => ({
    name: r.name,
    roi: Number(r.roi || 0),
    avgPrice: `AED ${Math.round(r.median_price)}/sqft`,
    imageUrl: r.image_url,
    aiNarrative: generateInsight(r),
  }));
}

function generateInsight(r: any) {
  const roi = Number(r.roi || 0);

  if (roi > 8) {
    return "Exceptionally strong rental yield driven by high tenant demand and limited supply.";
  }

  if (roi > 6) {
    return "Healthy investment zone with stable rental demand and balanced pricing.";
  }

  return "Moderate yield area with long-term capital appreciation potential.";
}