import { NextRequest, NextResponse } from "next/server";
import { getYield } from "@/db/queries/areaCharts/getYield";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const areaIdParam = searchParams.get("areaId");
    const category = searchParams.get("category");
    const rooms = searchParams.get("rooms");

    const areaId = areaIdParam ? Number(areaIdParam) : null;

    const data = await getYield({
      areaId,
      category: category || null,
      rooms: rooms ? Number(rooms) : null,
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
