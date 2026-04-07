// db/queries/getAreaInsights.ts
import { db } from "@/db"; // your drizzle instance
import { sql } from "drizzle-orm";

export const getAreasDisplayCards = async () => {
  const result = await db.execute(sql`
    SELECT DISTINCT ON (bs.area_id)
        bs.area_id,
        bs.best_segment,

        acm.commercial_name AS location_name,
        acm.official_area_name_en AS area_name,

        cm.media_url AS image_url,

        ROUND(s.avg_sale_price::numeric, 0) AS avg_sale_price,
        ROUND(r.avg_rent::numeric, 0) AS avg_annual_rent,

        ROUND((r.avg_rent / NULLIF(s.avg_sale_price,0) * 100)::numeric, 2) AS yield,

        ROUND(((g.price_2025 - g.price_2024) / NULLIF(g.price_2024,0) * 100)::numeric, 2) AS growth,

        s.tx_count AS num_transactions,

        ROUND((
            0.4 * (r.rent_stddev / NULLIF(r.avg_rent,0)) +
            0.4 * (s.price_stddev / NULLIF(s.avg_sale_price,0)) +
            0.2 * (COALESCE(sp.supply_count,0)::numeric / NULLIF(s.tx_count,0))
        )::numeric, 4) AS risk,

        COALESCE(sp.supply_count, 0) AS supply

    FROM area_best_segment bs

    LEFT JOIN area_segment_stats s
        ON bs.area_id = s.area_id
       AND bs.property_type = s.property_type
       AND bs.rooms = s.rooms

    LEFT JOIN area_segment_rent_stats r
        ON bs.area_id = r.area_id
       AND bs.property_type = r.property_type
       AND bs.rooms = r.rooms

    LEFT JOIN area_segment_growth g
        ON bs.area_id = g.area_id
       AND bs.property_type = g.property_type
       AND bs.rooms = g.rooms

    LEFT JOIN area_supply sp
        ON bs.area_id = sp.area_id

    LEFT JOIN LATERAL (
        SELECT 
            location_id,
            commercial_name,
            official_area_name_en
        FROM area_commercial_mapping acm
        WHERE acm.area_id = bs.area_id
        ORDER BY 
            acm.is_validated DESC,
            acm.confidence_score DESC NULLS LAST
        LIMIT 1
    ) acm ON TRUE

    LEFT JOIN community_media cm
        ON acm.location_id = cm.location_id
       AND cm.is_primary = true

    ORDER BY bs.area_id;
  `);

  return result;
};