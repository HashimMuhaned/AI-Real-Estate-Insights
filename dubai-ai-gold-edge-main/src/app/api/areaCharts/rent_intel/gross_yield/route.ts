import { NextRequest, NextResponse } from "next/server";
import { getGrossYield } from "@/db/queries/areaCharts/rent_intel/getGrossYield";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const areaIdParam = searchParams.get("areaId");
    const category = searchParams.get("category");
    const roomsParam = searchParams.get("rooms");
    const range = searchParams.get("range") || "3 years";

    const data = await getGrossYield({
      areaId: areaIdParam ? Number(areaIdParam) : null,
      category: category || null,
      rooms: roomsParam ? Number(roomsParam) : null,
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
