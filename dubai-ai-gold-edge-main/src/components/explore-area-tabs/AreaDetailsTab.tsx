"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import CommunitySubNav from "@/components/CommunitySubNavbar";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  TrendingUp,
  Navigation,
  AlertCircle,
  Building2,
  Compass,
  Star,
  ArrowRight,
  Layers,
} from "lucide-react";
import formatPrice from "@/helpers/FormatPrice";
import Link from "next/link";
import { useChat } from "@/context/ChatContext";
import ChatMainHome from "@/components/AI-chat-window/ChatMainHome";
import TextHighlightMenu from "@/components/TextHighlightMenu";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type CommunityImage = {
  id: number;
  url: string;
  mediaType: string;
  source: string;
  isPrimary: boolean;
};
type Narrative = {
  content: string;
  confidenceScore: number | null;
  timeHorizon: string | null;
  generatedBy: string;
  generatedAt: string;
};
type Accessibility = {
  coordinates: { latitude: number; longitude: number };
  nearestMetro: { name: string | null; distanceKm: number | null };
  keyDistances: {
    downtownKm: number;
    businessBayKm: number;
    airportKm: number;
  };
  majorRoads: string[];
  areaDistances: { [key: string]: number };
};
type Project = {
  projectId: number;
  projectName: string;
  developer: { id: number; name: string } | null;
  startingPrice: number | null;
  downPaymentPercentage: number | null;
  constructionPhase: string | null;
  salesPhase: string | null;
  deliveryDate: string | null;
  stockAvailability: string | null;
  hotnessLevel: number | null;
};
type Community = {
  location_id: number;
  name: string;
  slug: string;
  level: string;
  images: CommunityImage[];
  amenities: { id: number; name: string }[];
  roads: { id: number; name: string }[];
  classifications: {
    id: number;
    title: string;
    type: string;
    description: string;
  }[];
  description: string | null;
  lifestyle_summary: string | null;
  population_estimate: number | null;
  narratives: {
    overview?: Narrative;
    investor_verdict?: Narrative;
    risks?: Narrative;
  };
  accessibility: Accessibility;
  topProjects?: Project[];
};

// ── Must match AreaPageDetails + CommunitySubNav constants ───────────────────
const NAVBAR_HEIGHT = 80;
const SUBNAV_HEIGHT = 44;
const TAB_BAR_HEIGHT = 48;
// Full three-bar offset used for section scroll targets
const SCROLL_OFFSET = NAVBAR_HEIGHT + SUBNAV_HEIGHT + TAB_BAR_HEIGHT + 8; // 180

const NAV_SECTION_IDS = [
  "overview",
  "investor-verdict",
  "risks",
  "gallery",
  "classifications",
  "amenities",
  "accessibility",
  "location",
  "projects",
  "market-insights",
];

// ─── Section divider ──────────────────────────────────────────────────────────
// scroll-mt must equal SCROLL_OFFSET so browser-native anchor jumps also clear
// the header stack. 180 px = 80 (navbar) + 44 (subnav) + 48 (tab bar) + 8 (gap)
const SectionDivider = ({ label, id }: { label: string; id?: string }) => (
  <div
    id={id}
    className="scroll-mt-[180px] flex items-center gap-4 px-6 sm:px-10 py-5 border-t border-black/[0.05]"
  >
    <span
      className="text-[10px] font-black tracking-[0.3em] uppercase"
      style={{ color: "#c9a84c" }}
    >
      {label}
    </span>
    <div
      className="flex-1 h-px"
      style={{
        background:
          "linear-gradient(to right, rgba(201,168,76,0.25), transparent)",
      }}
    />
  </div>
);

