// db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  serial,
  integer,
  uniqueIndex,
  boolean,
  primaryKey,
  unique
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

export const communityProfiles = pgTable("community_profiles", {
  communityProfileId: serial("community_profile_id").primaryKey(),

  locationId: integer("location_id")
    .notNull()
    .unique()
    .references(() => locations.locationId, { onDelete: "cascade" }),

  description: text("description"),
  lifestyleSummary: text("lifestyle_summary"),
  populationEstimate: integer("population_estimate"),

  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow(),
});

export const communitySpecialClassifications = pgTable(
  "community_special_classifications",
  {
    classificationId: serial("classification_id").primaryKey(),

    locationId: integer("location_id")
      .notNull()
      .references(() => locations.locationId, { onDelete: "cascade" }),

    title: text("title").notNull(),
    classificationType: text("classification_type"),
    description: text("description"),

    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow(),
  }
);

export const amenitiesCommunity = pgTable("amenities_community", {
  amenityId: serial("amenity_id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const communityAmenities = pgTable(
  "community_amenities",
  {
    locationId: integer("location_id")
      .notNull()
      .references(() => locations.locationId, { onDelete: "cascade" }),

    amenityId: integer("amenity_id")
      .notNull()
      .references(() => amenitiesCommunity.amenityId, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.locationId, table.amenityId],
    }),
  })
);

export const roads = pgTable("roads", {
  roadId: serial("road_id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const communityRoads = pgTable(
  "community_roads",
  {
    locationId: integer("location_id")
      .notNull()
      .references(() => locations.locationId, { onDelete: "cascade" }),

    roadId: integer("road_id")
      .notNull()
      .references(() => roads.roadId, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.locationId, table.roadId],
    }),
  })
);


export const developers = pgTable(
  "developers",
  {
    developerId: serial("developer_id").primaryKey(),

    source: text("source").notNull(),
    sourceDevId: text("source_dev_id").notNull(),

    name: text("name"),
    logoUrl: text("logo_url"),
  },
  (table) => ({
    sourceDevUnique: unique("developers_source_source_dev_id_unique").on(
      table.source,
      table.sourceDevId
    ),
  })
);
