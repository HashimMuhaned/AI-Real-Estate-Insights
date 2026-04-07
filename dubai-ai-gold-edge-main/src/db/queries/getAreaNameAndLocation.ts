// db/queries/getAreaNames.ts
import { db } from "@/db";
import { areaCommercialMapping } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getAreaNameAndLocation = async (areaId: number) => {
  const result = await db
    .select({
      areaId: areaCommercialMapping.areaId,
      locationId: areaCommercialMapping.locationId,
      officialAreaName: areaCommercialMapping.officialAreaName,
      commercialName: areaCommercialMapping.commercialName,
    })
    .from(areaCommercialMapping)
    .where(eq(areaCommercialMapping.areaId, areaId))
    .limit(1); // important

  return result[0] || null;
};