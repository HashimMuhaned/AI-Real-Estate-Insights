import { NextResponse } from "next/server";
import { getCommunityProjectsBySlug } from "@/db/queries/listProjectByCommunity";

type Params = {
  params: {
    slug: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  try {
    const projects = await getCommunityProjectsBySlug(params.slug);

    return NextResponse.json({
      projects,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
