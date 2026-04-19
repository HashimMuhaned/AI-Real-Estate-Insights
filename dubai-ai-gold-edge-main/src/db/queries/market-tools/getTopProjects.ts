import { db } from "@/db";
import { sql } from "drizzle-orm";

export type TopProjectRow = {
  project_number: number;
  project_name: string;
  area: string;
  transactions: number;
  prevTransactions: number;
  trend: "up" | "down" | "flat";
};

export async function getTopProjects(): Promise<TopProjectRow[]> {
  const result = await db.execute(sql`
    WITH project_tx AS (
      SELECT
        t.project_number,
        t.area_id,
        COUNT(*) FILTER (
          WHERE t.instance_date >= CURRENT_DATE - INTERVAL '1 year'
        ) AS current_tx,
        COUNT(*) FILTER (
          WHERE t.instance_date < CURRENT_DATE - INTERVAL '1 year'
          AND t.instance_date >= CURRENT_DATE - INTERVAL '2 year'
        ) AS prev_tx
      FROM transactions t
      WHERE t.project_number IS NOT NULL
      GROUP BY t.project_number, t.area_id
    )
    SELECT
      pt.project_number,
      dp.project_name_en AS project_name,
      acm.commercial_name AS area,
      pt.current_tx AS transactions,
      pt.prev_tx AS "prevTransactions",
      CASE
        WHEN pt.current_tx > pt.prev_tx THEN 'up'
        WHEN pt.current_tx < pt.prev_tx THEN 'down'
        ELSE 'flat'
      END AS trend
    FROM project_tx pt
    JOIN dim_project dp ON dp.project_number = pt.project_number
    JOIN area_commercial_mapping acm ON acm.area_id = pt.area_id
    ORDER BY pt.current_tx DESC
  `);

  const rows = result as unknown as Record<string, any>[];
  // console.log(rows)

  return rows.map((r) => ({
    project_number: Number(r.project_number),
    project_name: String(r.project_name ?? ""),
    area: String(r.area ?? ""),
    transactions: Number(r.transactions ?? 0),
    prevTransactions: Number(r.prevTransactions ?? 0),
    trend: (r.trend ?? "flat") as "up" | "down" | "flat",
  }));
}