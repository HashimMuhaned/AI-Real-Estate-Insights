import { getCommunityBySlug } from "@/db/queries/listLocations";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

const page = async ({ params }: Props) => {
  const community = await getCommunityBySlug(params.slug);

  if (!community) notFound();

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-serif font-bold mb-6">
        {community.name}
      </h1>

      <p className="text-muted-foreground">
        Community overview, analytics, price trends, ROI, etc.
      </p>
    </div>
  );
};

export default page;
