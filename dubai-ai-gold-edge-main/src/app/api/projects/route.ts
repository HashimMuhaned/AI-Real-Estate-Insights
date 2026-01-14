import { NextResponse } from "next/server";
import { listProjects } from "@/db/queries/listProjects";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = Math.min(Number(searchParams.get("limit")) || 12, 30);
  const offset = Number(searchParams.get("offset")) || 0;

  const projects = await listProjects({ limit, offset });

  return NextResponse.json(
    {
      projects,
      nextOffset: offset + projects.length,
      hasMore: projects.length === limit,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300",
      },
    }
  );
}
