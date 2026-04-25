export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 w-full bg-muted" />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Title */}
        <div className="h-5 w-3/4 rounded-md bg-muted" />

        {/* Developer row */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-muted" />
          <div className="h-4 w-1/2 rounded-md bg-muted" />
        </div>

        {/* Property types */}
        <div className="h-4 w-2/5 rounded-md bg-muted" />

        {/* Price */}
        <div className="h-6 w-3/5 rounded-md bg-muted" />

        {/* Down payment */}
        <div className="h-4 w-2/5 rounded-md bg-muted" />

        {/* Delivery */}
        <div className="h-4 w-1/2 rounded-md bg-muted" />

        {/* Stock */}
        <div className="h-4 w-1/3 rounded-md bg-muted" />

        {/* Amenity chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[60, 80, 50, 70, 55].map((w, i) => (
            <div
              key={i}
              className="h-6 rounded bg-muted"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        {/* Spacer pushes button down */}
        <div className="flex-1" />

        {/* CTA button */}
        <div className="h-10 w-full rounded-lg bg-muted mt-1" />
      </div>
    </div>
  );
}

/** Renders a full grid of skeleton cards */
export function ProjectsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}