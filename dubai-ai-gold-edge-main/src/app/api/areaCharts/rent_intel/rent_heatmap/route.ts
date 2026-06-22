import { NextRequest, NextResponse } from "next/server";
import { getRentHeatmap } from "@/db/queries/areaCharts/rent_intel/getRentHeatmap";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const category =
      (searchParams.get("category") as "apartment" | "villa") || "apartment";

    const range =
      searchParams.get("range") || "3 years";

    const data = await getRentHeatmap({
      category,
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