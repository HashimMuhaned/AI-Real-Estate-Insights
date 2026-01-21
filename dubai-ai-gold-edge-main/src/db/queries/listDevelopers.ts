import { db } from "@/db";
import { developers } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function getDevelopers() {
  return db
    .select({
      id: developers.developerId,
      name: developers.name,
      logo: developers.logoUrl,
    })
    .from(developers)
    .orderBy(asc(developers.name));
}
