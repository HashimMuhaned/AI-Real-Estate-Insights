import { NextResponse } from "next/server";
import { getCommunityTopProjects } from "@/db/queries/getCommunityTopProjects";

type Params = {
  params: {
    slug: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  try {
    const projects = await getCommunityTopProjects(params.slug);

    return NextResponse.json({
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error("Top projects error:", error);

    return NextResponse.json(
      { error: "Failed to fetch top projects" },
      { status: 500 }
    );
  }
}
