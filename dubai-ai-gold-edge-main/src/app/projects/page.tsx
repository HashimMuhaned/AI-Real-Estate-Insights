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
} from "lucide-react";

type Developer = {
  id: number;
  name: string;
  logo?: string;
};

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
  developer: Developer;
};

const LIMIT = 12;

// Helper function to format price
function formatPrice(price?: number): string {
  if (!price) return "N/A";

  if (price >= 1000000) {
    const millions = price / 1000000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  } else if (price >= 1000) {
    const thousands = price / 1000;
    return `${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`;
  }

  return price.toLocaleString();
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [priceRange, setPriceRange] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [deliveryStatus, setDeliveryStatus] = useState("all");
  const [selectedDeveloper, setSelectedDeveloper] = useState("all");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Developer dropdown states
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [developerSearch, setDeveloperSearch] = useState("");
  const [showDeveloperDropdown, setShowDeveloperDropdown] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const developerDropdownRef = useRef<HTMLDivElement | null>(null);

  // Calculate hasActiveFilters
  const hasActiveFilters =
    priceRange !== "all" ||
    propertyType !== "all" ||
    deliveryStatus !== "all" ||
    sortBy !== "recent" ||
    query !== "" ||
    selectedDeveloper !== "all";

  // Fetch developers list
  useEffect(() => {
    async function fetchDevelopers() {
      try {
        const res = await fetch("/api/developers");
        const data = await res.json();
        setDevelopers(data.developers || []);
      } catch (error) {
        console.error("Error loading developers:", error);
      }
    }
    fetchDevelopers();
  }, []);

  // Close developer dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        developerDropdownRef.current &&
        !developerDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDeveloperDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);

    const params = new URLSearchParams({
      limit: LIMIT.toString(),
      offset: offset.toString(),
    });

    if (query) params.set("q", query);
    if (sortBy !== "recent") params.set("sort", sortBy);
    if (propertyType !== "all") params.set("propertyType", propertyType);
    if (deliveryStatus !== "all") params.set("delivery", deliveryStatus);
    if (selectedDeveloper !== "all") {
      params.set("developer", selectedDeveloper);
      console.log("Loading more with developer filter:", selectedDeveloper);
    }

    if (priceRange === "under1m") {
      params.set("priceMax", "999999");
    } else if (priceRange === "1m-2m") {
      params.set("priceMin", "1000000");
      params.set("priceMax", "1999999");
    } else if (priceRange === "2m-3m") {
      params.set("priceMin", "2000000");
      params.set("priceMax", "2999999");
    } else if (priceRange === "over3m") {
      params.set("priceMin", "3000000");
    }

    try {
      console.log("Fetching projects with params:", params.toString());
      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();

      setProjects((prev) => [...prev, ...(data.projects || [])]);
      setOffset(data.nextOffset);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error loading projects:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  // Reset and reload when filters change
  useEffect(() => {
    if (isClearing) return;

    setProjects([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);

    const fetchProjects = async () => {
      setLoading(true);

      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: "0",
      });

      if (query) params.set("q", query);
      if (sortBy !== "recent") params.set("sort", sortBy);
      if (propertyType !== "all") params.set("propertyType", propertyType);
      if (deliveryStatus !== "all") params.set("delivery", deliveryStatus);
      if (selectedDeveloper !== "all")
        params.set("developer", selectedDeveloper);

      if (priceRange === "under1m") {
        params.set("priceMax", "999999");
      } else if (priceRange === "1m-2m") {
        params.set("priceMin", "1000000");
        params.set("priceMax", "1999999");
      } else if (priceRange === "2m-3m") {
        params.set("priceMin", "2000000");
        params.set("priceMax", "2999999");
      } else if (priceRange === "over3m") {
        params.set("priceMin", "3000000");
      }

      try {
        const res = await fetch(`/api/projects?${params.toString()}`);
        const data = await res.json();

        setProjects(data.projects || []);
        setOffset(data.nextOffset);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [
    query,
    sortBy,
    priceRange,
    propertyType,
    deliveryStatus,
    selectedDeveloper,
    isClearing,
  ]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [
    offset,
    hasMore,
    loading,
    query,
    sortBy,
    priceRange,
    propertyType,
    deliveryStatus,
    selectedDeveloper,
  ]);

  const filtered = projects;

  const clearAllFilters = async () => {
    setIsClearing(true);

    setQuery("");
    setPriceRange("all");
    setPropertyType("all");
    setDeliveryStatus("all");
    setSortBy("recent");
    setSelectedDeveloper("all");
    setDeveloperSearch("");

    setProjects([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: "0",
        sort: "recent",
      });

      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();

      setProjects(data.projects || []);
      setOffset(data.nextOffset || 0);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsClearing(false), 100);
    }
  };

  // Filter developers based on search
  const filteredDevelopers = developers.filter((dev) =>
    dev.name.toLowerCase().includes(developerSearch.toLowerCase())
  );

  const selectedDeveloperName =
    developers.find((d) => d.id.toString() === selectedDeveloper)?.name ||
    "All Developers";

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

      {/* MAIN CONTENT - SIDEBAR + GRID */}
      <section className="container mx-auto px-2 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR - Desktop */}
          <aside className="hidden lg:block lg:w-80 shrink-0">
            <div className="sticky top-20 bg-card rounded-2xl border shadow-lg p-5">
              <FilterSidebarContent
                query={query}
                setQuery={setQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                deliveryStatus={deliveryStatus}
                setDeliveryStatus={setDeliveryStatus}
                selectedDeveloper={selectedDeveloper}
                setSelectedDeveloper={setSelectedDeveloper}
                selectedDeveloperName={selectedDeveloperName}
                developers={filteredDevelopers}
                developerSearch={developerSearch}
                setDeveloperSearch={setDeveloperSearch}
                showDeveloperDropdown={showDeveloperDropdown}
                setShowDeveloperDropdown={setShowDeveloperDropdown}
                developerDropdownRef={developerDropdownRef}
                hasActiveFilters={hasActiveFilters}
                clearAllFilters={clearAllFilters}
                setShowAIModal={setShowAIModal}
              />
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full px-6 py-4 rounded-xl bg-card border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                  {
                    [
                      query,
                      priceRange !== "all",
                      propertyType !== "all",
                      deliveryStatus !== "all",
                      sortBy !== "recent",
                      selectedDeveloper !== "all",
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </button>

            {showMobileFilters && (
              <div className="mt-4 bg-card rounded-2xl border shadow-lg p-6">
                <FilterSidebarContent
                  query={query}
                  setQuery={setQuery}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  propertyType={propertyType}
                  setPropertyType={setPropertyType}
                  deliveryStatus={deliveryStatus}
                  setDeliveryStatus={setDeliveryStatus}
                  selectedDeveloper={selectedDeveloper}
                  setSelectedDeveloper={setSelectedDeveloper}
                  selectedDeveloperName={selectedDeveloperName}
                  developers={filteredDevelopers}
                  developerSearch={developerSearch}
                  setDeveloperSearch={setDeveloperSearch}
                  showDeveloperDropdown={showDeveloperDropdown}
                  setShowDeveloperDropdown={setShowDeveloperDropdown}
                  developerDropdownRef={developerDropdownRef}
                  hasActiveFilters={hasActiveFilters}
                  clearAllFilters={clearAllFilters}
                  setShowAIModal={setShowAIModal}
                />
              </div>
            )}
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0">
            {/* Results Counter */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-bold text-foreground">
                  {filtered.length}
                </span>{" "}
                projects
                {hasMore && (
                  <span className="text-xs ml-1">(scroll for more)</span>
                )}
              </p>
            </div>

            {/* PROJECTS GRID */}
            {loading && projects.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Loading projects...
              </p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border">
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
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group bg-card"
                    >
                      <div className="h-48 w-full overflow-hidden bg-muted">
                        <img
                          src={p.image || "/placeholder.jpg"}
                          alt={p.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {p.name}
                        </h3>

                        {/* Developer */}
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
                    </div>
                  ))}
                </div>

                {loading && (
                  <p className="text-center text-muted-foreground mt-8">
                    Loading more projects...
                  </p>
                )}

                {/* Infinite scroll loader */}
                {hasMore && <div ref={loaderRef} className="h-10" />}

                {!hasMore && projects.length > 0 && (
                  <p className="text-center text-muted-foreground mt-8">
                    You've reached the end.
                  </p>
                )}
              </>
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

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Describe what kind of project you're looking for, and I'll
                  help you find the perfect match.
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Try asking:</p>
                  <div className="space-y-2">
                    {[
                      "Show me luxury apartments ready to move in under 2M",
                      "Find villas with good ROI delivering in 2025",
                      "I want projects with low down payment and beach access",
                    ].map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAiQuery(example)}
                        className="w-full text-left px-4 py-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-sm"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Type your question here..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>
              </div>
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

// Separate component to prevent recreation on every render
function FilterSidebarContent({
  query,
  setQuery,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  propertyType,
  setPropertyType,
  deliveryStatus,
  setDeliveryStatus,
  selectedDeveloper,
  setSelectedDeveloper,
  selectedDeveloperName,
  developers,
  developerSearch,
  setDeveloperSearch,
  showDeveloperDropdown,
  setShowDeveloperDropdown,
  developerDropdownRef,
  hasActiveFilters,
  clearAllFilters,
  setShowAIModal,
}: {
  query: string;
  setQuery: (q: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  priceRange: string;
  setPriceRange: (p: string) => void;
  propertyType: string;
  setPropertyType: (p: string) => void;
  deliveryStatus: string;
  setDeliveryStatus: (d: string) => void;
  selectedDeveloper: string;
  setSelectedDeveloper: (d: string) => void;
  selectedDeveloperName: string;
  developers: Developer[];
  developerSearch: string;
  setDeveloperSearch: (s: string) => void;
  showDeveloperDropdown: boolean;
  setShowDeveloperDropdown: (show: boolean) => void;
  developerDropdownRef: React.RefObject<HTMLDivElement>;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  setShowAIModal: (show: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Project name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background text-sm"
        />
      </div>

      {/* AI Assistant Button */}
      <button
        onClick={() => setShowAIModal(true)}
        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
      >
        <Sparkles className="w-4 h-4" />
        Ask AI Assistant
      </button>

      {/* Divider */}
      <div className="border-t"></div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="font-semibold text-sm flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full"></div>
          Sort By
        </label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="delivery">Delivery Date</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Developer Filter */}
      <div className="space-y-2">
        <label className="font-semibold text-sm flex items-center gap-2">
          <div className="w-1 h-4 bg-accent rounded-full"></div>
          Developer
        </label>
        <div className="relative" ref={developerDropdownRef}>
          <button
            onClick={() => setShowDeveloperDropdown(!showDeveloperDropdown)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm text-left"
          >
            {selectedDeveloperName}
          </button>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

          {showDeveloperDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-card border-2 border-primary rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search developers..."
                  value={developerSearch}
                  onChange={(e) => setDeveloperSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedDeveloper("all");
                    setShowDeveloperDropdown(false);
                    setDeveloperSearch("");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors text-sm"
                >
                  All Developers
                </button>
                {developers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No developers found
                  </div>
                ) : (
                  developers.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => {
                        setSelectedDeveloper(dev.id.toString());
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
      <div className="space-y-2">
        <label className="font-semibold text-sm flex items-center gap-2">
          <div className="w-1 h-4 bg-accent rounded-full"></div>
          Price Range
        </label>
        <div className="relative">
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm"
          >
            <option value="all">All Prices</option>
            <option value="under1m">Under AED 1M</option>
            <option value="1m-2m">AED 1M - 2M</option>
            <option value="2m-3m">AED 2M - 3M</option>
            <option value="over3m">Over AED 3M</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <label className="font-semibold text-sm flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full"></div>
          Property Type
        </label>
        <div className="relative">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm"
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

      {/* Delivery Status */}
      <div className="space-y-2">
        <label className="font-semibold text-sm flex items-center gap-2">
          <div className="w-1 h-4 bg-accent rounded-full"></div>
          Delivery
        </label>
        <div className="relative">
          <select
            value={deliveryStatus}
            onChange={(e) => setDeliveryStatus(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm"
          >
            <option value="all">All Projects</option>
            <option value="ready">Ready to Move</option>
            <option value="upcoming">Upcoming</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <>
          <div className="border-t"></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                Active Filters
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:text-primary/80 font-medium underline"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {query && (
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">
                  "{query.length > 15 ? query.slice(0, 15) + "..." : query}"
                  <button
                    onClick={() => setQuery("")}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {priceRange !== "all" && (
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">
                  {priceRange === "under1m"
                    ? "<1M"
                    : priceRange === "1m-2m"
                    ? "1M-2M"
                    : priceRange === "2m-3m"
                    ? "2M-3M"
                    : ">3M"}
                  <button
                    onClick={() => setPriceRange("all")}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {propertyType !== "all" && (
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1 capitalize">
                  {propertyType}
                  <button
                    onClick={() => setPropertyType("all")}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {deliveryStatus !== "all" && (
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1 capitalize">
                  {deliveryStatus}
                  <button
                    onClick={() => setDeliveryStatus("all")}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedDeveloper !== "all" && (
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">
                  {selectedDeveloperName.length > 15
                    ? selectedDeveloperName.slice(0, 15) + "..."
                    : selectedDeveloperName}
                  <button
                    onClick={() => setSelectedDeveloper("all")}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
