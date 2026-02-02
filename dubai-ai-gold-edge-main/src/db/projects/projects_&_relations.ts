import {
  pgTable,
  uuid,
  serial,
  text,
  integer,
  numeric,
  bigint,
  timestamp,
  date,
  primaryKey,
  unique,
  boolean,
} from "drizzle-orm/pg-core";
import { developers } from "../schema";
import { locations } from "../schema";
import { sql } from "drizzle-orm";

export const projects = pgTable("projects", {
  projectId: uuid("project_id").defaultRandom().primaryKey(),

  source: text("source").notNull(),
  sourceProjectId: text("source_project_id"),
  projectName: text("project_name"),

  developerId: integer("developer_id").references(() => developers.developerId),

  projectUrl: text("project_url").notNull().unique(),

  rawLocationName: text("raw_location_name"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),

  constructionPhase: text("construction_phase"),
  salesPhase: text("sales_phase"),
  deliveryDate: timestamp("delivery_date"),

  startingPrice: bigint("starting_price", { mode: "number" }),
  downPaymentPercentage: integer("down_payment_percentage"),
  stockAvailability: text("stock_availability"),
  hotnessLevel: integer("hotness_level"),

  scrapedAt: timestamp("scraped_at").defaultNow(),

  locationId: integer("location_id").references(() => locations.locationId),
});

export const amenities = pgTable(
  "amenities",
  {
    amenityId: serial("amenity_id").primaryKey(),
    source: text("source").notNull(),
    sourceAmenityId: text("source_amenity_id").notNull(),
    name: text("name").notNull(),
  },
  (t) => ({
    uniq: unique().on(t.source, t.sourceAmenityId),
  })
);

export const projectAmenities = pgTable(
  "project_amenities",
  {
    projectId: uuid("project_id")
      .references(() => projects.projectId, { onDelete: "cascade" })
      .notNull(),
    amenityId: integer("amenity_id")
      .references(() => amenities.amenityId, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.amenityId),
  })
);

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

export const projectBedrooms = pgTable(
  "project_bedrooms",
  {
    projectId: uuid("project_id")
      .references(() => projects.projectId, { onDelete: "cascade" })
      .notNull(),
    bedroomCount: integer("bedroom_count").notNull(),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.bedroomCount),
  })
);

export const projectPaymentPlans = pgTable(
  "project_payment_plans",
  {
    projectId: uuid("project_id")
      .references(() => projects.projectId, { onDelete: "cascade" })
      .notNull(),
    paymentPlan: text("payment_plan").notNull(),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.paymentPlan),
  })
);

export const projectContacts = pgTable(
  "project_contacts",
  {
    projectId: uuid("project_id")
      .references(() => projects.projectId, { onDelete: "cascade" })
      .notNull(),
    contactType: text("contact_type").notNull(),
    contactLink: text("contact_link").notNull(),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.contactType, t.contactLink),
  })
);

export const projectSalesSnapshot = pgTable("project_sales_snapshot", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.projectId, { onDelete: "cascade" }),

  constructionPhase: text("construction_phase"),
  salesPhase: text("sales_phase"),
  stockAvailability: text("stock_availability"),

  startingPrice: bigint("starting_price", { mode: "number" }),
  downPaymentPercentage: integer("down_payment_percentage"),
  hotnessLevel: integer("hotness_level"),

  constructionProgress: numeric("construction_progress"),
  deliveryDate: date("delivery_date"),
  lastInspectionDate: date("last_inspection_date"),

  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectSalesHistory = pgTable("project_sales_history", {
  id: bigint("id", { mode: "number" }).primaryKey(),

  projectId: uuid("project_id").references(() => projects.projectId, {
    onDelete: "cascade",
  }),

  startingPrice: bigint("starting_price", { mode: "number" }),
  salesPhase: text("sales_phase"),
  stockAvailability: text("stock_availability"),
  hotnessLevel: integer("hotness_level"),

  capturedAt: timestamp("captured_at").notNull(),
});

export const projectFaqs = pgTable(
  "project_faqs",
  {
    projectId: uuid("project_id")
      .references(() => projects.projectId, { onDelete: "cascade" })
      .notNull(),
    question: text("question").notNull(),
    answerHtml: text("answer_html"),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.question),
  })
);

export const projectMedia = pgTable("project_media", {
  mediaId: uuid("media_id").defaultRandom().primaryKey(),

  projectId: uuid("project_id").references(() => projects.projectId, {
    onDelete: "cascade",
  }),

  mediaType: text("media_type"),
  sourceUrl: text("source_url").notNull(),
  variantMedium: text("variant_medium"),
});

export const projectMasterPlan = pgTable("project_master_plan", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.projectId, { onDelete: "cascade" }),

  descriptionHtml: text("description_html"),
  imageUrl: text("image_url"),
});

export const propertyTypes = pgTable("property_types", {
  propertyType: text("property_type").primaryKey(),
});

