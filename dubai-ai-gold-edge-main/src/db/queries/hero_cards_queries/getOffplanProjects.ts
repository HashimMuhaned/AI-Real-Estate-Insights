import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getOffPlanProjects() {
  const result = await db.execute(sql`
    WITH rent_data AS (
      SELECT
        r.project_number,
        PERCENTILE_CONT(0.5)
          WITHIN GROUP (ORDER BY r.annual_amount)::numeric AS median_rent
      FROM rents r
      WHERE
        r.ejari_bus_property_type_id = 3
        AND r.ejari_property_type_id = 1
        AND r.ejari_property_sub_type_en_id = 54
        AND r.annual_amount IS NOT NULL
      GROUP BY r.project_number
    ),

    transaction_data AS (
      SELECT
        t.project_number,
        PERCENTILE_CONT(0.5)
          WITHIN GROUP (ORDER BY t.actual_worth)::numeric AS median_price
      FROM transactions t
      WHERE
        t.reg_type_id = 0
        AND t.property_type_id = 3
        AND t.property_sub_type_id = 60
        AND substring(t.num_rooms_en FROM '^[0-9]+') = '1'
        AND t.actual_worth IS NOT NULL
      GROUP BY t.project_number
    ),

    roi_data AS (
      SELECT
        r.project_number,
        r.median_rent,
        t.median_price,
        (r.median_rent / NULLIF(t.median_price, 0)) * 100 AS roi
      FROM rent_data r
      JOIN transaction_data t
        ON r.project_number = t.project_number
    )

    SELECT
      dp.project_name_en AS name,
      ROUND(rd.roi, 2) AS roi
    FROM roi_data rd
    JOIN dim_project dp
      ON rd.project_number = dp.project_number
    WHERE rd.roi IS NOT NULL
    ORDER BY rd.roi DESC
    LIMIT 4 OFFSET 1;
  `);

  const rows = result as any[];

  const bestROI = rows[0]?.roi ? `${rows[0].roi}%` : "0%";

  return {
    bestROI,
    projects: rows.map(r => ({
      name: r.name,
      roi: Number(r.roi),
      status: "hot",
    })),
  };
}