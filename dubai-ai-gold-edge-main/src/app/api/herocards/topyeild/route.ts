import { NextResponse } from "next/server";
import { getTopYieldAreas } from "@/db/queries/hero_cards_queries/getTopYield";

export async function GET() {
  try {
    const data = await getTopYieldAreas();

    // add mock change for now (next step we calculate it)
    const enriched = data.map((row: any) => ({
      rank: Number(row.rank),
      area: row.area,
      roi: Number(row.roi),
      change: 0, // placeholder for now
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch yield data" }, { status: 500 });
  }
}