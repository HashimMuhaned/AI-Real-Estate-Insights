import { NextResponse } from "next/server";
import { getProjectDetailsByName } from "@/db/queries/projectDetails";
// import { slugToProjectName } from "@/lib/slug";

type Params = {
  params: {
    slug: string;
  };
};

export function slugToProjectName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export async function GET(_: Request, { params }: Params) {
  try {
    const projectName = slugToProjectName(params.slug);

    const project = await getProjectDetailsByName(projectName);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Project details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project details" },
      { status: 500 }
    );
  }
}