// ─── Ask AI button ─────────────────────────────────────────────────────────────
const AskAIButton = ({
  onClick,
  icon: Icon,
}: {
  onClick: () => void;
  icon: any;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] flex-shrink-0"
    style={{
      background: "linear-gradient(135deg, #c9a84c, #e8c96a)",
      color: "#0a0f1e",
      boxShadow: "0 4px 14px rgba(201,168,76,0.25)",
    }}
  >
    <Icon className="w-3.5 h-3.5" />
    <span className="hidden sm:inline">Ask AI</span>
  </button>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props {
  slug: string;
  /**
   * Controlled by AreaPageDetails.
   * True when the pill toggle has scrolled behind the navbar — at that point
   * the sticky tab bar is visible and the subnav should be shown.
   */
  showSubnav: boolean;
}

export default function AreaDetailsTab({ slug, showSubnav }: Props) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const { setAreaContext, setContextPrompt, openChat } = useChat();

  // ── Active-section tracker for CommunitySubNav ──────────────────────────
  // Only register the listener once; it reads SCROLL_OFFSET from closure.
  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      for (const id of NAV_SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Section is "active" if its top has passed the scroll offset threshold
          // and its bottom hasn't scrolled above it yet.
          if (rect.top <= SCROLL_OFFSET + 16 && rect.bottom >= SCROLL_OFFSET) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [communityRes, projectsRes] = await Promise.all([
          fetch(`/api/communitiyDetails/${slug}`, { cache: "no-store" }),
          fetch(`/api/community/${slug}/top-projects`, { cache: "no-store" }),
        ]);
        if (!communityRes.ok) throw new Error("Failed to fetch community");
        const communityData = await communityRes.json();
        let projects: Project[] = [];
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          projects = projectsData.projects || [];
        }
        setCommunity({ ...communityData, topProjects: projects });
        setAreaContext({
          areaName: communityData.name,
          areaType: communityData.level,
          snapshotDate: new Date().toISOString().split("T")[0],
          metadata: {
            locationId: communityData.location_id,
            slug: communityData.slug,
            population: communityData.population_estimate,
            coordinates: communityData.accessibility?.coordinates,
          },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, setAreaContext]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#c9a84c] border-t-transparent animate-spin" />
          <p className="text-xs tracking-[0.2em] uppercase text-[#c9a84c]">
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#c9a84c]/40 mx-auto mb-3" />
          <h2 className="text-lg font-serif font-bold text-[#0a0f1e] mb-1">
            Community Not Found
          </h2>
          <p className="text-sm text-[#6b7280]">
            The community you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const heroImage =
    community.images.find((img) => img.isPrimary) || community.images[0];
  const galleryImages = community.images.filter(
    (img) => img.mediaType === "gallery",
  );

  const nextImage = () =>
    setCurrentImageIndex((p) => (p === galleryImages.length - 1 ? 0 : p + 1));
  const previousImage = () =>
    setCurrentImageIndex((p) => (p === 0 ? galleryImages.length - 1 : p - 1));

  const makeAreaContext = () => ({
    areaName: community.name,
    areaType: community.level,
    snapshotDate: new Date().toISOString().split("T")[0],
    metadata: {
      locationId: community.location_id,
      slug: community.slug,
      population: community.population_estimate,
      coordinates: community.accessibility?.coordinates,
    },
  });

  return (
    <>
      {/*
        CommunitySubNav is fully controlled:
        ─ isVisible  = showSubnav  (true once pill has scrolled behind navbar)
        ─ activeSection is tracked locally since this component owns the sections
      */}
      <CommunitySubNav
        isVisible={showSubnav}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <TextHighlightMenu />
      <ChatMainHome
        communityName={community.name}
        communitySlug={community.slug}
      />

      {/*
        pt-14 gives the hero breathing room.
        When the subnav is visible (showSubnav=true) the sticky tab bar shifts
        down by SUBNAV_HEIGHT automatically via the `top` transition in
        AreaPageDetails — no extra padding needed here.
      */}
      <div className="bg-white pt-14">
        {/* ── Hero image ──────────────────────────────────────────────── */}
        {heroImage && (
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65 }}
            className="relative w-full overflow-hidden"
            style={{ height: "clamp(260px, 42vw, 540px)" }}
          >
            <img
              src={heroImage.url}
              alt={community.name}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,15,30,0.72) 0%, rgba(10,15,30,0.08) 55%, transparent 100%)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-9">
              <h1
                className="font-serif font-bold text-white mb-1.5"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {community.name}
              </h1>
              {community.lifestyle_summary && (
                <p className="text-white/55 text-sm sm:text-base max-w-2xl leading-relaxed">
                  {community.lifestyle_summary}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Quick stats strip ────────────────────────────────────────── */}
        {(community.population_estimate ||
          community.level ||
          community.accessibility?.nearestMetro?.name) && (
          <div
            className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06]"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            {community.population_estimate && (
              <div className="flex items-center gap-4 px-6 sm:px-10 py-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#0a0f1e" }}
                >
                  <Users className="w-4.5 h-4.5" style={{ color: "#c9a84c" }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9ca3af] mb-0.5">
                    Population Estimate
                  </p>
                  <p className="font-bold text-[#0a0f1e] text-lg">
                    {community.population_estimate.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {community.level && (
              <div className="flex items-center gap-4 px-6 sm:px-10 py-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#0a0f1e" }}
                >
                  <Layers
                    className="w-4.5 h-4.5"
                    style={{ color: "#c9a84c" }}
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9ca3af] mb-0.5">
                    Classification
                  </p>
                  <p className="font-bold text-[#0a0f1e] text-lg capitalize">
                    {community.level}
                  </p>
                </div>
              </div>
            )}
            {community.accessibility?.nearestMetro?.name &&
              community.accessibility?.nearestMetro?.distanceKm && (
                <div className="flex items-center gap-4 px-6 sm:px-10 py-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#0a0f1e" }}
                  >
                    <Navigation
                      className="w-4.5 h-4.5"
                      style={{ color: "#c9a84c" }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9ca3af] mb-0.5">
                      Nearest Metro
                    </p>
                    <p className="font-bold text-[#0a0f1e] text-lg">
                      {community.accessibility.nearestMetro.name}
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      {community.accessibility.nearestMetro.distanceKm} km away
                    </p>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* ── Overview ────────────────────────────────────────────────── */}
        {community.narratives?.overview && (
          <>
            <SectionDivider label="Overview" id="overview" />
            <div className="px-6 sm:px-10 pb-10">
              {community.narratives.overview.confidenceScore && (
                <div className="flex items-center gap-1.5 mb-4">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-[#6b7280]">
                    {(
                      community.narratives.overview.confidenceScore * 100
                    ).toFixed(0)}
                    % confidence
                  </span>
                </div>
              )}
              <p className="text-base text-[#374151] leading-[1.9] whitespace-pre-line max-w-4xl">
                {community.narratives.overview.content}
              </p>
            </div>
          </>
        )}

        {/* ── Investor verdict ─────────────────────────────────────────── */}
        {community.narratives?.investor_verdict && (
          <>
            <SectionDivider label="Investor Verdict" id="investor-verdict" />
            <div className="px-6 sm:px-10 pb-10">
              <div className="flex items-center justify-between mb-5 gap-4">
                <span
                  className="text-[10px] font-black tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm"
                  style={{
                    background: "rgba(5,150,105,0.08)",
                    color: "#059669",
                  }}
                >
                  Investment Grade
                </span>
                <AskAIButton
                  icon={TrendingUp}
                  onClick={() => {
                    setAreaContext(makeAreaContext());
                    setContextPrompt({
                      topic: "Investor Verdict",
                      question: community.narratives.investor_verdict!.content,
                    });
                    openChat();
                  }}
                />
              </div>
              <p className="text-base text-[#374151] leading-[1.9] whitespace-pre-line max-w-4xl">
                {community.narratives.investor_verdict.content}
              </p>
            </div>
          </>
        )}

        {/* ── Risks ────────────────────────────────────────────────────── */}
        {community.narratives?.risks && (
          <>
            <SectionDivider label="Risk Assessment" id="risks" />
            <div className="px-6 sm:px-10 pb-10">
              <div className="flex items-center justify-between mb-5 gap-4">
                <span
                  className="text-[10px] font-black tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm"
                  style={{
                    background: "rgba(217,119,6,0.08)",
                    color: "#d97706",
                  }}
                >
                  Due Diligence
                </span>
                <AskAIButton
                  icon={AlertCircle}
                  onClick={() => {
                    setAreaContext(makeAreaContext());
                    setContextPrompt({
                      topic: "Risks",
                      question: community.narratives.risks!.content,
                    });
                    openChat();
                  }}
                />
              </div>
              <p className="text-base text-[#374151] leading-[1.9] whitespace-pre-line max-w-4xl">
                {community.narratives.risks.content}
              </p>
            </div>
          </>
        )}

        {/* ── Gallery ──────────────────────────────────────────────────── */}
        {galleryImages.length > 0 && (
          <>
            {/*
              id must be here (on the wrapper), not just on SectionDivider,
              so the scroll target covers the whole section including the images.
            */}
            <div id="gallery" className="scroll-mt-[180px]">
              <SectionDivider label="Gallery" />
              <div className="pb-10">
                <div
                  className="relative w-full overflow-hidden"
                  style={{ height: "clamp(200px, 38vw, 500px)" }}
                >
                  <img
                    src={galleryImages[currentImageIndex].url}
                    alt={`${community.name} — ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={previousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          background: "rgba(10,15,30,0.65)",
                          color: "white",
                        }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          background: "rgba(10,15,30,0.65)",
                          color: "white",
                        }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div
                        className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: "rgba(10,15,30,0.7)",
                          color: "white",
                        }}
                      >
                        {currentImageIndex + 1} / {galleryImages.length}
                      </div>
                    </>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div
                    className="flex gap-2 overflow-x-auto px-6 sm:px-10 pt-3 pb-1"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {galleryImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className="flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200"
                        style={{
                          width: 72,
                          height: 52,
                          outline:
                            currentImageIndex === index
                              ? "2.5px solid #c9a84c"
                              : "2.5px solid transparent",
                          opacity: currentImageIndex === index ? 1 : 0.5,
                        }}
                      >
                        <img
                          src={image.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Description ──────────────────────────────────────────────── */}
        {community.description && (
          <>
            <SectionDivider label="Description" id="description" />
            <div className="px-6 sm:px-10 pb-10">
              <p className="text-base text-[#374151] leading-[1.9] whitespace-pre-line max-w-4xl">
                {community.description}
              </p>
            </div>
          </>
        )}

        {/* ── Accessibility ─────────────────────────────────────────────── */}
        {community.accessibility && (
          <>
            <SectionDivider label="Accessibility" id="accessibility" />
            <div className="px-6 sm:px-10 pb-10 space-y-6">
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-px"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <div className="bg-white px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Compass
                      className="w-3.5 h-3.5"
                      style={{ color: "#c9a84c" }}
                    />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#0a0f1e]">
                      Coordinates
                    </span>
                  </div>
                  <p className="text-sm text-[#374151]">
                    <span className="font-semibold">Lat:</span>{" "}
                    {community.accessibility.coordinates.latitude}
                  </p>
                  <p className="text-sm text-[#374151]">
                    <span className="font-semibold">Lng:</span>{" "}
                    {community.accessibility.coordinates.longitude}
                  </p>
                </div>
                {community.accessibility.nearestMetro?.name &&
                  community.accessibility.nearestMetro?.distanceKm && (
                    <div className="bg-white px-6 py-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Navigation
                          className="w-3.5 h-3.5"
                          style={{ color: "#c9a84c" }}
                        />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#0a0f1e]">
                          Metro Access
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#0a0f1e]">
                        {community.accessibility.nearestMetro.name}
                      </p>
                      <p className="text-sm text-[#6b7280]">
                        {community.accessibility.nearestMetro.distanceKm} km
                        from area
                      </p>
                    </div>
                  )}
              </div>

              {community.accessibility.keyDistances && (
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
                    Key Distances
                  </p>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-px"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    {[
                      {
                        label: "Downtown Dubai",
                        value: community.accessibility.keyDistances.downtownKm,
                      },
                      {
                        label: "Business Bay",
                        value:
                          community.accessibility.keyDistances.businessBayKm,
                      },
                      {
                        label: "Airport",
                        value: community.accessibility.keyDistances.airportKm,
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-white flex items-center justify-between px-6 py-4"
                      >
                        <span className="text-sm text-[#6b7280]">{label}</span>
                        <span className="font-bold text-[#0a0f1e] text-sm">
                          {value} km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {community.accessibility.majorRoads?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
                    Major Roads
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {community.accessibility.majorRoads.map((road, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: "#0a0f1e", color: "#c9a84c" }}
                      >
                        {road}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {community.accessibility.areaDistances &&
                Object.keys(community.accessibility.areaDistances).length >
                  0 && (
                  <div>
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
                      Distances to Key Areas
                    </p>
                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px"
                      style={{
                        background: "rgba(0,0,0,0.05)",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      {Object.entries(community.accessibility.areaDistances)
                        .sort(([, a], [, b]) => a - b)
                        .map(([area, distance]) => (
                          <div
                            key={area}
                            className="bg-white flex items-center justify-between px-4 py-3 hover:bg-[#faf9f7] transition-colors"
                          >
                            <span className="text-xs text-[#6b7280] capitalize truncate mr-2">
                              {area
                                .replace(/distance_to_|_km/g, "")
                                .replace(/_/g, " ")}
                            </span>
                            <span className="font-bold text-xs text-[#0a0f1e] flex-shrink-0">
                              {distance}km
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </>
        )}

        {/* ── Classifications ──────────────────────────────────────────── */}
        {community.classifications?.length > 0 && (
          <>
            <SectionDivider
              label="Special Classifications"
              id="classifications"
            />
            <div className="px-6 sm:px-10 pb-10">
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {community.classifications.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white px-6 py-5 hover:bg-[#faf9f7] transition-colors"
                  >
                    <h3 className="font-serif font-bold text-[#0a0f1e] mb-2">
                      {c.title}
                    </h3>
                    {c.type && (
                      <span
                        className="inline-block px-2 py-0.5 rounded-sm text-[9px] font-black tracking-[0.15em] uppercase mb-2"
                        style={{
                          background: "rgba(201,168,76,0.1)",
                          color: "#c9a84c",
                        }}
                      >
                        {c.type}
                      </span>
                    )}
                    {c.description && (
                      <p className="text-xs text-[#6b7280] leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Amenities ────────────────────────────────────────────────── */}
        {community.amenities?.length > 0 && (
          <>
            <SectionDivider label="Amenities" id="amenities" />
            <div className="px-6 sm:px-10 pb-10">
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {community.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="group bg-white flex items-center gap-2.5 px-5 py-4 cursor-default hover:bg-[#0a0f1e] transition-colors duration-150"
                  >
                    <Star className="w-3 h-3 flex-shrink-0 text-[#c9a84c]" />
                    <p className="text-sm font-medium text-[#0a0f1e] group-hover:text-white transition-colors truncate">
                      {amenity.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Roads ────────────────────────────────────────────────────── */}
        {community.roads?.length > 0 && (
          <>
            <SectionDivider label="Road Locations" id="roads" />
            <div className="px-6 sm:px-10 pb-10">
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {community.roads.map((road) => (
                  <div
                    key={road.id}
                    className="bg-white flex items-center gap-3 px-6 py-4"
                  >
                    <div
                      className="w-1 h-4 rounded-full flex-shrink-0"
                      style={{ background: "#c9a84c" }}
                    />
                    <p className="text-sm font-medium text-[#0a0f1e]">
                      {road.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Location map ─────────────────────────────────────────────── */}
        <SectionDivider label="Location" id="location" />
        <div
          className="w-full flex items-center justify-center"
          style={{ height: 360, background: "#0a0f1e" }}
        >
          <div className="text-center">
            <MapPin
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "#c9a84c" }}
            />
            <p className="text-white/30 text-sm mb-1">Interactive map</p>
            {community.accessibility?.coordinates && (
              <p className="text-[#c9a84c]/50 text-xs font-mono">
                {community.accessibility.coordinates.latitude},{" "}
                {community.accessibility.coordinates.longitude}
              </p>
            )}
          </div>
        </div>

        {/* ── Projects table ───────────────────────────────────────────── */}
        <SectionDivider label="Related Projects" id="projects" />
        {!community?.topProjects || community.topProjects.length === 0 ? (
          <div className="px-6 sm:px-10 pb-10 flex flex-col items-center justify-center py-16 gap-3">
            <Building2 className="w-10 h-10 text-[#0a0f1e]/15" />
            <p className="text-[#6b7280] text-sm">
              No projects available for this community.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr style={{ background: "#0a0f1e" }}>
                  {[
                    "Project",
                    "Developer",
                    "Starting Price",
                    "Down Payment",
                    "Phase",
                    "Delivery",
                    "Stock",
                    "🔥",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-[10px] font-black tracking-[0.15em] uppercase whitespace-nowrap"
                      style={{ color: "#c9a84c" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {community.topProjects.map((project) => (
                  <tr
                    key={project.projectId}
                    className="hover:bg-[#faf9f7] transition-colors"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <td className="px-6 py-4 font-semibold text-[#0a0f1e] whitespace-nowrap text-sm">
                      {project.projectName ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                      {project.developer?.name ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0a0f1e] whitespace-nowrap text-sm">
                      AED {formatPrice(project.startingPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                      {project.downPaymentPercentage
                        ? `${project.downPaymentPercentage}%`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-sm whitespace-nowrap w-fit"
                          style={{ background: "#f0fdf4", color: "#16a34a" }}
                        >
                          {project.constructionPhase ?? "N/A"}
                        </span>
                        <span
                          className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-sm whitespace-nowrap w-fit"
                          style={{ background: "#f8f9fa", color: "#6b7280" }}
                        >
                          Sales: {project.salesPhase ?? "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b7280] whitespace-nowrap">
                      {project.deliveryDate
                        ? new Date(project.deliveryDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b7280] capitalize whitespace-nowrap">
                      {project.stockAvailability ?? "N/A"}
                    </td>
                    <td
                      className="px-6 py-4 font-bold text-sm"
                      style={{ color: "#c9a84c" }}
                    >
                      {project.hotnessLevel ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href={`/locations/${community.slug}/projects`}>
              <button
                className="w-full flex items-center justify-center gap-2 py-5 text-sm font-bold tracking-wide transition-all hover:gap-3"
                style={{ background: "#0a0f1e", color: "#c9a84c" }}
              >
                Explore All Projects in {community.name}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}

        {/* ── Market Insights ──────────────────────────────────────────── */}
        <SectionDivider label="Market Insights" id="market-insights" />
        <div className="px-6 sm:px-10 pb-16 flex flex-col items-center justify-center py-16 gap-3">
          <TrendingUp
            className="w-10 h-10"
            style={{ color: "rgba(201,168,76,0.3)" }}
          />
          <p className="text-sm text-[#6b7280]">
            Market data and insights will be available here
          </p>
        </div>
      </div>
    </>
  );
}
