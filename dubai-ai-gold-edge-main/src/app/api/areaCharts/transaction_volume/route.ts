import { NextRequest, NextResponse } from "next/server";
import { getTransactionVolume } from "@/db/queries/areaCharts/getTransactionVolum";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const areaIdParam = searchParams.get("areaId");
    const category = searchParams.get("category");
    const rooms = searchParams.get("rooms");
    const range = searchParams.get("range") || "3 years";

    const areaId = areaIdParam ? Number(areaIdParam) : null;

    const data = await getTransactionVolume({
      areaId,
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
