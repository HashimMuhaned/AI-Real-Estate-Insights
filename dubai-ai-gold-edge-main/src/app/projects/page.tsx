"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Sparkles, X, Send } from "lucide-react";

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

const LIMIT = 12;

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
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const loaderRef = useRef<HTMLDivElement | null>(null);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);

    const res = await fetch(`/api/projects?limit=${LIMIT}&offset=${offset}`);
    const data = await res.json();

    setProjects((prev) => [...prev, ...data.projects]);
    setOffset(data.nextOffset);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  useEffect(() => {
    loadMore();
  }, []);

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
  }, [loaderRef.current, offset, hasMore]);

  // Filter logic
  const filtered = projects
    .filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(query.toLowerCase());
      
      let matchesPrice = true;
      if (priceRange === "under1m" && p.startingPrice) matchesPrice = p.startingPrice < 1000000;
      else if (priceRange === "1m-2m" && p.startingPrice) matchesPrice = p.startingPrice >= 1000000 && p.startingPrice < 2000000;
      else if (priceRange === "2m-3m" && p.startingPrice) matchesPrice = p.startingPrice >= 2000000 && p.startingPrice < 3000000;
      else if (priceRange === "over3m" && p.startingPrice) matchesPrice = p.startingPrice >= 3000000;
      
      let matchesPropertyType = true;
      if (propertyType !== "all") {
        matchesPropertyType = p.propertyTypes?.some(t => t.toLowerCase() === propertyType.toLowerCase());
      }

      let matchesDelivery = true;
      if (deliveryStatus === "ready" && p.deliveryDate) {
        matchesDelivery = new Date(p.deliveryDate) <= new Date();
      } else if (deliveryStatus === "upcoming" && p.deliveryDate) {
        matchesDelivery = new Date(p.deliveryDate) > new Date();
      }
      
      return matchesSearch && matchesPrice && matchesPropertyType && matchesDelivery;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return (a.startingPrice || 0) - (b.startingPrice || 0);
      if (sortBy === "price-high") return (b.startingPrice || 0) - (a.startingPrice || 0);
      if (sortBy === "delivery") {
        const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0;
        const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0;
        return dateA - dateB;
      }
      return 0;
    });

  const hasActiveFilters = priceRange !== "all" || propertyType !== "all" || deliveryStatus !== "all" || sortBy !== "recent" || query !== "";

  const clearAllFilters = () => {
    setQuery("");
    setPriceRange("all");
    setPropertyType("all");
    setDeliveryStatus("all");
    setSortBy("recent");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-primary to-primary/80 geometric-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Analyse Dubai Upcoming Projects
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Discover investment opportunities across Dubai's most promising projects and developments.
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTERS */}
      <section className="container mx-auto px-4 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card rounded-2xl border shadow-2xl overflow-hidden">
            {/* Top Section: Search + AI */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 border-b">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by project name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background"
                  />
                </div>

                <button
                  onClick={() => setShowAIModal(true)}
                  className="md:w-auto whitespace-nowrap px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Ask AI Assistant
                </button>
              </div>

              {/* Active Filters Chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4 items-center">
                  <span className="text-sm text-muted-foreground font-medium">Active filters:</span>
                  {query && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                      Search: "{query}"
                      <button onClick={() => setQuery("")} className="hover:bg-primary/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {priceRange !== "all" && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                      Price: {priceRange === "under1m" ? "Under 1M" : priceRange === "1m-2m" ? "1M-2M" : priceRange === "2m-3m" ? "2M-3M" : "Over 3M"}
                      <button onClick={() => setPriceRange("all")} className="hover:bg-primary/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {propertyType !== "all" && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1 capitalize">
                      Type: {propertyType}
                      <button onClick={() => setPropertyType("all")} className="hover:bg-primary/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {deliveryStatus !== "all" && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1 capitalize">
                      Delivery: {deliveryStatus}
                      <button onClick={() => setDeliveryStatus("all")} className="hover:bg-primary/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {sortBy !== "recent" && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                      Sort: {sortBy === "price-low" ? "Price Low-High" : sortBy === "price-high" ? "Price High-Low" : "Delivery Date"}
                      <button onClick={() => setSortBy("recent")} className="hover:bg-primary/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button onClick={clearAllFilters} className="text-sm text-primary hover:text-primary/80 font-medium underline">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Section: Filter Controls */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    Sort By
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="delivery">Delivery Date</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-1 h-4 bg-accent rounded-full"></div>
                    Price Range
                  </label>
                  <div className="relative">
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all"
                    >
                      <option value="all">All Prices</option>
                      <option value="under1m">Under AED 1M</option>
                      <option value="1m-2m">AED 1M - 2M</option>
                      <option value="2m-3m">AED 2M - 3M</option>
                      <option value="over3m">Over AED 3M</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    Property Type
                  </label>
                  <div className="relative">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all"
                    >
                      <option value="all">All Types</option>
                      <option value="apartment">Apartments</option>
                      <option value="villa">Villas</option>
                      <option value="penthouse">Penthouses</option>
                      <option value="townhouse">Townhouses</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Delivery Status */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-1 h-4 bg-accent rounded-full"></div>
                    Delivery
                  </label>
                  <div className="relative">
                    <select
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value)}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all"
                    >
                      <option value="all">All Projects</option>
                      <option value="ready">Ready to Move</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Results Counter */}
              {/* <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{filtered.length}</span> of{" "}
                  <span className="font-bold text-foreground">{projects.length}</span> projects
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="h-48 w-full overflow-hidden bg-muted">
                <img
                  src={p.image || "/placeholder.jpg"}
                  alt={p.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="p-5 space-y-2">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{p.name}</h3>

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

        {loading && (
          <p className="text-center text-muted-foreground mt-8">
            Loading more projects...
          </p>
        )}

        {hasMore && <div ref={loaderRef} className="h-10" />}

        {!hasMore && projects.length > 0 && (
          <p className="text-center text-muted-foreground mt-8">
            You've reached the end.
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
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
                    <p className="text-sm text-primary-foreground/80">Tell me what you're looking for</p>
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
                  Describe what kind of project you're looking for, and I'll help you find the perfect match.
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Try asking:</p>
                  <div className="space-y-2">
                    {[
                      "Show me luxury apartments ready to move in under 2M",
                      "Find villas with good ROI delivering in 2025",
                      "I want projects with low down payment and beach access"
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