"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  Sparkles,
  X,
  Send,
  SlidersHorizontal,
  Building2,
  Flame,
  TrendingUp,
  Activity,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import formatPrice from "@/helpers/FormatPrice";
import Link from "next/link";
import { slugify } from "@/lib/slugify";
import { useProjects } from "@/hooks/Useprojects";
import { FilterState } from "@/lib/Buildqueryparams";
import { ProjectCardSkeleton } from "@/app/projects/_components/Projectcardskeleton";

type Developer = {
  id: number;
  name: string;
  logo?: string;
};

export default function ProjectsPage() {
  const {
    projects,
    hasMore,
    uiFilters,
    loading,
    isFetchingMore,
    isRefreshing,
    setFilter,
    clearAllFilters,
    loadMore,
    hasActiveFilters,
  } = useProjects();

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Developers fetched once here and passed as a plain prop.
  // All dropdown state (search, open/closed, ref, outside-click listener)
  // lives inside FilterSidebarContent so each rendered instance is independent.
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/developers")
      .then((r) => r.json())
      .then((data) => setDevelopers(data.developers ?? []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const activeFilterCount = [
    uiFilters.query,
    uiFilters.priceRange !== "all",
    uiFilters.propertyType !== "all",
    uiFilters.deliveryStatus !== "all",
    uiFilters.sortBy !== "recent",
    uiFilters.selectedDeveloper !== "all",
    uiFilters.hotnessLevel !== "all",
  ].filter(Boolean).length;

  const skeletonCount =
    loading || isRefreshing || isFetchingMore
      ? projects.length === 0
        ? 12
        : 6
      : 0;

  const sharedSidebarProps = {
    uiFilters,
    setFilter,
    developers,
    hasActiveFilters,
    clearAllFilters,
    setShowAIModal,
    activeFilterCount,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Analyse Dubai's Upcoming Projects
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Discover investment opportunities across Dubai's most promising
              projects and developments.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="container mx-auto px-2 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── SIDEBAR ── */}
          <aside
            className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6 mx-auto lg:mx-0 max-w-sm sm:max-w-none"
            style={{ alignSelf: "flex-start" }}
          >
            <Card className="rounded-2xl overflow-visible shadow-md border border-border bg-card">
              <CardContent className="p-4 space-y-0">
                {/* Toggle button — mobile only */}
                <button
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="lg:hidden w-full flex items-center justify-between py-1 group"
                >
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm text-foreground">
                      Filters & Sort
                    </span>
                    {hasActiveFilters && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-primary-foreground"
                        style={{ background: "hsl(var(--primary))" }}
                      >
                        {activeFilterCount} active
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                      filtersOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {/* Static header — desktop only */}
                <div className="hidden lg:flex items-center gap-2.5 py-1 mb-4">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm text-foreground">
                    Filters & Sort
                  </span>
                  {hasActiveFilters && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-primary-foreground"
                      style={{ background: "hsl(var(--primary))" }}
                    >
                      {activeFilterCount} active
                    </span>
                  )}
                </div>

                {/* Desktop: always visible */}
                <div className="hidden lg:block mt-0">
                  <FilterSidebarContent {...sharedSidebarProps} />
                </div>
                {/* Mobile: collapsible */}
                <div
                  className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                    filtersOpen
                      ? "max-h-[1000px] opacity-100 mt-4"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <FilterSidebarContent {...sharedSidebarProps} />
                </div>

                {/* Collapsed summary — mobile only */}
                {!filtersOpen && (
                  <div className="lg:hidden mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-muted">
                    <span className="text-xs text-muted-foreground font-medium">
                      Showing results
                    </span>
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full text-primary-foreground"
                      style={{ background: "hsl(var(--primary))" }}
                    >
                      {projects.length} projects
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* PROJECT GRID */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-bold text-foreground">
                  {projects.length}
                </span>{" "}
                projects
                {hasMore && (
                  <span className="text-xs ml-1">(scroll for more)</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group bg-card relative flex flex-col h-full"
                >
                  {p.hotness != null && p.hotness >= 50 && (
                    <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-orange-200">
                      <Flame
                        className={`w-4 h-4 ${
                          p.hotness >= 80
                            ? "text-red-500"
                            : p.hotness >= 60
                              ? "text-orange-500"
                              : "text-yellow-500"
                        }`}
                      />
                      <span className="text-xs font-bold text-gray-900">
                        {p.hotness}/100
                      </span>
                    </div>
                  )}

                  <div className="h-48 w-full overflow-hidden bg-muted">
                    <img
                      src={p.image || "/placeholder.jpg"}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">
                          {p.developer.name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {p.propertyTypes.join(", ")}
                      </p>
                      <p className="font-medium">
                        Starting from{" "}
                        <span className="text-primary text-lg font-bold">
                          AED {formatPrice(p.startingPrice)}
                        </span>
                      </p>
                      <p className="text-sm">
                        Down payment: {p.downPayment ?? "-"}%
                      </p>
                      <p className="text-sm">
                        Delivery:{" "}
                        {p.deliveryDate
                          ? new Date(p.deliveryDate).toLocaleDateString()
                          : "TBA"}
                      </p>
                      <p className="text-sm">Stock: {p.stock ?? "N/A"}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {p.amenities.slice(0, 5).map((a) => (
                          <span
                            key={a}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3">
                      <Link
                        href={`/projects/${slugify(p.name)}`}
                        className="block w-full text-center rounded-lg bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 transition-all"
                      >
                        View Project Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {Array.from({ length: skeletonCount }).map((_, i) => (
                <ProjectCardSkeleton key={`sk-${i}`} />
              ))}
            </div>

            {!loading &&
              !isRefreshing &&
              projects.length === 0 &&
              hasActiveFilters && (
                <div className="text-center py-12 bg-card rounded-xl border mt-6">
                  <p className="text-muted-foreground text-lg mb-4">
                    No projects found matching your criteria.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

            {hasMore && <div ref={loaderRef} className="h-10 mt-2" />}

            {!hasMore && projects.length > 0 && (
              <p className="text-center text-muted-foreground mt-8">
                You've reached the end.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* AI MODAL */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Assistant</h2>
                    <p className="text-sm text-primary-foreground/80">
                      Tell me what you're looking for
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <p className="text-muted-foreground">
                Describe what kind of project you're looking for, and I'll help
                you find the perfect match.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Try asking:</p>
                {[
                  "Show me luxury apartments ready to move in under 2M",
                  "Find villas with good ROI delivering in 2025",
                  "I want projects with low down payment and beach access",
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setAiQuery(example)}
                    className="w-full text-left px-4 py-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-sm"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Type your question here..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            <div className="p-6 border-t bg-muted/30">
              <button
                onClick={() => {
                  console.log("AI Query:", aiQuery);
                  setShowAIModal(false);
                }}
                disabled={!aiQuery.trim()}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Filter Sidebar ────────────────────────────────────────────────────────────

type SidebarProps = {
  uiFilters: FilterState;
  setFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
  /** Full unfiltered list — search filtering happens internally */
  developers: Developer[];
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  setShowAIModal: (v: boolean) => void;
  activeFilterCount: number;
};

function FilterSidebarContent({
  uiFilters,
  setFilter,
  developers,
  hasActiveFilters,
  clearAllFilters,
  setShowAIModal,
}: SidebarProps) {
  // ── Developer dropdown is fully self-contained here. ─────────────────────
  // The page renders this component twice (desktop + mobile hidden/shown via
  // CSS). If the ref and outside-click handler live in the parent and are
  // passed as props, React can only attach the ref to one DOM node at a time.
  // Clicking inside the *other* instance isn't contained by that ref, so the
  // document mousedown handler fires a false "outside click" and closes the
  // dropdown the moment you try to focus the search input.
  // Owning the ref here means each instance has its own, independent listener.
  const [developerSearch, setDeveloperSearch] = useState("");
  const [showDeveloperDropdown, setShowDeveloperDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDeveloperDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredDevelopers = developers.filter((d) =>
    d.name.toLowerCase().includes(developerSearch.toLowerCase()),
  );
  const selectedDeveloperName =
    developers.find((d) => d.id.toString() === uiFilters.selectedDeveloper)
      ?.name ?? "All Developers";

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-1.5">
        <label className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <Search className="w-4 h-4 text-muted-foreground" />
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Project name…"
            value={uiFilters.query}
            onChange={(e) => setFilter("query", e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-lg border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background text-sm text-foreground placeholder:text-muted-foreground"
          />
          {uiFilters.query && (
            <button
              onClick={() => setFilter("query", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* AI Button */}
      <div className="space-y-2">
        <button
          onClick={() => setShowAIModal(true)}
          className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          Ask AI Assistant
        </button>
      </div>

      <div className="border-t border-border" />

      {/* Hotness Level */}
      <div className="space-y-1.5">
        <label className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <Flame className="w-4 h-4 text-orange-500" />
          Hotness Level
        </label>
        <div className="relative">
          <select
            value={uiFilters.hotnessLevel}
            onChange={(e) => setFilter("hotnessLevel", e.target.value)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm font-medium text-foreground"
          >
            <option value="all">All Projects</option>
            <option value="80">🔥 Very Hot (80+)</option>
            <option value="60">🔥 Hot (60+)</option>
            <option value="40">🔥 Warm (40+)</option>
            <option value="1">🔥 Any Level</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Developer — dropdownRef covers trigger button + panel */}
      <div className="space-y-1.5">
        <label className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <div
            className="w-1 h-4 rounded-full"
            style={{ background: "hsl(var(--accent))" }}
          />
          Developer
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDeveloperDropdown((v) => !v)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm text-left font-medium text-foreground"
          >
            {selectedDeveloperName}
          </button>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

          {showDeveloperDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-card border-2 border-primary rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search developers…"
                  value={developerSearch}
                  onChange={(e) => setDeveloperSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div className="overflow-y-auto">
                <button
                  onClick={() => {
                    setFilter("selectedDeveloper", "all");
                    setShowDeveloperDropdown(false);
                    setDeveloperSearch("");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors text-sm"
                >
                  All Developers
                </button>
                {filteredDevelopers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No developers found
                  </div>
                ) : (
                  filteredDevelopers.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => {
                        setFilter("selectedDeveloper", dev.id.toString());
                        setShowDeveloperDropdown(false);
                        setDeveloperSearch("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors text-sm flex items-center gap-2"
                    >
                      {dev.logo && (
                        <img
                          src={dev.logo}
                          alt={dev.name}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      {dev.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-1.5">
        <label className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <div
            className="w-1 h-4 rounded-full"
            style={{ background: "hsl(var(--accent))" }}
          />
          Price Range
        </label>
        <div className="relative">
          <select
            value={uiFilters.priceRange}
            onChange={(e) => setFilter("priceRange", e.target.value)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm font-medium text-foreground"
          >
            <option value="all">All Prices</option>
            <option value="under1m">Under AED 1M</option>
            <option value="1m-2m">AED 1M – 2M</option>
            <option value="2m-3m">AED 2M – 3M</option>
            <option value="over3m">Over AED 3M</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-1.5">
        <label className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <div className="w-1 h-4 bg-primary rounded-full" />
          Property Type
        </label>
        <div className="relative">
          <select
            value={uiFilters.propertyType}
            onChange={(e) => setFilter("propertyType", e.target.value)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm font-medium text-foreground"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartments</option>
            <option value="villa">Villas</option>
            <option value="penthouse">Penthouses</option>
            <option value="townhouse">Townhouses</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Delivery */}
      <div className="space-y-1.5">
        <label className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <div
            className="w-1 h-4 rounded-full"
            style={{ background: "hsl(var(--accent))" }}
          />
          Delivery
        </label>
        <div className="relative">
          <select
            value={uiFilters.deliveryStatus}
            onChange={(e) => setFilter("deliveryStatus", e.target.value)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm font-medium text-foreground"
          >
            <option value="all">All Projects</option>
            <option value="ready">Ready to Move</option>
            <option value="upcoming">Upcoming</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5">
        <label className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <div className="w-1 h-4 bg-primary rounded-full" />
          Sort By
        </label>
        <div className="flex flex-col gap-2">
          {(
            [
              { value: "recent", label: "Most Recent", icon: Activity },
              {
                value: "price_asc",
                label: "Price: Low → High",
                icon: TrendingUp,
              },
              { value: "price_desc", label: "Price: High → Low", icon: Shield },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilter("sortBy", value)}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium text-left ${
                uiFilters.sortBy === value
                  ? "border-primary text-primary-foreground"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
              style={
                uiFilters.sortBy === value
                  ? { background: "hsl(var(--primary))" }
                  : {}
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              Active Filters
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold underline text-primary hover:opacity-70 transition-opacity"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {uiFilters.query && (
              <span
                className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-medium"
                style={{
                  background: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                }}
              >
                "
                {uiFilters.query.length > 15
                  ? uiFilters.query.slice(0, 15) + "…"
                  : uiFilters.query}
                "
                <button
                  onClick={() => setFilter("query", "")}
                  className="hover:opacity-70"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {uiFilters.priceRange !== "all" && (
              <span
                className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-medium"
                style={{
                  background: "hsl(var(--accent) / 0.15)",
                  color: "hsl(var(--primary))",
                }}
              >
                {uiFilters.priceRange === "under1m"
                  ? "<1M"
                  : uiFilters.priceRange === "1m-2m"
                    ? "1M–2M"
                    : uiFilters.priceRange === "2m-3m"
                      ? "2M–3M"
                      : ">3M"}
                <button
                  onClick={() => setFilter("priceRange", "all")}
                  className="hover:opacity-70"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {uiFilters.propertyType !== "all" && (
              <span
                className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-medium capitalize"
                style={{
                  background: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                }}
              >
                {uiFilters.propertyType}
                <button
                  onClick={() => setFilter("propertyType", "all")}
                  className="hover:opacity-70"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {uiFilters.deliveryStatus !== "all" && (
              <span
                className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-medium capitalize"
                style={{
                  background: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                }}
              >
                {uiFilters.deliveryStatus}
                <button
                  onClick={() => setFilter("deliveryStatus", "all")}
                  className="hover:opacity-70"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {uiFilters.selectedDeveloper !== "all" && (
              <span
                className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-medium"
                style={{
                  background: "hsl(var(--accent) / 0.15)",
                  color: "hsl(var(--primary))",
                }}
              >
                {selectedDeveloperName.length > 15
                  ? selectedDeveloperName.slice(0, 15) + "…"
                  : selectedDeveloperName}
                <button
                  onClick={() => setFilter("selectedDeveloper", "all")}
                  className="hover:opacity-70"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {uiFilters.hotnessLevel !== "all" && (
              <span
                className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-medium"
                style={{
                  background: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                }}
              >
                🔥 {uiFilters.hotnessLevel}+
                <button
                  onClick={() => setFilter("hotnessLevel", "all")}
                  className="hover:opacity-70"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted">
          <span className="text-xs text-muted-foreground font-medium">
            Showing results
          </span>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full text-primary-foreground"
            style={{ background: "hsl(var(--primary))" }}
          >
            — projects
          </span>
        </div>
      </div>
    </div>
  );
}
