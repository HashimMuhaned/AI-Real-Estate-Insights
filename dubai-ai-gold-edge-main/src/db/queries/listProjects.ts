import { db } from "@/db";
// import { db_demo_projects } from "@/db";
import { sql } from "drizzle-orm";

type RawRow = {
  id: string;
  name: string | null;
  startingPrice: number | null;
  downPayment: number | null;
  stock: string | null;
  deliveryDate: Date | null;
  image: string | null;
  propertyType: string | null;
  amenity: string | null;

  developerId: number | null;
  developerName: string | null;
  developerLogo: string | null;
  hotness: number | null;
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
    developer?: number | null; // ✅ NUMBER, not string
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
      ? sql`AND EXISTS (
          SELECT 1
          FROM locations l
          WHERE l.location_id = p.location_id
            AND l.slug = ${filters.community}
        )`
      : sql``
  }
  ${filters.q ? sql`AND p.project_name ILIKE ${"%" + filters.q + "%"}` : sql``}

  ${
    filters.developer
      ? sql`AND EXISTS (
        SELECT 1
        FROM developers d
        WHERE d.developer_id = p.developer_id
          ${
            filters.developer
              ? sql`AND p.developer_id = ${filters.developer}`
              : sql``
          }

      )`
      : sql``
  }

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
        SELECT 1 FROM project_property_types ppt
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
      : filters.sort === "hotness" // ✅ NEW
      ? sql`ORDER BY p.hotness_level DESC NULLS LAST`
      : sql`ORDER BY p.scraped_at DESC, p.project_id DESC`;

  const rows = await db.execute<RawRow>(sql`
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

    img.image_url AS image,
    ppt.property_type AS "propertyType",
    a.name AS amenity
  FROM filtered_projects fp
  LEFT JOIN developers d ON d.developer_id = fp.developer_id
  LEFT JOIN project_images img ON img.project_id = fp.project_id
  LEFT JOIN project_property_types ppt ON ppt.project_id = fp.project_id
  LEFT JOIN project_amenities pa ON pa.project_id = fp.project_id
  LEFT JOIN amenities a ON a.amenity_id = pa.amenity_id
`);

  const map = new Map<string, any>();

  for (const r of rows) {
    if (!map.has(r.id)) {
      map.set(r.id, {
        id: r.id,
        name: r.name,
        startingPrice: r.startingPrice,
        downPayment: r.downPayment,
        stock: r.stock,
        deliveryDate: r.deliveryDate,
        image: r.image,
        hotness: r.hotness,
        developer: r.developerId
          ? {
              id: r.developerId,
              name: r.developerName,
              logo: r.developerLogo,
            }
          : null,
        propertyTypes: new Set<string>(),
        amenities: new Set<string>(),
      });
    }

    if (r.propertyType) map.get(r.id).propertyTypes.add(r.propertyType);
    if (r.amenity) map.get(r.id).amenities.add(r.amenity);
  }

  return Array.from(map.values()).map((p) => ({
    ...p,
    propertyTypes: [...p.propertyTypes],
    amenities: [...p.amenities],
  }));
}
