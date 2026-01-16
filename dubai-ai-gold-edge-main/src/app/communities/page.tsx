"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { useEffect, useState } from "react";
import { MapPin, Search, ChevronDown, Sparkles, X, Send } from "lucide-react";
import Link from "next/link";

type Community = {
  id: number;
  name: string;
  slug: string | null;
  image: string | null;
  project_count: number;
  avg_prices: {
    property_type: string;
    avg_starting_price: number;
  }[];
};

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("projects");
  const [priceRange, setPriceRange] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  useEffect(() => {
    fetch("/api/getCommunities")
      .then((res) => res.json())
      .then((data) => setCommunities(data))
      .finally(() => setLoading(false));
  }, []);

  const getMinPrice = (community: Community) => {
    if (!community.avg_prices?.length) return 0;
    return Math.min(...community.avg_prices.map(p => p.avg_starting_price));
  };

  const filtered = communities
    .filter((c) => {
      const matchesSearch = c.name?.toLowerCase().includes(query.toLowerCase());
      const minPrice = getMinPrice(c);
      
      let matchesPrice = true;
      if (priceRange === "under1m") matchesPrice = minPrice < 1000000;
      else if (priceRange === "1m-3m") matchesPrice = minPrice >= 1000000 && minPrice < 3000000;
      else if (priceRange === "3m-5m") matchesPrice = minPrice >= 3000000 && minPrice < 5000000;
      else if (priceRange === "over5m") matchesPrice = minPrice >= 5000000;
      
      let matchesPropertyType = true;
      if (propertyType !== "all") {
        matchesPropertyType = c.avg_prices?.some(p => p.property_type === propertyType);
      }
      
      return matchesSearch && matchesPrice && matchesPropertyType;
    })
    .sort((a, b) => {
      if (sortBy === "projects") return b.project_count - a.project_count;
      if (sortBy === "price-low") return getMinPrice(a) - getMinPrice(b);
      if (sortBy === "price-high") return getMinPrice(b) - getMinPrice(a);
      return 0;
    });

  function formatPrice(value: number) {
    if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`;
    return `AED ${value}`;
  }

  const hasActiveFilters = priceRange !== "all" || propertyType !== "all" || sortBy !== "projects" || query !== "";

  const clearAllFilters = () => {
    setQuery("");
    setPriceRange("all");
    setPropertyType("all");
    setSortBy("projects");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Explore Dubai Promising Communities
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Discover investment opportunities across Dubai's most promising neighborhoods.
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
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by community name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background"
                  />
                </div>

                {/* AI Button */}
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
                      Price: {priceRange === "under1m" ? "Under 1M" : priceRange === "1m-3m" ? "1M-3M" : priceRange === "3m-5m" ? "3M-5M" : "Over 5M"}
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
                  {sortBy !== "projects" && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                      Sort: {sortBy === "price-low" ? "Price Low-High" : "Price High-Low"}
                      <button onClick={() => setSortBy("projects")} className="hover:bg-primary/20 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary hover:text-primary/80 font-medium underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Section: Filter Controls */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <option value="projects">Most Projects</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
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
                      <option value="1m-3m">AED 1M - 3M</option>
                      <option value="3m-5m">AED 3M - 5M</option>
                      <option value="over5m">Over AED 5M</option>
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
              </div>

              {/* Results Counter */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{filtered.length}</span> of{" "}
                  <span className="font-bold text-foreground">{communities.length}</span> communities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading communities...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="luxury-card group hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 rounded-xl border overflow-hidden flex flex-col"
              >
                {/* IMAGE */}
                <div className="h-44 bg-muted overflow-hidden relative">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No image available
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {c.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {c.project_count} projects available
                  </p>

                  {/* PRICE SNAPSHOT WITH TOOLTIP */}
                  {c.avg_prices?.length > 0 && (
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <div className="mb-4 space-y-1 cursor-pointer">
                            {c.avg_prices.slice(0, 2).map((p) => (
                              <div
                                key={p.property_type}
                                className="text-sm text-muted-foreground flex justify-between"
                              >
                                <span className="capitalize">
                                  {p.property_type}s from
                                </span>
                                <span className="font-medium text-foreground">
                                  {formatPrice(p.avg_starting_price)}
                                </span>
                              </div>
                            ))}

                            {c.avg_prices.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{c.avg_prices.length - 2} more property types
                              </p>
                            )}
                          </div>
                        </Tooltip.Trigger>

                        <Tooltip.Content
                          side="top"
                          align="center"
                          className="rounded-md bg-gray-800 text-white p-2 text-sm shadow-lg z-50"
                        >
                          {c.avg_prices.map((p) => (
                            <div
                              key={p.property_type}
                              className="flex justify-between mb-1"
                            >
                              <span className="capitalize">
                                {p.property_type}s:
                              </span>
                              <span className="font-medium ml-4">
                                {formatPrice(p.avg_starting_price)}
                              </span>
                            </div>
                          ))}
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  )}

                  {/* CTA BUTTONS */}
                  <div className="flex gap-3 mt-auto">
                    <Link
                      href={`/communities/${c.slug}`}
                      className="flex-1 text-center rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium cta-primary group-hover:shadow-gold transition-all"
                    >
                      Explore Community
                    </Link>

                    {c.project_count > 0 && (
                      <Link
                        href={`/communities/${c.slug}/projects`}
                        className="flex-1 text-center rounded-lg border border-primary text-primary py-2 text-sm font-medium hover:bg-primary/10 transition-all"
                      >
                        View Projects
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No communities found matching your criteria.
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
            {/* Modal Header */}
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

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Describe what kind of community you're looking for, and I'll help you find the perfect match.
                </p>

                {/* Example Prompts */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Try asking:</p>
                  <div className="space-y-2">
                    {[
                      "Show me family-friendly communities with villas under 3M",
                      "I want a luxury community near the beach with good investment returns",
                      "Find me communities with apartments for young professionals"
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

                {/* Text Input */}
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

            {/* Modal Footer */}
            <div className="p-6 border-t bg-muted/30">
              <button
                onClick={() => {
                  // Handle AI query here
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