import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getCommunityProjectsBySlug(slug: string) {
  const result = await db.execute(sql`
    SELECT
      p.project_id AS "projectId",
      p.project_name AS "projectName",

      json_build_object(
        'id', d.developer_id,
        'name', d.name
      ) AS developer,

      p.starting_price AS "startingPrice",
      p.down_payment_percentage AS "downPaymentPercentage",

      p.construction_phase AS "constructionPhase",
      p.sales_phase AS "salesPhase",
      p.delivery_date AS "deliveryDate",

      p.stock_availability AS "stockAvailability",
      p.hotness_level AS "hotnessLevel"

    FROM projects p
    JOIN locations l
      ON l.location_id = p.location_id
    LEFT JOIN developers d
      ON d.developer_id = p.developer_id

    WHERE l.slug = ${slug}

    ORDER BY p.hotness_level DESC NULLS LAST;
  `);

  return result;
}
