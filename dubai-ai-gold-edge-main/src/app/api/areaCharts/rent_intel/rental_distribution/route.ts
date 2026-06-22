import { NextRequest, NextResponse } from "next/server";
import { getRentalDistribution } from "@/db/queries/areaCharts/rent_intel/getRentalDistribution";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const areaId = searchParams.get("areaId");
    const category = searchParams.get("category");
    const rooms = searchParams.get("rooms");
    const range = searchParams.get("range") || "3 years";

    const data = await getRentalDistribution({
      areaId: areaId ? Number(areaId) : null,
      category: category || null,
      rooms: rooms ? Number(rooms) : null,
      range,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
