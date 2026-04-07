import { NextResponse } from "next/server";
import { getAreasDisplayCards } from "@/db/queries/areasRelatedQueries/getAreasDisplayCards";

export async function GET() {
  try {
    const data = await getAreasDisplayCards();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching area insights:", error);

    return NextResponse.json(
      { error: "Failed to fetch area insights" },
      { status: 500 }
    );
  }
}