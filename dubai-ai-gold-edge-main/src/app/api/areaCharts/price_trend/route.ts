import { NextRequest, NextResponse } from "next/server";
import { getPriceTrend } from "@/db/queries/areaCharts/priceTrend";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const areaId = Number(searchParams.get("areaId"));
    const category = searchParams.get("category"); // villa | apartment
    const rooms = searchParams.get("rooms");
    const range = searchParams.get("range") || "3 years";

    if (!areaId) {
      return NextResponse.json(
        { error: "areaId is required" },
        { status: 400 }
      );
    }

    const data = await getPriceTrend({
      areaId,
      category: category || null,
      rooms: rooms ? Number(rooms) : null,
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