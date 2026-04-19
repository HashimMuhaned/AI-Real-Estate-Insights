import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getUndervaluedCommunities(limit = 5) {
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
    ),

    scored AS (
      SELECT
        a.area_id,
        a.commercial_name AS name,
        rm.median_rent,
        pm.median_price,
        img.media_url AS image_url,

        -- price-to-rent ratio
        (pm.median_price / NULLIF(rm.median_rent, 0)) AS price_to_rent,

        -- undervaluation score (normalized)
        ROUND(
        (
            (1 - (
            (pm.median_price / NULLIF(rm.median_rent, 0)) /
            NULLIF(
                AVG(pm.median_price / NULLIF(rm.median_rent, 0)) OVER (),
                0
            )
            )) * 100
        )::numeric
        , 2) AS score

      FROM area_names a
      JOIN rent_median rm ON rm.area_id = a.area_id
      JOIN price_median pm ON pm.area_id = a.area_id
      LEFT JOIN area_images img ON img.location_id = a.location_id
    )

    SELECT *
    FROM scored
    WHERE score IS NOT NULL
    ORDER BY score DESC
    LIMIT ${limit};
  `);

  return result.map((r: any) => ({
    name: r.name,
    score: Math.round(Number(r.score || 0)),
    insight: generateInsight(r),
    imageUrl: r.image_url || fallbackImage(),
    aiNarrative: generateNarrative(r),
  }));
}

// --- helpers

function generateInsight(r: any) {
  return "Price-to-rent ratio significantly below city baseline, indicating potential undervaluation.";
}

function generateNarrative(r: any) {
  const score = Number(r.score || 0);

  if (score > 80) {
    return "Strong undervaluation signal driven by rental demand outpacing capital appreciation. Market correction likely ahead.";
  }

  if (score > 60) {
    return "Moderate pricing inefficiency suggests opportunity for long-term value capture.";
  }

  return "Area is relatively efficiently priced with limited immediate upside.";
}

function fallbackImage() {
  return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80";
}