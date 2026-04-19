import { db } from "@/db";
import { developers } from "@/db/schema";
import { projects } from "@/db/projects/projects_&_relations";
import { asc, count, eq, desc } from "drizzle-orm";

export async function getDevelopers(limit = 6) {
  const result = await db
    .select({
      id: developers.developerId,
      name: developers.name,
      logo: developers.logoUrl,
      projects: count(projects.projectId), 
    })
    .from(developers)
    .leftJoin(projects, eq(projects.developerId, developers.developerId))
    .groupBy(developers.developerId)
    .orderBy(desc(count(projects.projectId)))
    .limit(limit);

  return result.map((d) => ({
    name: d.name,
    projects: Number(d.projects || 0),
    logo: d.logo,
  }));
}
