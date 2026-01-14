import { NextResponse } from "next/server";
import { db } from "@/db";
import { dim_area } from "@/db/schema";
import { ilike } from "drizzle-orm";

// GET /api/areas?search=Downtown
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    // 🧠 If search is empty, return an empty list (no suggestions)
    if (!search) {
      return NextResponse.json([]);
    }

    const areas = await db
      .select({
        id: dim_area.id,
        name: dim_area.name,
      })
      .from(dim_area)
      .where(ilike(dim_area.name, `%${search}%`))
      .limit(10);

    return NextResponse.json(areas);
  } catch (error) {
    console.error("❌ Error fetching areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}
