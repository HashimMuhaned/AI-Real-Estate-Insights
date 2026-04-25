"use client";

import React, { useState } from "react";
import CommunitySubNav from "@/components/CommunitySubNavbar";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  TrendingUp,
  Navigation,
  AlertCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import formatPrice from "@/helpers/FormatPrice";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import ChatMainHome from "@/components/AI-chat-window/ChatMainHome";
import TextHighlightMenu from "@/components/TextHighlightMenu";

type PageProps = { params: Promise<{ slug: string }> };
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

const AskAIButton = ({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: any;
  label: string;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 hover:shadow-md flex-shrink-0"
    style={{
      background: "linear-gradient(135deg, hsl(45 85% 55%), hsl(40 80% 60%))",
    }}
  >
    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    <span className="hidden xs:inline">Ask AI</span>
    <span className="xs:hidden">AI</span>
  </button>
);

export default function AreaDetailsTab({ slug }: { slug: string }) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { setAreaContext, setContextPrompt, openChat } = useChat();

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
      } catch (error) {
        console.error("Error loading community page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, setAreaContext]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading community details...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Community not found</h2>
          <p className="text-muted-foreground">
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
    setCurrentImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1,
    );
  const previousImage = () =>
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1,
    );

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
      <CommunitySubNav />
      <TextHighlightMenu />
      <ChatMainHome
        communityName={community.name}
        communitySlug={community.slug}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 space-y-10 sm:space-y-14 pt-20 sm:pt-24 pb-10">
        {/* Hero Image */}
        {heroImage && (
          <div className="relative w-full h-[220px] sm:h-[350px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl">
            <img
              src={heroImage.url}
              alt={community.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 pr-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                {community.name}
              </h1>
              {community.lifestyle_summary && (
                <p className="text-sm sm:text-lg text-white/90 max-w-2xl line-clamp-2 sm:line-clamp-none">
                  {community.lifestyle_summary}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {community.population_estimate && (
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
              <div className="bg-primary/10 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Population Estimate
                </p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {community.population_estimate.toLocaleString()}
                </p>
              </div>
            </div>
          )}
          {community.level && (
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
              <div className="bg-primary/10 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Level
                </p>
                <p className="text-xl sm:text-2xl font-semibold capitalize">
                  {community.level}
                </p>
              </div>
            </div>
          )}
          {community.accessibility?.nearestMetro?.name &&
            community.accessibility?.nearestMetro?.distanceKm && (
              <div className="bg-muted/30 rounded-lg p-4 sm:p-6 flex items-center gap-3 sm:gap-4 sm:col-span-2 md:col-span-1">
                <div className="bg-primary/10 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                  <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Nearest Metro
                  </p>
                  <p className="text-lg sm:text-2xl font-semibold">
                    {community.accessibility.nearestMetro.name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {community.accessibility.nearestMetro.distanceKm} km away
                  </p>
                </div>
              </div>
            )}
        </section>

        {/* Overview Narrative */}
        {community.narratives?.overview && (
          <section id="overview" className="scroll-mt-24 sm:scroll-mt-32">
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-2xl sm:text-3xl font-semibold">Overview</h2>
              {community.narratives.overview.confidenceScore && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">
                    {(
                      community.narratives.overview.confidenceScore * 100
                    ).toFixed(0)}
                    % confidence
                  </span>
                </div>
              )}
            </div>
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
              <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {community.narratives.overview.content}
              </p>
            </div>
          </section>
        )}

        {/* Investor Verdict */}
        {community.narratives?.investor_verdict && (
          <section
            id="investor-verdict"
            className="scroll-mt-24 sm:scroll-mt-32"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-2xl sm:text-3xl font-semibold leading-tight">
                Investor Verdict
              </h2>
              <AskAIButton
                icon={TrendingUp}
                label="Ask AI about this"
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
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 sm:p-6">
              <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {community.narratives.investor_verdict.content}
              </p>
            </div>
          </section>
        )}

        {/* Risks */}
        {community.narratives?.risks && (
          <section id="risks" className="scroll-mt-24 sm:scroll-mt-32">
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-2xl sm:text-3xl font-semibold">Risks</h2>
              <AskAIButton
                icon={AlertCircle}
                label="Ask AI about this"
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
            <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-lg p-4 sm:p-6">
              <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {community.narratives.risks.content}
              </p>
            </div>
          </section>
        )}

        {/* Image Gallery */}
        {galleryImages.length > 0 && (
          <section id="gallery" className="scroll-mt-24 sm:scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
              Gallery
            </h2>
            <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] rounded-xl overflow-hidden shadow-xl mb-3 sm:mb-4">
              <img
                src={galleryImages[currentImageIndex].url}
                alt={`${community.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2.5 py-1 rounded-full text-xs sm:text-sm">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${currentImageIndex === index ? "ring-2 sm:ring-4 ring-accent scale-95" : "hover:scale-95 opacity-70 hover:opacity-100"}`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Description */}
        {community.description && (
          <section id="description" className="scroll-mt-24 sm:scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
              Description
            </h2>
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {community.description}
              </p>
            </div>
          </section>
        )}

        {/* Accessibility */}
        {community.accessibility && (
          <section id="accessibility" className="scroll-mt-24 sm:scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
              Accessibility
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> Coordinates
                  </h3>
                  <div className="space-y-1.5 text-sm sm:text-base">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Latitude:</span>{" "}
                      {community.accessibility.coordinates.latitude}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Longitude:</span>{" "}
                      {community.accessibility.coordinates.longitude}
                    </p>
                  </div>
                </div>
                {community.accessibility.nearestMetro?.name &&
                  community.accessibility.nearestMetro?.distanceKm && (
                    <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                        <Navigation className="w-4 h-4 sm:w-5 sm:h-5" /> Metro
                        Access
                      </h3>
                      <div className="space-y-1.5 text-sm sm:text-base">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Nearest Station:</span>{" "}
                          {community.accessibility.nearestMetro.name}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Distance:</span>{" "}
                          {community.accessibility.nearestMetro.distanceKm} km
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {community.accessibility.keyDistances && (
                <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">
                    Key Distances
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
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
                        className="flex items-center justify-between p-2.5 sm:p-3 bg-background rounded-lg"
                      >
                        <span className="text-sm text-muted-foreground">
                          {label}
                        </span>
                        <span className="font-semibold text-sm">
                          {value} km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {community.accessibility.majorRoads?.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">
                    Major Roads
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {community.accessibility.majorRoads.map((road, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium"
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
                  <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">
                      Distances to Key Areas
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                      {Object.entries(community.accessibility.areaDistances)
                        .sort(([, a], [, b]) => a - b)
                        .map(([area, distance]) => (
                          <div
                            key={area}
                            className="flex items-center justify-between p-2 sm:p-3 bg-background rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-xs sm:text-sm capitalize text-muted-foreground truncate mr-1">
                              {area
                                .replace(/distance_to_|_km/g, "")
                                .replace(/_/g, " ")}
                            </span>
                            <span className="font-semibold text-xs sm:text-sm flex-shrink-0">
                              {distance} km
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </section>
        )}

        {/* Classifications */}
        {community.classifications?.length > 0 && (
          <section
            id="classifications"
            className="scroll-mt-24 sm:scroll-mt-32"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
              Special Classifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {community.classifications.map((c) => (
                <div
                  key={c.id}
                  className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-base sm:text-lg mb-1.5">
                    {c.title}
                  </h3>
                  {c.type && (
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mb-2">
                      {c.type}
                    </span>
                  )}
                  {c.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1.5">
                      {c.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Amenities */}
        {community.amenities?.length > 0 && (
          <section id="amenities" className="scroll-mt-24 sm:scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
              Amenities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {community.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="bg-muted/30 rounded-lg p-3 sm:p-4 text-center hover:bg-muted/50 transition-colors"
                >
                  <p className="text-sm sm:text-base font-medium">
                    {amenity.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Roads */}
        {community.roads?.length > 0 && (
          <section id="roads" className="scroll-mt-24 sm:scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
              Road Locations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {community.roads.map((road) => (
                <div
                  key={road.id}
                  className="bg-muted/30 rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                >
                  <p className="text-sm sm:text-base font-medium">
                    {road.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Location Map */}
        <section id="location" className="scroll-mt-24 sm:scroll-mt-32">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
            Location Map
          </h2>
          <div className="bg-muted/30 rounded-lg p-6 h-64 sm:h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground mb-2">
                Interactive map will be displayed here
              </p>
              {community.accessibility?.coordinates && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {community.accessibility.coordinates.latitude},{" "}
                  {community.accessibility.coordinates.longitude}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Projects Table */}
        <section id="projects" className="scroll-mt-24 sm:scroll-mt-32">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
            Related Projects
          </h2>
          {!community?.topProjects || community.topProjects.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
              <p className="text-muted-foreground">
                No projects available for this community.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border bg-background overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        Project
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Developer
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Starting Price
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Down Payment
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Phase</TableHead>
                      <TableHead className="whitespace-nowrap">
                        Delivery
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Stock</TableHead>
                      <TableHead className="whitespace-nowrap">
                        🔥 Hotness
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {community.topProjects.map((project) => (
                      <TableRow
                        key={project.projectId}
                        className="hover:bg-muted/40 transition"
                      >
                        <TableCell className="font-medium whitespace-nowrap">
                          {project.projectName ?? "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {project.developer?.name ?? "N/A"}
                        </TableCell>
                        <TableCell className="font-semibold whitespace-nowrap">
                          AED {formatPrice(project.startingPrice)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {project.downPaymentPercentage
                            ? `${project.downPaymentPercentage}%`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="secondary"
                              className="w-fit text-xs whitespace-nowrap"
                            >
                              {project.constructionPhase ?? "N/A"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="w-fit text-xs whitespace-nowrap"
                            >
                              Sales: {project.salesPhase ?? "N/A"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {project.deliveryDate
                            ? new Date(
                                project.deliveryDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize whitespace-nowrap"
                          >
                            {project.stockAvailability ?? "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{project.hotnessLevel ?? "N/A"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <Link href={`/locations/${community.slug}/projects`}>
                          <Button
                            variant="secondary"
                            className="w-full h-12 sm:h-14 rounded-none text-sm sm:text-base font-semibold"
                          >
                            Explore All Projects in {community.name}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </section>

        {/* Market Insights */}
        <section id="market-insights" className="scroll-mt-24 sm:scroll-mt-32">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
            Market Insights
          </h2>
          <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
            <p className="text-sm sm:text-base text-muted-foreground">
              Market data and insights will be available here
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
