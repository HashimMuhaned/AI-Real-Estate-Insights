import { NextResponse } from "next/server";
import { listProjects } from "@/db/queries/listProjects";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = Math.min(Number(searchParams.get("limit")) || 12, 30);
  const offset = Number(searchParams.get("offset")) || 0;

  const filters = {
    q: searchParams.get("q"),
    sort: searchParams.get("sort") ?? "recent",
    priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : null,
    priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : null,
    propertyType: searchParams.get("propertyType"),
    delivery: searchParams.get("delivery"),
  };

  const projects = await listProjects({
    limit,
    offset,
    filters,
  });

  return NextResponse.json({
    projects,
    nextOffset: offset + projects.length,
    hasMore: projects.length === limit,
  });
}
