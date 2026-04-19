import { db } from "@/db";
import { sql } from "drizzle-orm";

export type SupplyDemandRow = {
  year: string;
  supply: number;
  demand: number;
};

export async function getSupplyDemand(): Promise<SupplyDemandRow[]> {
  const result = await db.execute(sql`
    WITH yearly AS (
      SELECT
        EXTRACT(YEAR FROM instance_date)::int AS year,
        COUNT(*) AS demand
      FROM transactions
      WHERE instance_date IS NOT NULL
      GROUP BY 1
      ORDER BY 1
    ),
    supply_estimate AS (
      SELECT
        EXTRACT(YEAR FROM instance_date)::int AS year,
        COUNT(*) * 1.15 AS supply
      FROM transactions
      WHERE instance_date IS NOT NULL
      GROUP BY 1
      ORDER BY 1
    )
    SELECT
      y.year::text AS year,
      COALESCE(s.supply, 0) AS supply,
      y.demand AS demand
    FROM yearly y
    LEFT JOIN supply_estimate s USING (year)
    ORDER BY y.year
  `);

  const rows = result as unknown as Record<string, any>[];

  console.log(rows)

  return rows.map((r) => ({
    year: String(r.year),
    supply: Number(r.supply ?? 0),
    demand: Number(r.demand ?? 0),
  }));
}