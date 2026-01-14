"use client";

type Project = {
  id: string;
  name: string;
  image?: string;
  propertyTypes: string[];
  startingPrice?: number;
  downPayment?: number;
  stock?: string;
  deliveryDate?: string;
  amenities: string[];
};

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <div
          key={p.id}
          className="rounded-xl border overflow-hidden hover:shadow-lg transition"
        >
          <img
            src={p.image || "/placeholder.jpg"}
            alt={p.name}
            className="h-48 w-full object-cover"
          />

          <div className="p-5 space-y-2">
            <h3 className="text-lg font-semibold">{p.name}</h3>

            <p className="text-sm text-muted-foreground">
              {p.propertyTypes.join(", ")}
            </p>

            <p className="font-medium">
              Starting from{" "}
              <span className="text-primary">
                AED {p.startingPrice?.toLocaleString()}
              </span>
            </p>

            <p className="text-sm">Down payment: {p.downPayment ?? "-"}%</p>

            <p className="text-sm">
              Delivery:{" "}
              {p.deliveryDate
                ? new Date(p.deliveryDate).toLocaleDateString()
                : "TBA"}
            </p>

            <p className="text-sm">Stock: {p.stock ?? "N/A"}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {p.amenities.slice(0, 5).map((a) => (
                <span key={a} className="text-xs bg-muted px-2 py-1 rounded">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
