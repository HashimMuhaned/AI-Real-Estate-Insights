import { db } from "@/db";
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
};

export async function listProjects({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}) {
  const rows = await db.execute<RawRow>(sql`
   WITH paginated_projects AS (
    SELECT
        project_id,
        project_name,
        starting_price,
        down_payment_percentage,
        stock_availability,
        delivery_date
    FROM projects
    ORDER BY scraped_at DESC, project_id DESC
    LIMIT ${limit}
    OFFSET ${offset}
    )
    SELECT
      p.project_id        AS id,
      p.project_name      AS name,
      p.starting_price    AS "startingPrice",
      p.down_payment_percentage AS "downPayment",
      p.stock_availability AS stock,
      p.delivery_date     AS "deliveryDate",
      img.image_url       AS image,
      ppt.property_type   AS "propertyType",
      a.name              AS amenity
    FROM paginated_projects p
    LEFT JOIN project_images img ON img.project_id = p.project_id
    LEFT JOIN project_property_types ppt ON ppt.project_id = p.project_id
    LEFT JOIN project_amenities pa ON pa.project_id = p.project_id
    LEFT JOIN amenities a ON a.amenity_id = pa.amenity_id
  `);

  // Aggregate correctly
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
