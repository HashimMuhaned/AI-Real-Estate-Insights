import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getOffPlanProjects(limit = 5) {
  const result = await db.execute(sql`
    WITH project_main AS (
      SELECT
        p.project_id,
        p.project_name,
        p.starting_price,
        p.delivery_date,
        p.developer_id,
        p.location_id
      FROM projects p
      WHERE p.project_name IS NOT NULL
    ),

    developer_data AS (
      SELECT
        developer_id,
        name AS developer_name
      FROM developers
    ),

    project_image AS (
      SELECT DISTINCT ON (project_id)
        project_id,
        image_url
      FROM project_images
      ORDER BY project_id
    )

    SELECT
      pm.project_id,
      pm.project_name,
      pm.starting_price,
      pm.delivery_date,
      d.developer_name,
      img.image_url
    FROM project_main pm
    LEFT JOIN developer_data d
      ON d.developer_id = pm.developer_id
    LEFT JOIN project_image img
      ON img.project_id = pm.project_id
    ORDER BY pm.delivery_date ASC NULLS LAST
    LIMIT ${limit};
  `);

  return result.map((p: any) => ({
    name: p.project_name,
    area: p.developer_name, // or replace with location later if you want
    priceRange: formatPrice(p.starting_price),
    completionYear: p.delivery_date
      ? new Date(p.delivery_date).getFullYear()
      : null,
    imageUrl: p.image_url || fallbackImage(),
    aiNarrative: generateInsight(p),
  }));
}

// helpers
function formatPrice(price: number) {
  if (!price) return "N/A";
  return `AED ${(price / 1_000_000).toFixed(1)}M+`;
}

function fallbackImage() {
  return "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80";
}

function generateInsight(p: any) {
  return `${p.project_name} by ${p.developer_name} shows strong off-plan demand with structured payment flexibility and long-term appreciation potential.`;
}