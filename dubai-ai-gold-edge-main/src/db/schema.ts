// db/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("passwordHash"), // null if logged in with Google only
  provider: text("provider").default("credentials"), // "google" or "credentials"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
