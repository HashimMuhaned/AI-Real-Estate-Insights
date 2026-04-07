"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Home,
  Search,
  MapPin,
  Activity,
  Shield,
  Package,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  X,
  Info,
} from "lucide-react";
import { BsStars } from "react-icons/bs";
import Link from "next/link";
import { slugify } from "@/lib/slugify";
import { useChat } from "@/context/ChatContext";

interface AreaData {
  area_id: number;
  best_segment: string;
  location_name: string;
  area_name: string;
  image_url: string | null;
  avg_sale_price: string;
  avg_annual_rent: string;
  yield: string;
  growth: string;
  num_transactions: string;
  risk: string;
  supply: string;
}

/* ─── Skeleton Card ─────────────────────────────────────────── */
const SkeletonCard = () => (
  <Card className="overflow-hidden rounded-2xl border border-border bg-card animate-pulse">
    <div className="h-52 bg-muted" />
    <CardContent className="p-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 rounded-xl bg-muted" />
        <div className="h-14 rounded-xl bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 rounded-xl bg-muted" />
        <div className="h-14 rounded-xl bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded-lg bg-muted" />
        <div className="h-8 flex-1 rounded-lg bg-muted" />
      </div>
      <div className="h-11 rounded-xl bg-muted" />
    </CardContent>
  </Card>
);

