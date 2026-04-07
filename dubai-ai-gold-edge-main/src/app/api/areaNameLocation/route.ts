// app/api/area-name-location/[areaId]/route.ts

import { NextResponse } from "next/server";
import { getAreaNameAndLocation } from "@/db/queries/getAreaNameAndLocation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const areaId = Number(searchParams.get("areaId"));

  if (isNaN(areaId)) {
    return NextResponse.json({ error: "Invalid areaId" }, { status: 400 });
  }

  const data = await getAreaNameAndLocation(areaId);
  if (!data)
    return NextResponse.json({ error: "Area not found" }, { status: 404 });

  return NextResponse.json(data);
}
