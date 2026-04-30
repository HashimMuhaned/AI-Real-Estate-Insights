import { NextRequest, NextResponse } from "next/server";
import { getGrowthComparison } from "@/db/queries/areaCharts/getGrowthComparison";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const areaIdParam = searchParams.get("areaId");
    const category = searchParams.get("category");
    const roomsParam = searchParams.get("rooms");
    const range = searchParams.get("range") || "3 years";

    const areaId = areaIdParam ? Number(areaIdParam) : null;
    const rooms = roomsParam ? Number(roomsParam) : null;

    // 🧪 debug once
    console.log({
      areaId,
      category,
      rooms,
      range
    });

    const data = await getGrowthComparison({
      areaId,
      category: category || null,
      rooms,
      range 
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}