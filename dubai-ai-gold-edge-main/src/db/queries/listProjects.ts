import { db } from "@/db";
import { sql } from "drizzle-orm";

type ProjectRow = {
  id: string;
  name: string | null;
  startingPrice: number | null;
  downPayment: number | null;
  stock: string | null;
  deliveryDate: Date | null;
  image: string | null;
  hotness: number | null;

  developerId: number | null;
  developerName: string | null;
  developerLogo: string | null;

  propertyTypes: string[] | null;
  amenities: string[] | null;
};

export async function listProjects({
  limit,
  offset,
  filters,
}: {
  limit: number;
  offset: number;
  filters: {
    q?: string | null;
    developer?: number | null;
    sort?: string;
    priceMin?: number | null;
    priceMax?: number | null;
    propertyType?: string | null;
    delivery?: string | null;
    community?: string | null;
    hotnessMin?: number | null;
  };
}) {
  const where = sql`
    WHERE 1=1

    ${
      filters.community
        ? sql`AND p.location_id IN (
              SELECT l.location_id
              FROM locations l
              WHERE l.slug = ${filters.community}
            )`
        : sql``
    }

    ${filters.q ? sql`AND p.project_name ILIKE ${"%" + filters.q + "%"}` : sql``}

    ${filters.developer ? sql`AND p.developer_id = ${filters.developer}` : sql``}

    ${filters.priceMin ? sql`AND p.starting_price >= ${filters.priceMin}` : sql``}
    ${filters.priceMax ? sql`AND p.starting_price <= ${filters.priceMax}` : sql``}

    ${
      filters.hotnessMin
        ? sql`AND p.hotness_level >= ${filters.hotnessMin}`
        : sql``
    }

    ${
      filters.propertyType
        ? sql`AND EXISTS (
              SELECT 1
              FROM project_property_types ppt
              WHERE ppt.project_id = p.project_id
                AND ppt.property_type = ${filters.propertyType}
            )`
        : sql``
    }

    ${filters.delivery === "ready" ? sql`AND p.delivery_date <= NOW()` : sql``}
    ${filters.delivery === "upcoming" ? sql`AND p.delivery_date > NOW()` : sql``}
  `;

  const orderBy =
    filters.sort === "price-low"
      ? sql`ORDER BY p.starting_price ASC NULLS LAST`
      : filters.sort === "price-high"
      ? sql`ORDER BY p.starting_price DESC NULLS LAST`
      : filters.sort === "delivery"
      ? sql`ORDER BY p.delivery_date ASC NULLS LAST`
      : filters.sort === "hotness"
      ? sql`ORDER BY p.hotness_level DESC NULLS LAST`
      : sql`ORDER BY p.scraped_at DESC, p.project_id DESC`;

  const rows = await db.execute<ProjectRow>(sql`
    WITH filtered_projects AS (
      SELECT p.*
      FROM projects p
      ${where}
      ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}
    )

    SELECT
      fp.project_id AS id,
      fp.project_name AS name,
      fp.starting_price AS "startingPrice",
      fp.down_payment_percentage AS "downPayment",
      fp.stock_availability AS stock,
      fp.delivery_date AS "deliveryDate",
      fp.hotness_level AS hotness,

      d.developer_id AS "developerId",
      d.name AS "developerName",
      d.logo_url AS "developerLogo",

      img.image AS image,
      ppt.property_types AS "propertyTypes",
      am.amenities AS amenities

    FROM filtered_projects fp

    LEFT JOIN developers d
      ON d.developer_id = fp.developer_id

    -- ✅ SINGLE IMAGE (no explosion)
    LEFT JOIN LATERAL (
      SELECT pi.image_url AS image
      FROM project_images pi
      WHERE pi.project_id = fp.project_id
      LIMIT 1
    ) img ON true

    -- ✅ AGGREGATED PROPERTY TYPES
    LEFT JOIN LATERAL (
      SELECT array_agg(DISTINCT ppt.property_type) AS property_types
      FROM project_property_types ppt
      WHERE ppt.project_id = fp.project_id
    ) ppt ON true

    -- ✅ AGGREGATED AMENITIES
    LEFT JOIN LATERAL (
      SELECT array_agg(DISTINCT a.name) AS amenities
      FROM project_amenities pa
      JOIN amenities a ON a.amenity_id = pa.amenity_id
      WHERE pa.project_id = fp.project_id
    ) am ON true
  `);

  return rows.map((p) => ({
    ...p,
    propertyTypes: p.propertyTypes ?? [],
    amenities: p.amenities ?? [],
    developer: p.developerId
      ? {
          id: p.developerId,
          name: p.developerName,
          logo: p.developerLogo,
        }
      : null,
  }));
}