// db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  serial,
  integer,
  uniqueIndex,
  boolean
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  provider: text("provider").default("credentials"), // "google" or "credentials"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dim_area = pgTable("dim_area", {
  id: serial("area_id").primaryKey(),
  name: text("area_name_en").notNull(),
});

export const locations = pgTable(
  "locations",
  {
    locationId: serial("location_id").primaryKey(),

    source: text("source").notNull(),
    sourceLocationId: text("source_location_id"),

    name: text("name").notNull(),
    slug: text("slug"),
    level: text("level"), // community, development, phase, etc.

    parentLocationId: integer("parent_location_id").references(
      () => locations.locationId
    ),
  },
  (table) => ({
    sourceUnique: uniqueIndex("locations_source_unique").on(
      table.source,
      table.sourceLocationId
    ),
  })
);

export const communityMedia = pgTable("community_media", {
  mediaId: serial("media_id").primaryKey(),

  locationId: integer("location_id")
    .notNull()
    .references(() => locations.locationId, { onDelete: "cascade" }),

  mediaType: text("media_type"), // hero | gallery | skyline
  mediaUrl: text("media_url").notNull(),
  source: text("source"),
  isPrimary: boolean("is_primary").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});