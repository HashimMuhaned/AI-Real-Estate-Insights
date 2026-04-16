import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getTransactionMix() {
  const result = await db.execute(sql`
    WITH categorized AS (
      SELECT
        CASE
          WHEN t.property_type_id = 1 THEN 'Land'
          WHEN t.property_type_id = 2 THEN 'Building'
          WHEN t.property_type_id = 4 THEN 'Villa'
          WHEN t.property_type_id = 3 AND t.property_sub_type_id = 60 THEN 'Apartment'
        END AS category
      FROM transactions t
      WHERE 
        t.property_type_id IN (1,2,3,4)
        AND t.instance_date >= CURRENT_DATE - INTERVAL '12 months'
    ),

    counts AS (
      SELECT
        category,
        COUNT(*) AS count
      FROM categorized
      WHERE category IS NOT NULL
      GROUP BY category
    ),

    total AS (
      SELECT SUM(count) AS total FROM counts
    )

    SELECT
      c.category AS label,
      c.count,
      t.total,
      ROUND((c.count * 100.0 / t.total)::numeric, 0) AS value
    FROM counts c, total t
    ORDER BY value DESC;
  `);

  const rows = result;

  const colorMap: Record<string, string> = {
    Apartment: "#a855f7",
    Villa: "#ec4899",
    Building: "#6366f1",
    Land: "#8b5cf6",
  };

  const total = Number(rows[0]?.total || 0);

  return {
    total: new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(total),
    mix: rows.map((r: any) => ({
      label: r.label,
      value: Number(r.value),
      color: colorMap[r.label] || "#999",
    })),
  };
}