export const unitCategories = pgTable(
  "unit_categories",
  {
    unitCategoryId: uuid("unit_category_id")
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),

    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),

    propertyType: text("property_type")
      .notNull()
      .references(() => propertyTypes.propertyType),

    bedrooms: integer("bedrooms").notNull(),

    areaFrom: integer("area_from").notNull(),
    areaTo: integer("area_to").notNull(),

    bathroomsFrom: integer("bathrooms_from"),
    bathroomsTo: integer("bathrooms_to"),

    startingPrice: bigint("starting_price", { mode: "number" }),
    totalUnits: integer("total_units"),
  },
  (t) => ({
    uniq: unique().on(
      t.projectId,
      t.propertyType,
      t.bedrooms,
      t.areaFrom,
      t.areaTo
    ),
  })
);

export const unitLayouts = pgTable("unit_layouts", {
  layoutId: uuid("layout_id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey(),

  unitCategoryId: uuid("unit_category_id")
    .notNull()
    .references(() => unitCategories.unitCategoryId, {
      onDelete: "cascade",
    }),

  layoutType: text("layout_type").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  area: integer("area").notNull(),
});

export const unitFloorPlans = pgTable(
  "unit_floor_plans",
  {
    floorPlanId: uuid("floor_plan_id")
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),

    layoutId: uuid("layout_id")
      .notNull()
      .references(() => unitLayouts.layoutId, {
        onDelete: "cascade",
      }),

    imageUrl: text("image_url").notNull(),
  },
  (t) => ({
    uniq: unique().on(t.layoutId, t.imageUrl),
  })
);

export const paymentPlanPhases = pgTable(
  "payment_plan_phases",
  {
    phaseId: uuid("phase_id")
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),

    projectId: uuid("project_id").notNull(),
    paymentPlan: text("payment_plan").notNull(),

    phaseLabel: text("phase_label").notNull(),
    phasePercentage: integer("phase_percentage").notNull(),
  },
  (t) => ({
    fk: {
      columns: [t.projectId, t.paymentPlan],
      foreignColumns: [
        projectPaymentPlans.projectId,
        projectPaymentPlans.paymentPlan,
      ],
      onDelete: "cascade",
    },
    uniq: unique().on(t.projectId, t.paymentPlan, t.phaseLabel),
  })
);

export const paymentPlanMilestones = pgTable("payment_plan_milestones", {
  milestoneId: uuid("milestone_id")
    .default(sql`uuid_generate_v4()`)
    .primaryKey(),

  phaseId: uuid("phase_id")
    .notNull()
    .references(() => paymentPlanPhases.phaseId, {
      onDelete: "cascade",
    }),

  label: text("label"),
  percentage: integer("percentage").notNull(),
  sortOrder: integer("sort_order"),
});

export const projectConstructionTimeline = pgTable(
  "project_construction_timeline",
  {
    timelineId: uuid("timeline_id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),

    projectId: uuid("project_id").references(() => projects.projectId, {
      onDelete: "cascade",
    }),

    phaseKey: text("phase_key"),
    title: text("title"),
    category: text("category"),

    completed: boolean("completed"),
    progressPercentage: numeric("progress_percentage"),
    phaseDate: date("phase_date"),

    sortOrder: integer("sort_order"),
  }
);

export const agency = pgTable(
  "agency",
  {
    agencyId: serial("agency_id").primaryKey(),

    source: text("source").notNull(),
    sourceAgencyId: text("source_agency_id").notNull(),

    name: text("name").notNull(),
    logoUrl: text("logo_url"),
    qrUrl: text("qr_url"),
  },
  (t) => ({
    uniq: unique().on(t.source, t.sourceAgencyId),
  })
);

export const projectAgency = pgTable(
  "project_agency",
  {
    projectId: uuid("project_id").references(() => projects.projectId, {
      onDelete: "cascade",
    }),

    agencyId: integer("agency_id").references(() => agency.agencyId, {
      onDelete: "cascade",
    }),

    role: text("role").notNull(),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.agencyId, t.role),
  })
);

export const projectGalleryImages = pgTable(
  "project_gallery_images",
  {
    imageId: uuid("image_id")
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),

    projectId: uuid("project_id").references(() => projects.projectId, {
      onDelete: "cascade",
    }),

    sourceUrl: text("source_url").notNull(),
    variantMedium: text("variant_medium"),
    sortOrder: integer("sort_order"),
  },
  (t) => ({
    uniq: unique().on(t.projectId, t.sourceUrl),
  })
);

export const projectSimilarProjects = pgTable(
  "project_similar_projects",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),

    similarProjectId: uuid("similar_project_id")
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),

    sortOrder: integer("sort_order"),
    weightRanking: integer("weight_ranking"),
  },
  (t) => ({
    pk: primaryKey(t.projectId, t.similarProjectId),
  })
);
