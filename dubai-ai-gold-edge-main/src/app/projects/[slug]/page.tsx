"use client";

import React, { useEffect, useState, useRef } from "react";
import { notFound } from "next/navigation";
import {
  Building2,
  MapPin,
  TrendingUp,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  Bed,
  Bath,
  Ruler,
  Clock,
  Award,
  FileText,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  Home,
  Package,
  BarChart3,
  Info,
  Send,
  Sparkles,
  History,
  TrendingDown,
  ExternalLink,
} from "lucide-react";
import MarkdownRenderer from "@/helpers/OrgLLMRES";

type PageProps = {
  params: {
    slug: string;
  };
};

const InvestmentMetric = ({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value?: string | number | null;
  icon?: any;
  highlight?: boolean;
}) => {
  return (
    <div
      className={`bg-white rounded-xl p-4 sm:p-6 transition-all duration-300 ${
        highlight
          ? "shadow-[0_8px_30px_-8px_hsl(45,85%,55%,0.25)] border-2 border-[hsl(45,85%,55%)]"
          : "shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] hover:shadow-[0_8px_30px_-8px_hsl(45,85%,55%,0.25)]"
      }`}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        {Icon && (
          <div
            className={`p-2 sm:p-2.5 rounded-lg ${
              highlight
                ? "bg-gradient-to-br from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)]"
                : "bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)]"
            }`}
          >
            <Icon
              className={`h-4 w-4 sm:h-5 sm:w-5 ${highlight ? "text-white" : "text-[hsl(210,80%,12%)]"}`}
            />
          </div>
        )}
      </div>
      <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/60 mb-1 sm:mb-1.5 font-medium">
        {label}
      </p>
      <p
        className={`text-lg sm:text-2xl font-bold ${
          highlight
            ? "bg-gradient-to-r from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] bg-clip-text text-transparent"
            : "text-[hsl(210,80%,12%)]"
        }`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
};

const ImageGallery = ({
  images,
  projectName,
}: {
  images: any[];
  projectName: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const imageUrls = images
    .map((img) => img.url || img.variant)
    .filter((url) => url && url.trim() !== "");

  if (imageUrls.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);

  return (
    <>
      <div className="relative">
        <div className="relative h-56 sm:h-80 md:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)]">
          <img
            src={imageUrls[currentIndex]}
            alt={`${projectName} - View ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
            onClick={() => setIsLightboxOpen(true)}
          />
          <button
            onClick={prev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(210,80%,12%)]" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(210,80%,12%)]" />
          </button>
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-[hsl(210,80%,12%)]/80 backdrop-blur-sm px-2.5 sm:px-4 py-1 sm:py-2 rounded-full text-white text-xs sm:text-sm font-semibold">
            {currentIndex + 1} / {imageUrls.length}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2">
          {imageUrls.slice(0, 8).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? "border-[hsl(45,85%,55%)] scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {isLightboxOpen && (
        <div className="fixed inset-0 bg-[hsl(210,80%,12%)]/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 p-2 sm:p-3 rounded-full hover:bg-white/20 transition-all"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </button>
          <button
            onClick={prev}
            className="absolute left-3 sm:left-6 bg-white/10 p-2 sm:p-3 rounded-full hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </button>
          <img
            src={imageUrls[currentIndex]}
            alt={`${projectName} - View ${currentIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
          />
          <button
            onClick={next}
            className="absolute right-3 sm:right-6 bg-white/10 p-2 sm:p-3 rounded-full hover:bg-white/20 transition-all"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </button>
          <div className="absolute bottom-4 sm:bottom-6 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-sm font-semibold">
            {currentIndex + 1} / {imageUrls.length}
          </div>
        </div>
      )}
    </>
  );
};

const SimilarProjectCard = ({ project }: { project: any }) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`;
    return `${(price / 1000).toFixed(0)}K`;
  };

  const getStockBadge = (stock: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      available: {
        text: "Available",
        className: "bg-emerald-100 text-emerald-700",
      },
      limited: { text: "Limited", className: "bg-amber-100 text-amber-700" },
      might_be_sold_out: {
        text: "Almost Sold Out",
        className: "bg-orange-100 text-orange-700",
      },
      sold_out: { text: "Sold Out", className: "bg-red-100 text-red-700" },
    };
    return badges[stock] || badges.available;
  };

  const stockBadge = getStockBadge(project.stock);

  return (
    <div className="flex-shrink-0 w-[300px] sm:w-[380px] bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] overflow-hidden hover:shadow-[0_8px_30px_-8px_hsl(45,85%,55%,0.25)] transition-all group/card">
      <div className="relative h-44 sm:h-[240px] overflow-hidden">
        <img
          src={project.image}
          alt={project.project_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${stockBadge.className}`}
          >
            {stockBadge.text}
          </span>
          {project.hotness > 70 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-br from-orange-500 to-red-500 text-white">
              High Demand
            </span>
          )}
        </div>
        {project.developer?.logo_url && (
          <div className="absolute top-3 right-3 bg-white rounded-lg p-1.5 shadow-lg">
            <img
              src={project.developer.logo_url}
              alt={project.developer.name}
              className="h-6 sm:h-8 w-auto object-contain"
            />
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-xl font-bold text-[hsl(210,80%,12%)] mb-1 line-clamp-1">
          {project.project_name}
        </h3>
        {project.developer?.name && (
          <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/60 mb-3">
            by {project.developer.name}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)] rounded-lg p-2.5">
            <p className="text-xs text-[hsl(210,60%,20%)]/60 mb-0.5">From</p>
            <p className="text-sm sm:text-base font-bold text-[hsl(210,80%,12%)]">
              AED {formatPrice(project.starting_price)}
            </p>
          </div>
          {project.down_payment && (
            <div className="bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)] rounded-lg p-2.5">
              <p className="text-xs text-[hsl(210,60%,20%)]/60 mb-0.5">
                Down Payment
              </p>
              <p className="text-sm sm:text-base font-bold text-[hsl(210,80%,12%)]">
                {project.down_payment}%
              </p>
            </div>
          )}
        </div>
        {project.delivery_date && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[hsl(210,60%,20%)]/70 mb-3">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[hsl(45,85%,55%)]" />
            <span>
              Delivery:{" "}
              {new Date(project.delivery_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </span>
          </div>
        )}
        {project.amenities && project.amenities.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-[hsl(210,60%,20%)]/60 mb-1.5">
              Key Amenities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.amenities
                .slice(0, 3)
                .map((amenity: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[hsl(210,60%,20%)]/5 rounded text-xs text-[hsl(210,60%,20%)]/70"
                  >
                    {amenity}
                  </span>
                ))}
              {project.amenities.length > 3 && (
                <span className="px-2 py-0.5 bg-[hsl(210,60%,20%)]/5 rounded text-xs text-[hsl(210,60%,20%)]/70">
                  +{project.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        <button className="w-full px-4 py-2.5 bg-white border-2 border-[hsl(210,80%,12%)] text-[hsl(210,80%,12%)] rounded-lg text-sm font-semibold hover:bg-[hsl(210,80%,12%)] hover:text-white transition-all flex items-center justify-center gap-2 group-hover/card:border-[hsl(45,85%,55%)] group-hover/card:bg-[hsl(45,85%,55%)] group-hover/card:text-white">
          View Details
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const SimilarProjects = ({ projects }: { projects: any[] }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10,
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  if (!projects || projects.length === 0) return null;

  return (
    <section id="similar-projects" className="relative">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-1 sm:mb-2">
          Similar Investment Opportunities
        </h2>
        <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/60">
          Explore other projects that match your investment criteria
        </p>
      </div>
      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(210,80%,12%)]" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(210,80%,12%)]" />
          </button>
        )}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {projects.map((project, idx) => (
            <div key={project.project_id || idx} className="snap-start">
              <SimilarProjectCard project={project} />
            </div>
          ))}
        </div>
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-12 sm:w-20 bg-gradient-to-r from-[hsl(35,25%,88%)] to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-4 w-12 sm:w-20 bg-gradient-to-l from-[hsl(25,20%,92%)] to-transparent pointer-events-none" />
        )}
      </div>
    </section>
  );
};

const UnitsByPropertyType = ({ units }: { units: any[] }) => {
  const groupedUnits = units.reduce((acc: any, unit: any) => {
    const type = unit.property_type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(unit);
    return acc;
  }, {});

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    return `${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {Object.entries(groupedUnits).map(
        ([propertyType, typeUnits]: [string, any]) => (
          <div key={propertyType}>
            <h3 className="text-sm sm:text-base font-bold text-[hsl(210,60%,20%)]/50 uppercase tracking-wide mb-3">
              {propertyType}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {typeUnits
                .sort((a: any, b: any) => a.bedrooms - b.bedrooms)
                .map((unit: any, idx: number) => (
                  <UnitRow key={idx} unit={unit} formatPrice={formatPrice} />
                ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
};

const UnitRow = ({
  unit,
  formatPrice,
}: {
  unit: any;
  formatPrice: (price: number) => string;
}) => {
  const [showLayouts, setShowLayouts] = useState(false);
  const hasLayouts = unit.layouts && unit.layouts.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[hsl(210,60%,20%)]/10 overflow-hidden hover:shadow-md transition-all">
      <div className="p-3 sm:p-5">
        {/* Mobile: stacked layout, Desktop: row layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-4 sm:gap-8 flex-1 flex-wrap">
            <div>
              <p className="text-base sm:text-lg font-bold text-[hsl(210,80%,12%)]">
                {unit.bedrooms} Bed{unit.bedrooms !== 1 ? "s" : ""}
              </p>
            </div>
            {unit.starting_price > 0 && (
              <div>
                <p className="text-xs text-[hsl(210,60%,20%)]/60 mb-0.5">
                  from
                </p>
                <p className="text-base sm:text-lg font-bold text-[hsl(210,80%,12%)]">
                  {formatPrice(unit.starting_price)} AED
                </p>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[hsl(210,60%,20%)]/70">
              <Ruler className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">
                {unit.area.from?.toLocaleString()}–
                {unit.area.to?.toLocaleString()} sqft
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasLayouts && (
              <button
                onClick={() => setShowLayouts(!showLayouts)}
                className="p-2 hover:bg-[hsl(210,60%,20%)]/5 rounded-lg transition-all"
              >
                <ChevronRight
                  className={`h-4 w-4 sm:h-5 sm:w-5 text-[hsl(210,60%,20%)] transition-transform ${showLayouts ? "rotate-90" : ""}`}
                />
              </button>
            )}
            <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white border-2 border-[hsl(210,80%,12%)] text-[hsl(210,80%,12%)] rounded-lg text-xs sm:text-sm font-semibold hover:bg-[hsl(210,80%,12%)] hover:text-white transition-all flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Inquire
            </button>
          </div>
        </div>

        {showLayouts && hasLayouts && (
          <div className="mt-4 pt-4 border-t border-[hsl(210,60%,20%)]/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {unit.layouts.map((layout: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)] rounded-lg"
                >
                  <p className="font-bold text-[hsl(210,80%,12%)] text-xs sm:text-sm mb-1.5">
                    {layout.layout_type}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[hsl(210,60%,20%)]/70 mb-2">
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      {layout.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      {layout.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      {layout.area?.toLocaleString()} sqft
                    </span>
                  </div>
                  {layout.floor_plans?.length > 0 &&
                    layout.floor_plans[0].image_url && (
                      <div className="rounded-lg overflow-hidden border border-[hsl(210,60%,20%)]/20 hover:border-[hsl(45,85%,55%)] transition-all cursor-pointer">
                        <img
                          src={layout.floor_plans[0].image_url}
                          alt={`${layout.layout_type} floor plan`}
                          className="w-full h-auto bg-white p-2"
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentPlan = ({ plan }: { plan: any }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] p-4 sm:p-6 hover:shadow-[0_8px_30px_-8px_hsl(45,85%,55%,0.25)] transition-all">
      <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
        <div className="p-2 sm:p-2.5 bg-gradient-to-br from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] rounded-lg">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <h3 className="text-base sm:text-xl font-bold text-[hsl(210,80%,12%)]">
          {plan.payment_plan}
        </h3>
      </div>
      <div className="space-y-4 sm:space-y-5">
        {plan.phases?.map((phase: any, idx: number) => (
          <div
            key={idx}
            className="border-l-2 border-[hsl(45,85%,55%)] pl-3 sm:pl-4"
          >
            <h4 className="font-bold text-[hsl(210,80%,12%)] mb-2 capitalize text-xs sm:text-sm">
              {phase.label.replace(/_/g, " ")}
              <span className="ml-2 text-xs font-normal text-[hsl(210,60%,20%)]/60">
                ({phase.percentage}% total)
              </span>
            </h4>
            <div className="space-y-1.5">
              {phase.milestones?.map((milestone: any, mIdx: number) => (
                <div
                  key={mIdx}
                  className="flex items-center justify-between text-xs sm:text-sm p-2.5 sm:p-3 bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)] rounded-lg"
                >
                  <span className="text-[hsl(210,60%,20%)]/70">
                    {milestone.label}
                  </span>
                  <span className="font-bold text-[hsl(210,80%,12%)]">
                    {milestone.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimelineItem = ({
  phase,
  isLast,
  constructionProgress,
}: {
  phase: any;
  isLast: boolean;
  constructionProgress?: number;
}) => {
  const isConstructionPhase = phase.phase_key === "under_construction";
  const showProgressBar =
    isConstructionPhase && phase.completed && constructionProgress != null;

  const getPhaseTitle = (phaseKey: string) => {
    const titles: Record<string, string> = {
      booking_started: "Booking Started",
      under_construction: "Construction Started",
      sold_out: "Sold Out",
      completed: "Expected Completion",
    };
    return titles[phaseKey] || phase.title;
  };

  return (
    <div className="relative flex gap-3 sm:gap-6">
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md ${phase.completed ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)]"}`}
        >
          {phase.completed ? (
            <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          ) : (
            <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-[hsl(210,60%,20%)]" />
          )}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-full mt-2 ${phase.completed ? "bg-gradient-to-b from-emerald-500 to-teal-600" : "bg-[hsl(210,60%,20%)]/20"}`}
          />
        )}
      </div>
      <div className="flex-1 pb-6 sm:pb-10">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)]">
          <h4 className="text-sm sm:text-lg font-bold text-[hsl(210,80%,12%)] mb-1.5">
            {getPhaseTitle(phase.phase_key)}
          </h4>
          {phase.phase_date && (
            <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/70 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[hsl(45,85%,55%)]" />
              {new Date(phase.phase_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {showProgressBar && (
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/70">
                  Construction progress
                </p>
                <p className="text-base sm:text-lg font-bold text-[hsl(210,80%,12%)]">
                  {constructionProgress}%
                </p>
              </div>
              <div className="h-2 bg-[hsl(210,60%,20%)]/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-500 to-teal-600"
                  style={{ width: `${constructionProgress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-[hsl(210,60%,20%)]/60">
                Latest update:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SalesHistory = ({ history }: { history: any[] }) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`;
    return `${(price / 1000).toFixed(0)}K`;
  };

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime(),
  );

  return (
    <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] overflow-hidden">
      <div className="bg-gradient-to-br from-[hsl(210,80%,12%)] to-[hsl(210,60%,20%)] p-4 sm:p-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-sm rounded-lg">
            <History className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-bold text-white">
              Sales Performance History
            </h3>
            <p className="text-white/70 text-xs sm:text-sm">
              Track pricing and availability trends over time
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px]">
          <thead>
            <tr className="bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)]">
              {[
                "Date",
                "Starting Price",
                "Sales Phase",
                "Demand Level",
                "Availability",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-[hsl(210,80%,12%)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedHistory.map((record, idx) => (
              <tr
                key={idx}
                className={`border-b border-[hsl(210,60%,20%)]/10 hover:bg-gradient-to-br hover:from-[hsl(35,25%,88%)]/30 hover:to-[hsl(25,20%,92%)]/30 transition-all ${idx === 0 ? "bg-[hsl(45,85%,55%)]/5" : ""}`}
              >
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[hsl(210,60%,20%)]/60" />
                    <span className="text-xs sm:text-sm text-[hsl(210,80%,12%)] font-medium">
                      {new Date(record.captured_at).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </span>
                    {idx === 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-gradient-to-br from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] text-white text-xs font-bold rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-[hsl(45,85%,55%)]" />
                    <span className="text-xs sm:text-sm font-bold text-[hsl(210,80%,12%)]">
                      AED {formatPrice(record.starting_price)}
                    </span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <span className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/70 capitalize">
                    {record.sales_phase || "—"}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 sm:w-1.5 h-4 sm:h-6 rounded-full ${i < Math.floor(record.hotness_level / 10) ? "bg-gradient-to-t from-orange-600 to-red-500" : "bg-[hsl(210,60%,20%)]/10"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[hsl(210,80%,12%)]">
                      {record.hotness_level}/100
                    </span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <span
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold ${record.stock_availability === "available" ? "bg-emerald-100 text-emerald-700" : record.stock_availability === "limited" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                  >
                    {record.stock_availability
                      ?.replace(/_/g, " ")
                      .toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedHistory.length > 1 && (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-[hsl(35,25%,88%)]/30 to-[hsl(25,20%,92%)]/30 border-t border-[hsl(210,60%,20%)]/10">
          <div className="grid grid-cols-3 gap-3">
            {(() => {
              const priceChange =
                sortedHistory[0].starting_price -
                sortedHistory[sortedHistory.length - 1].starting_price;
              const priceChangePercent =
                (priceChange /
                  sortedHistory[sortedHistory.length - 1].starting_price) *
                100;
              const demandChange =
                sortedHistory[0].hotness_level -
                sortedHistory[sortedHistory.length - 1].hotness_level;
              return (
                <>
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                    <div
                      className={`p-1.5 rounded-lg ${priceChange >= 0 ? "bg-emerald-100" : "bg-red-100"}`}
                    >
                      {priceChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-[hsl(210,60%,20%)]/60">
                        Price Change
                      </p>
                      <p
                        className={`text-sm sm:text-lg font-bold ${priceChange >= 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {priceChange >= 0 ? "+" : ""}
                        {priceChangePercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                    <div
                      className={`p-1.5 rounded-lg ${demandChange >= 0 ? "bg-orange-100" : "bg-blue-100"}`}
                    >
                      {demandChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-[hsl(210,60%,20%)]/60">
                        Demand
                      </p>
                      <p
                        className={`text-sm sm:text-lg font-bold ${demandChange >= 0 ? "text-orange-600" : "text-blue-600"}`}
                      >
                        {demandChange >= 0 ? "+" : ""}
                        {demandChange} pts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                    <div className="p-1.5 rounded-lg bg-[hsl(210,80%,12%)]/10">
                      <History className="h-4 w-4 text-[hsl(210,80%,12%)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[hsl(210,60%,20%)]/60">
                        Records
                      </p>
                      <p className="text-sm sm:text-lg font-bold text-[hsl(210,80%,12%)]">
                        {sortedHistory.length}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

const AIAssistant = ({
  projectName,
  projectData,
}: {
  projectName: string;
  projectData: any;
}) => {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([
    {
      role: "assistant",
      content: `Hello! I'm your AI assistant for ${projectName}. I can answer questions about pricing, payment plans, amenities, construction progress, and more. How can I help you?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are an AI assistant helping with questions about the real estate project "${projectName}". 
              
Project data:
- Starting Price: AED ${projectData.status?.starting_price?.toLocaleString() || "N/A"}
- Down Payment: ${projectData.status?.down_payment_percentage || "N/A"}%
- Location: ${projectData.location?.name || "N/A"}, Dubai
- Developer: ${projectData.developer?.name || "N/A"}
- Completion Date: ${projectData.status?.delivery_date ? new Date(projectData.status.delivery_date).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A"}
- Construction Progress: ${projectData.status?.construction_progress || "N/A"}%
- Available Unit Types: ${projectData.unit_categories?.map((u: any) => `${u.bedrooms}BR`).join(", ") || "N/A"}
- Amenities: ${projectData.amenities?.join(", ") || "N/A"}

User Question: ${userMessage}

Provide a helpful, accurate answer based on the project data above.`,
            },
          ],
        }),
      });
      const data = await response.json();
      const aiResponse =
        data.content?.[0]?.text ||
        "I apologize, but I couldn't process that request. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] overflow-hidden">
      <div className="bg-gradient-to-br from-[hsl(210,80%,12%)] to-[hsl(210,60%,20%)] p-4 sm:p-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-sm rounded-lg">
            <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-bold text-white">
              AI Property Assistant
            </h3>
            <p className="text-white/70 text-xs sm:text-sm">
              Ask me anything about this investment
            </p>
          </div>
        </div>
      </div>

      <div className="h-72 sm:h-[500px] overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-br from-[hsl(35,25%,88%)]/30 to-[hsl(25,20%,92%)]/30">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-xl ${msg.role === "user" ? "bg-gradient-to-br from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] text-white shadow-[0_8px_30px_-8px_hsl(45,85%,55%,0.25)]" : "bg-white text-[hsl(210,80%,12%)] shadow-md"}`}
            >
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md">
              <div className="flex gap-1.5">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-[hsl(210,60%,20%)]/50 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[hsl(210,60%,20%)]/10 p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about pricing, amenities..."
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-[hsl(210,60%,20%)]/20 rounded-lg focus:outline-none focus:border-[hsl(45,85%,55%)] transition-all bg-white text-xs sm:text-sm"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FAQItem = ({ faq }: { faq: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] overflow-hidden transition-all hover:shadow-[0_8px_30px_-8px_hsl(45,85%,55%,0.25)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-6 flex items-center justify-between gap-3 text-left hover:bg-gradient-to-br hover:from-[hsl(35,25%,88%)]/30 hover:to-[hsl(25,20%,92%)]/30 transition-all"
      >
        <div className="flex items-start gap-2.5 flex-1">
          <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(45,85%,55%)] flex-shrink-0 mt-0.5" />
          <h4 className="text-sm sm:text-lg font-bold text-[hsl(210,80%,12%)]">
            {faq.question}
          </h4>
        </div>
        <ChevronRight
          className={`h-4 w-4 sm:h-5 sm:w-5 text-[hsl(210,60%,20%)] flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
          <div className="pl-6 sm:pl-8 border-l-2 border-[hsl(45,85%,55%)]/30">
            <div
              className="prose prose-sm max-w-none text-[hsl(210,60%,20%)]/80"
              dangerouslySetInnerHTML={{ __html: faq.answer_html }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProjectPage({ params }: PageProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "description", label: "Description" },
    { id: "gallery", label: "Gallery" },
    { id: "units", label: "Units" },
    { id: "payment", label: "Payment" },
    { id: "timeline", label: "Timeline" },
    { id: "sales-history", label: "History" },
    { id: "amenities", label: "Amenities" },
    { id: "master-plan", label: "Master Plan" },
    { id: "similar-projects", label: "Similar" },
    { id: "location", label: "Location" },
    { id: "faqs", label: "FAQs" },
    { id: "ai-assistant", label: "Ask AI" },
  ];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.slug}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setProject(null);
          return;
        }
        const data = await res.json();
        setProject(data.project);
      } catch (err) {
        console.error("Project fetch error:", err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [params.slug]);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) =>
        document.getElementById(s.id),
      );
      const scrollPosition = window.scrollY + 200;
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 120, behavior: "smooth" });
    }
  };

  if (!loading && !project) notFound();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-[hsl(210,60%,20%)]/20 border-t-[hsl(45,85%,55%)]" />
          <p className="mt-4 text-sm sm:text-base text-[hsl(210,60%,20%)] font-semibold">
            Loading investment details...
          </p>
        </div>
      </div>
    );
  }

  const whatsappContact = project.contacts?.find(
    (c: any) => c.contact_type === "whatsapp",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[hsl(210,80%,12%,0.85)] to-[hsl(210,60%,20%,0.75)] text-white overflow-hidden pt-10">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 0h30v30H0z' fill='%23fff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 lg:py-28">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(45,85%,55%)]" />
            <span className="text-[hsl(45,85%,55%)] font-semibold text-xs sm:text-sm uppercase tracking-wider">
              {project.status?.hotness_level >= 70
                ? "High-Demand Investment"
                : "Premium Development"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
            {project.project_name}
          </h1>

          {project.location && (
            <div className="flex items-center gap-2 text-white/80 text-sm sm:text-lg mb-4 sm:mb-6">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{project.location.name}, Dubai</span>
            </div>
          )}

          {project.developer && (
            <div className="mt-5 sm:mt-8 inline-flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              {project.developer.logo_url && (
                <img
                  src={project.developer.logo_url}
                  alt={project.developer.name}
                  className="h-8 sm:h-12 object-contain bg-white rounded-lg p-1.5 sm:p-2"
                />
              )}
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">
                  Developed by
                </p>
                <p className="font-bold text-base sm:text-lg">
                  {project.developer.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Sub-Navbar */}
      <div className="sticky top-0 z-30 bg-white/98 backdrop-blur-lg border-b border-[hsl(210,60%,20%)]/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <nav
            className="flex gap-1.5 sm:gap-2 overflow-x-auto py-2.5 sm:py-3"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all text-xs sm:text-sm ${
                  activeSection === section.id
                    ? "bg-gradient-to-br from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] text-white shadow-[0_4px_15px_-4px_hsl(45,85%,55%,0.25)]"
                    : "text-[hsl(210,60%,20%)] hover:bg-[hsl(210,60%,20%)]/5"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12">
        {/* Investment Overview */}
        <section id="overview">
          <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
            Investment Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <InvestmentMetric
              label="Starting Price"
              value={
                project.status?.starting_price
                  ? `AED ${(project.status.starting_price / 1000000).toFixed(2)}M`
                  : null
              }
              icon={TrendingUp}
              highlight={true}
            />
            <InvestmentMetric
              label="Down Payment"
              value={
                project.status?.down_payment_percentage
                  ? `${project.status.down_payment_percentage}%`
                  : null
              }
              icon={DollarSign}
            />
            <InvestmentMetric
              label="Completion"
              value={
                project.status?.delivery_date
                  ? new Date(project.status.delivery_date).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short" },
                    )
                  : null
              }
              icon={Calendar}
            />
            <InvestmentMetric
              label="Availability"
              value={project.status?.stock_availability
                ?.replace(/_/g, " ")
                .toUpperCase()}
              icon={Package}
            />
          </div>
        </section>

        {/* Project Description */}
        {project.description && (
          <section id="description">
            <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
              Project Description
            </h2>
            <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] p-4 sm:p-8">
              <MarkdownRenderer text={project.description} />
            </div>
          </section>
        )}

        {/* Market Demand */}
        {project.status?.hotness_level != null && (
          <section className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 sm:p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                  <Award className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-orange-900/70 uppercase tracking-wide">
                    Market Demand
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {project.status.hotness_level}/100
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5 sm:gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 sm:w-3 h-8 sm:h-12 rounded-full ${i < Math.floor(project.status.hotness_level / 10) ? "bg-gradient-to-t from-orange-600 to-red-500" : "bg-orange-200/50"}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {project.gallery?.filter((img: any) => img.url && img.url.trim() !== "")
          .length > 0 && (
          <section id="gallery">
            <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
              Property Gallery
            </h2>
            <ImageGallery
              images={project.gallery}
              projectName={project.project_name}
            />
          </section>
        )}

        {/* Available Units */}
        {project.unit_categories?.filter((cat: any) => cat.starting_price > 0)
          .length > 0 && (
          <section id="units">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-1 sm:mb-2">
                Available Units
              </h2>
              <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/60">
                from developer
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] p-4 sm:p-6">
              <UnitsByPropertyType
                units={project.unit_categories.filter(
                  (cat: any) => cat.starting_price > 0,
                )}
              />
            </div>
          </section>
        )}

        {/* Payment Plans */}
        {project.payment_plans?.filter((p: any) => p.phases?.length > 0)
          .length > 0 && (
          <section id="payment">
            <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
              Payment Plans
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {project.payment_plans
                .filter((p: any) => p.phases?.length > 0)
                .map((plan: any, idx: number) => (
                  <PaymentPlan key={idx} plan={plan} />
                ))}
            </div>
          </section>
        )}

        {/* Construction Timeline */}
        {project.construction_timeline?.length > 0 && (
          <section id="timeline">
            <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
              Development Timeline
            </h2>
            <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] p-4 sm:p-8">
              {project.construction_timeline
                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((phase: any, idx: number) => (
                  <TimelineItem
                    key={idx}
                    phase={phase}
                    isLast={idx === project.construction_timeline.length - 1}
                    constructionProgress={project.status?.construction_progress}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Sales History */}
        {project.sales_history?.length > 0 && (
          <section id="sales-history">
            <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
              Sales History
            </h2>
            <SalesHistory history={project.sales_history} />
          </section>
        )}

        {/* Amenities */}
        {project.amenities?.length > 0 && (
          <section id="amenities">
            <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
              Amenities
            </h2>
            <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {project.amenities.map((amenity: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-gradient-to-br hover:from-[hsl(35,25%,88%)] hover:to-[hsl(25,20%,92%)] transition-all"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] flex-shrink-0" />
                    <span className="text-[hsl(210,80%,12%)] text-xs sm:text-sm font-medium">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Master Plan */}
        {project.master_plan &&
          (project.master_plan.description_html ||
            (project.master_plan.image_url &&
              project.master_plan.image_url.trim() !== "")) && (
            <section id="master-plan">
              <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
                Master Plan
              </h2>
              <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] overflow-hidden">
                {project.master_plan.image_url &&
                  project.master_plan.image_url.trim() !== "" && (
                    <div className="relative w-full bg-gradient-to-br from-[hsl(35,25%,88%)] to-[hsl(25,20%,92%)] p-4 sm:p-8">
                      <div className="rounded-xl overflow-hidden border-2 border-[hsl(210,60%,20%)]/10 shadow-lg bg-white">
                        <img
                          src={project.master_plan.image_url}
                          alt="Master Plan"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                {project.master_plan.description_html &&
                  project.master_plan.description_html.trim() !== "" && (
                    <div className="p-4 sm:p-8">
                      <div className="flex items-start gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-2.5 bg-gradient-to-br from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] rounded-lg flex-shrink-0">
                          <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-xl font-bold text-[hsl(210,80%,12%)] mb-0.5">
                            Development Overview
                          </h3>
                          <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/60">
                            Comprehensive project layout and design
                          </p>
                        </div>
                      </div>
                      <div
                        className="prose prose-sm sm:prose-lg max-w-none text-[hsl(210,60%,20%)] leading-relaxed [&>p]:mb-4"
                        dangerouslySetInnerHTML={{
                          __html: project.master_plan.description_html,
                        }}
                      />
                    </div>
                  )}
              </div>
            </section>
          )}

        {/* Similar Projects */}
        {project.similar_projects && project.similar_projects.length > 0 && (
          <SimilarProjects projects={project.similar_projects} />
        )}

        {/* FAQs */}
        {project.faqs && project.faqs.length > 0 && (
          <section id="faqs">
            <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {project.faqs.map((faq: any, idx: number) => (
                <FAQItem key={idx} faq={faq} />
              ))}
            </div>
          </section>
        )}

        {/* Location */}
        {(project.latitude || project.location) && (
          <section id="location">
            <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
              Location
            </h2>
            <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {project.location && (
                  <div>
                    <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/60 mb-1.5">
                      Area
                    </p>
                    <p className="text-base sm:text-xl font-bold text-[hsl(210,80%,12%)]">
                      {project.location.name}
                    </p>
                    {project.location.level && (
                      <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/60 mt-0.5 capitalize">
                        {project.location.level}
                      </p>
                    )}
                  </div>
                )}
                {project.latitude && project.longitude && (
                  <div>
                    <p className="text-xs sm:text-sm text-[hsl(210,60%,20%)]/60 mb-1.5">
                      Coordinates
                    </p>
                    <p className="text-xs sm:text-sm font-mono text-[hsl(210,80%,12%)]">
                      {project.latitude}, {project.longitude}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* AI Assistant */}
        <section id="ai-assistant">
          <h2 className="text-xl sm:text-3xl font-bold text-[hsl(210,80%,12%)] mb-4 sm:mb-6">
            AI Property Assistant
          </h2>
          <AIAssistant
            projectName={project.project_name}
            projectData={project}
          />
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-br from-[hsl(210,80%,12%)] to-[hsl(210,60%,20%)] rounded-xl shadow-[0_10px_40px_-10px_hsl(210,80%,12%,0.15)] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 0h30v30H0z' fill='%23fff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="relative p-6 sm:p-10 text-center">
            <h3 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
              Ready to Invest?
            </h3>
            <p className="text-white/80 text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
              Get in touch with our team to schedule a viewing or learn more
              about this investment opportunity
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {whatsappContact && (
                <a
                  href={whatsappContact.contact_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-br from-[hsl(45,85%,55%)] to-[hsl(40,80%,60%)] text-white text-sm sm:text-base font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Contact via WhatsApp
                </a>
              )}
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white text-sm sm:text-base font-bold rounded-lg border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  View Full Listing
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
