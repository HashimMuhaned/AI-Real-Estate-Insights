import { NextRequest, NextResponse } from "next/server";
import { getInvestmentScore } from "@/db/queries/areaCharts/investment_signals/getInvestmentScore";
import { computeInvestmentScore } from "@/components/charts/(areaCharts)/InvestmentSignals/InvestmentScore/InvestmentScoreCalc";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const areaId = searchParams.get("areaId");
    const category = searchParams.get("category");
    const rooms = searchParams.get("rooms");
    const range = searchParams.get("range") || "3 years";

    if (!areaId) {
      return NextResponse.json(
        { error: "areaId is required" },
        { status: 400 }
      );
    }

    const result = await getInvestmentScore({
      areaId: Number(areaId),
      category: category || null,
      rooms: rooms ? Number(rooms) : null,
      range,
    });

    // ✅ FIX HERE
    const row = result?.[0];

    if (!row) {
      return NextResponse.json({ error: "No data" }, { status: 404 });
    }

    const score = computeInvestmentScore(row);

    return NextResponse.json({
      area_id: row.area_id,
      ...row,
      ...score,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}