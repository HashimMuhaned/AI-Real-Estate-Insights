import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  bigint,
  primaryKey,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  projectId: uuid("project_id").primaryKey().defaultRandom(),

  source: text("source").notNull(),
  sourceProjectId: text("source_project_id"),
  projectName: text("project_name"),

  developerId: integer("developer_id"),

  projectUrl: text("project_url").notNull().unique(),

  latitude: numeric("latitude"),
  longitude: numeric("longitude"),

  constructionPhase: text("construction_phase"),
  salesPhase: text("sales_phase"),
  deliveryDate: timestamp("delivery_date"),

  startingPrice: bigint("starting_price", { mode: "number" }),
  downPaymentPercentage: integer("down_payment_percentage"),
  stockAvailability: text("stock_availability"),

  scrapedAt: timestamp("scraped_at").defaultNow(),

  locationId: integer("location_id"),
});

export const projectAmenities = pgTable(
  "project_amenities",
  {
    projectId: uuid("project_id"),
    amenityId: integer("amenity_id"),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.amenityId),
  })
);

export const amenities = pgTable("amenities", {
  amenityId: integer("amenity_id").primaryKey(),
  name: text("name").notNull(),
});

export const projectPropertyTypes = pgTable(
  "project_property_types",
  {
    projectId: uuid("project_id"),
    propertyType: text("property_type"),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.propertyType),
  })
);

export const projectImages = pgTable(
  "project_images",
  {
    projectId: uuid("project_id"),
    imageUrl: text("image_url"),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.imageUrl),
  })
);