/* ─── Main Component ─────────────────────────────────────────── */
const AreasPage = () => {
  const [selectedMode, setSelectedMode] = useState<
    "investment" | "residential"
  >("investment");
  const [searchTerm, setSearchTerm] = useState("");
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"yield" | "growth" | "risk">("yield");
  const [priceRange, setPriceRange] = useState("all");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { setAreaContext, setContextPrompt, openChat } = useChat();
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const handleOpenAI = () => {
    setAreaContext((prev) => ({
      ...prev,
      mode: selectedMode,
      sortBy,
      priceRange,
    }));

    setContextPrompt({
      topic: "Dubai Real Estate Investment",
      question: "What are the best areas to invest in?",
      prompt: `You are a Dubai real estate investment advisor. This investor is browsing ${selectedMode} opportunities across Dubai areas, currently filtering by ${
        priceRange === "all" ? "all price ranges" : priceRange
      } and sorting by ${sortBy}. Help them identify the best areas to invest in based on yield, growth potential, and risk profile. Ask clarifying questions about their budget, investment goals, and risk tolerance to give personalized recommendations.`,
    });

    setAiModalOpen(false);
    openChat();
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  /* Close tooltip on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setTooltipOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/AreasDisplayCards");
      const data = await response.json();
      setAreas(data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters =
    priceRange !== "all" || searchTerm !== "" || sortBy !== "yield";

  const clearAllFilters = () => {
    setSearchTerm("");
    setPriceRange("all");
    setSortBy("yield");
  };

  const filteredAreas = areas.filter((area) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      area.area_id.toString().includes(searchLower) ||
      area.best_segment.toLowerCase().includes(searchLower) ||
      area.location_name.toLowerCase().includes(searchLower) ||
      area.area_name.toLowerCase().includes(searchLower);

    const salePrice = parseFloat(area.avg_sale_price);
    let matchesPrice = true;
    if (priceRange === "under1m") matchesPrice = salePrice < 1_000_000;
    else if (priceRange === "1m-3m")
      matchesPrice = salePrice >= 1_000_000 && salePrice < 3_000_000;
    else if (priceRange === "3m-5m")
      matchesPrice = salePrice >= 3_000_000 && salePrice < 5_000_000;
    else if (priceRange === "over5m") matchesPrice = salePrice >= 5_000_000;

    return matchesSearch && matchesPrice;
  });

  const sortedAreas = [...filteredAreas].sort((a, b) => {
    if (sortBy === "yield") return parseFloat(b.yield) - parseFloat(a.yield);
    if (sortBy === "growth") return parseFloat(b.growth) - parseFloat(a.growth);
    if (sortBy === "risk") return parseFloat(a.risk) - parseFloat(b.risk);
    return 0;
  });

  const getRiskLevel = (risk: string) => {
    const v = parseFloat(risk);
    if (v < 0.3) return { label: "Low", color: "bg-emerald-500" };
    if (v < 0.6) return { label: "Medium", color: "bg-amber-500" };
    return { label: "High", color: "bg-red-500" };
  };

  const formatPrice = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1_000_000) return `AED ${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `AED ${(num / 1_000).toFixed(0)}K`;
    return `AED ${num}`;
  };

  const getDefaultImage = () =>
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop";

  const priceRangeLabel = (val: string) => {
    if (val === "under1m") return "< AED 1M";
    if (val === "1m-3m") return "AED 1M–3M";
    if (val === "3m-5m") return "AED 3M–5M";
    if (val === "over5m") return "> AED 5M";
    return "";
  };

  const segmentIcon = (segment: string) => {
    const s = segment.toLowerCase();
    if (s.includes("villa")) return "🏡";
    if (s.includes("penthouse")) return "🏙️";
    if (s.includes("townhouse")) return "🏘️";
    return "🏢";
  };

  const aiCapabilities = [
    { icon: TrendingUp, text: "Personalized investment picks" },
    { icon: Shield, text: "Risk assessment by profile" },
    { icon: Activity, text: "ROI projections & forecasts" },
    { icon: MapPin, text: "Best areas for your budget" },
    { icon: Sparkles, text: "Market trend analysis" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary) / 0.88), hsl(var(--primary) / 0.72))",
          }}
        />
        {/* Subtle geometric overlay */}
        <div className="absolute inset-0 hero-pattern opacity-40" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <div
              className="inline-flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border"
              style={{
                borderColor: "hsl(var(--accent) / 0.4)",
                background: "hsl(var(--accent) / 0.15)",
              }}
            >
              <MapPin
                className="w-4 h-4"
                style={{ color: "hsl(var(--accent))" }}
              />
              <span className="text-sm font-medium">
                Dubai Real Estate Markets
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-5 tracking-tight leading-tight">
              Discover Prime Investment Areas
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Explore data-driven insights across Dubai's most lucrative
              neighborhoods.
            </p>

            {/* Hero stats bar */}
            {!loading && areas.length > 0 && (
              <div
                className="mt-10 inline-flex gap-8 px-8 py-4 rounded-2xl backdrop-blur-sm border border-white/10"
                style={{ background: "hsl(var(--primary) / 0.4)" }}
              >
                {[
                  { value: areas.length, label: "Areas Tracked" },
                  {
                    value: `${Math.max(...areas.map((a) => parseFloat(a.yield))).toFixed(1)}%`,
                    label: "Peak Yield",
                  },
                  {
                    value: areas
                      .reduce((s, a) => s + parseInt(a.num_transactions), 0)
                      .toLocaleString(),
                    label: "Transactions",
                  },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "hsl(var(--accent))" }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-primary-foreground/60 mt-0.5 font-medium uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Mode Toggle ──────────────────────────────────────── */}
      <section className="py-6 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                What are you looking for?
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Customize your view based on your goals
              </p>
            </div>
            <div className="rounded-2xl p-1.5 inline-flex gap-1.5 bg-muted">
              {(["investment", "residential"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={selectedMode === mode ? "default" : "ghost"}
                  size="lg"
                  onClick={() => setSelectedMode(mode)}
                  className={`rounded-xl transition-all capitalize font-semibold ${
                    selectedMode === mode ? "shadow-md" : "hover:bg-card"
                  }`}
                  style={
                    selectedMode === mode
                      ? {
                          background: "hsl(var(--primary))",
                          color: "hsl(var(--primary-foreground))",
                        }
                      : {}
                  }
                >
                  {mode === "investment" ? (
                    <TrendingUp className="w-4 h-4 mr-2" />
                  ) : (
                    <Home className="w-4 h-4 mr-2" />
                  )}
                  {mode === "investment" ? "Investment" : "Residential"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main: Sidebar + Grid ─────────────────────────────── */}
      <section className="py-10">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <aside
              className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6"
              style={{ alignSelf: "flex-start" }}
            >
              <Card className="rounded-2xl overflow-visible shadow-md border border-border bg-card">
                <CardContent className="p-4 space-y-4">
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
                        placeholder="Area name, location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 rounded-lg border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background text-sm text-foreground placeholder:text-muted-foreground"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border" />

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
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background cursor-pointer transition-all text-sm font-medium text-foreground"
                      >
                        <option value="all">All Prices</option>
                        <option value="under1m">Under AED 1M</option>
                        <option value="1m-3m">AED 1M – 3M</option>
                        <option value="3m-5m">AED 3M – 5M</option>
                        <option value="over5m">Over AED 5M</option>
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
                          {
                            key: "yield",
                            label: "Highest Yield",
                            icon: TrendingUp,
                          },
                          {
                            key: "growth",
                            label: "Most Growth",
                            icon: Activity,
                          },
                          { key: "risk", label: "Lowest Risk", icon: Shield },
                        ] as const
                      ).map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setSortBy(key)}
                          className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium text-left ${
                            sortBy === key
                              ? "border-primary text-primary-foreground"
                              : "bg-background border-border text-foreground hover:bg-muted"
                          }`}
                          style={
                            sortBy === key
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

                  {/* AI Button + "What can it do?" link */}
                  <div className="space-y-2">
                    <button
                      onClick={handleOpenAI}
                      className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
                      style={{
                        background: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                      }}
                    >
                      <BsStars className="text-sm flex-shrink-0" />
                      Get AI Recommendations
                    </button>
                    <div className="text-center">
                      <button
                        onClick={() => setAiModalOpen(true)}
                        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                      >
                        What can the AI do for me?
                      </button>
                    </div>
                  </div>

                  {/* Active Filters */}
                  {hasActiveFilters && (
                    <>
                      <div className="border-t border-border" />
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
                          {searchTerm && (
                            <span
                              className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-medium"
                              style={{
                                background: "hsl(var(--primary) / 0.1)",
                                color: "hsl(var(--primary))",
                              }}
                            >
                              "
                              {searchTerm.length > 10
                                ? searchTerm.slice(0, 10) + "…"
                                : searchTerm}
                              "
                              <button
                                onClick={() => setSearchTerm("")}
                                className="hover:opacity-70 transition-opacity"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          )}
                          {priceRange !== "all" && (
                            <span
                              className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-medium"
                              style={{
                                background: "hsl(var(--accent) / 0.15)",
                                color: "hsl(var(--primary))",
                              }}
                            >
                              {priceRangeLabel(priceRange)}
                              <button
                                onClick={() => setPriceRange("all")}
                                className="hover:opacity-70 transition-opacity"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          )}
                          {sortBy !== "yield" && (
                            <span
                              className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-medium"
                              style={{
                                background: "hsl(var(--primary) / 0.1)",
                                color: "hsl(var(--primary))",
                              }}
                            >
                              {sortBy === "growth" ? "Growth" : "Low Risk"}
                              <button
                                onClick={() => setSortBy("yield")}
                                className="hover:opacity-70 transition-opacity"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    </>
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
                        {loading ? "…" : `${sortedAreas.length} areas`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* ═══ CARDS GRID ════════════════════════════════════ */}
            <div className="flex-1 min-w-0">
              {/* Results header */}
              {!loading && (
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {sortedAreas.length}
                    </span>{" "}
                    areas found
                    {searchTerm && (
                      <>
                        {" "}
                        for{" "}
                        <span className="font-semibold text-foreground">
                          "{searchTerm}"
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Sorted by{" "}
                    <span className="font-semibold text-foreground capitalize">
                      {sortBy === "yield"
                        ? "highest yield"
                        : sortBy === "growth"
                          ? "most growth"
                          : "lowest risk"}
                    </span>
                  </p>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sortedAreas.map((area) => {
                    const riskInfo = getRiskLevel(area.risk);
                    const isGrowthPositive = parseFloat(area.growth) > 0;
                    const areaSlug = slugify(area.area_name);

                    return (
                      <Card
                        key={area.area_id}
                        className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-border rounded-2xl bg-card"
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={area.image_url || getDefaultImage()}
                            alt={`${area.location_name} - ${area.area_name}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(to top, hsl(var(--primary) / 0.92) 0%, hsl(var(--primary) / 0.45) 55%, transparent 100%)",
                            }}
                          />

                          {/* Top badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                            <Badge
                              className="px-2 py-1 text-xs font-bold border-0"
                              style={{
                                background: "hsl(var(--accent))",
                                color: "hsl(var(--accent-foreground))",
                              }}
                            >
                              #{area.area_id}
                            </Badge>
                            <Badge
                              className={`${riskInfo.color} text-white px-2 py-1 text-xs font-semibold border-0`}
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              {riskInfo.label} Risk
                            </Badge>
                          </div>

                          {/* Bottom overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin
                                className="w-3 h-3 flex-shrink-0"
                                style={{ color: "hsl(var(--accent))" }}
                              />
                              <span className="text-xs text-white/70 font-medium truncate">
                                {area.location_name}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-white leading-tight mb-2 truncate">
                              {area.area_name}
                            </h3>
                            {/* Best Segment pill */}
                            <div
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                              style={{
                                background: "hsl(var(--accent) / 0.2)",
                                border: "1px solid hsl(var(--accent) / 0.5)",
                                backdropFilter: "blur(6px)",
                              }}
                            >
                              <span className="text-sm leading-none">
                                {segmentIcon(area.best_segment)}
                              </span>
                              <span className="text-white text-xs font-semibold">
                                {area.best_segment}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <CardContent className="p-4">
                          {/* Price Row */}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="rounded-xl p-2.5 bg-muted">
                              <div className="flex items-center gap-1 mb-1">
                                <Home className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Avg Sale
                                </span>
                              </div>
                              <div className="font-bold text-xs text-foreground">
                                {formatPrice(area.avg_sale_price)}
                              </div>
                            </div>
                            <div
                              className="rounded-xl p-2.5"
                              style={{ background: "hsl(var(--accent) / 0.1)" }}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <TrendingUp
                                  className="w-3 h-3"
                                  style={{ color: "hsl(var(--accent))" }}
                                />
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Rent/yr
                                </span>
                              </div>
                              <div
                                className="font-bold text-xs"
                                style={{ color: "hsl(var(--primary))" }}
                              >
                                {formatPrice(area.avg_annual_rent)}
                              </div>
                            </div>
                          </div>

                          {/* Yield & Growth */}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="rounded-xl p-2.5 bg-muted">
                              <div className="flex items-center gap-1 mb-1">
                                <TrendingUp
                                  className="w-3 h-3"
                                  style={{ color: "hsl(var(--accent))" }}
                                />
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Yield
                                </span>
                              </div>
                              <div
                                className="text-lg font-bold"
                                style={{ color: "hsl(var(--accent))" }}
                              >
                                {parseFloat(area.yield).toFixed(2)}%
                              </div>
                            </div>
                            <div
                              className="rounded-xl p-2.5"
                              style={{
                                background: isGrowthPositive
                                  ? "hsl(160 70% 35% / 0.08)"
                                  : "hsl(0 70% 50% / 0.08)",
                              }}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {isGrowthPositive ? (
                                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                                )}
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Growth
                                </span>
                              </div>
                              <div
                                className="text-lg font-bold"
                                style={{
                                  color: isGrowthPositive
                                    ? "hsl(160 70% 30%)"
                                    : "hsl(0 70% 50%)",
                                }}
                              >
                                {parseFloat(area.growth) > 0 ? "+" : ""}
                                {parseFloat(area.growth).toFixed(2)}%
                              </div>
                            </div>
                          </div>

                          {/* Transactions + Supply */}
                          <div className="flex gap-2 mb-3">
                            <div className="flex items-center gap-1.5 flex-1 px-2.5 py-1.5 rounded-lg bg-muted">
                              <Activity className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">
                                {parseInt(
                                  area.num_transactions,
                                ).toLocaleString()}{" "}
                                deals
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-1 px-2.5 py-1.5 rounded-lg bg-muted">
                              <Package className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">
                                {area.supply} supply
                              </span>
                            </div>
                          </div>

                          {/* CTA */}
                          <Link
                            href={`/locations/${areaSlug}-${area.area_id}`}
                          >
                            <Button
                              className="w-full text-primary-foreground rounded-xl h-10 font-semibold border-0 hover:opacity-90 transition-opacity text-sm"
                              style={{ background: "hsl(var(--primary))" }}
                            >
                              View Analysis
                              <ArrowUpRight className="w-4 h-4 ml-1.5" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!loading && sortedAreas.length === 0 && (
                <div className="text-center py-24 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-muted">
                    <MapPin className="w-9 h-9 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No areas found
                  </h3>
                  <p className="text-muted-foreground text-sm mb-5">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm font-semibold px-5 py-2 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* ═══ AI CAPABILITIES MODAL ══════════════════════════ */}
      {aiModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "hsl(var(--primary) / 0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setAiModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="px-6 pt-6 pb-5 border-b border-border"
              style={{ background: "hsl(var(--primary))" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(var(--accent))" }}
                  >
                    <BsStars
                      className="text-lg"
                      style={{ color: "hsl(var(--accent-foreground))" }}
                    />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-primary-foreground leading-tight">
                      AI Investment Assistant
                    </h2>
                    <p className="text-xs text-primary-foreground/60 mt-0.5">
                      Powered by advanced analytics
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAiModalOpen(false)}
                  className="text-primary-foreground/50 hover:text-primary-foreground transition-colors mt-0.5 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI advisor analyzes real-time Dubai market data to give you
                personalized, data-backed investment guidance — tailored to your
                goals and risk profile.
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    icon: TrendingUp,
                    title: "Personalized investment picks",
                    desc: "Areas ranked by yield, growth, and fit for your budget.",
                  },
                  {
                    icon: Shield,
                    title: "Risk assessment by profile",
                    desc: "Understand exposure and volatility before you commit.",
                  },
                  {
                    icon: Activity,
                    title: "ROI projections & forecasts",
                    desc: "Estimated returns based on historical market patterns.",
                  },
                  {
                    icon: MapPin,
                    title: "Best areas for your budget",
                    desc: "Filtered recommendations matched to your price range.",
                  },
                  {
                    icon: Sparkles,
                    title: "Market trend analysis",
                    desc: "What's heating up, what's cooling down, right now.",
                  },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border bg-background"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "hsl(var(--primary) / 0.08)" }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: "hsl(var(--primary))" }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 space-y-2.5">
              <button
                onClick={handleOpenAI}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                style={{
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                <BsStars className="text-sm" />
                Start AI Conversation
              </button>
              <button
                onClick={() => setAiModalOpen(false)}
                className="w-full py-2.5 rounded-xl font-medium text-sm border-2 border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreasPage;
