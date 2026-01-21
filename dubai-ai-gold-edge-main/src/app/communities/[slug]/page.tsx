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

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
  coordinates: {
    latitude: number;
    longitude: number;
  };
  nearestMetro: {
    name: string | null;
    distanceKm: number | null;
  };
  keyDistances: {
    downtownKm: number;
    businessBayKm: number;
    airportKm: number;
  };
  majorRoads: string[];
  areaDistances: {
    [key: string]: number;
  };
};

type Project = {
  projectId: number;
  projectName: string;
  developer: {
    id: number;
    name: string;
  } | null;
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

export default function CommunityPageDetails({ params }: PageProps) {
  const { slug } = React.use(params);
  const [community, setCommunity] = useState<Community | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [communityRes, projectsRes] = await Promise.all([
          fetch(`/api/communitiyDetails/${slug}`, {
            cache: "no-store",
          }),
          fetch(`/api/community/${slug}/top-projects`, {
            cache: "no-store",
          }),
        ]);

        if (!communityRes.ok) {
          throw new Error("Failed to fetch community");
        }

        const communityData = await communityRes.json();

        let projects: Project[] = [];

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          projects = projectsData.projects || [];
        }

        setCommunity({
          ...communityData,
          topProjects: projects,
        });
      } catch (error) {
        console.error("Error loading community page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
    (img) => img.mediaType === "gallery"
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  return (
    <>
      <CommunitySubNav />

      <div className="max-w-7xl mx-auto p-6 space-y-16 pt-24">
        {/* Hero Image */}
        {heroImage && (
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-2xl">
            <img
              src={heroImage.url}
              alt={community.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <h1 className="text-5xl font-bold text-white mb-2">
                {community.name}
              </h1>
              {community.lifestyle_summary && (
                <p className="text-xl text-white/90 max-w-2xl">
                  {community.lifestyle_summary}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {community.population_estimate && (
            <div className="bg-muted/30 rounded-lg p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Population Estimate
                </p>
                <p className="text-2xl font-semibold">
                  {community.population_estimate.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {community.level && (
            <div className="bg-muted/30 rounded-lg p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-semibold capitalize">
                  {community.level}
                </p>
              </div>
            </div>
          )}

          {community.accessibility?.nearestMetro?.name &&
            community.accessibility?.nearestMetro?.distanceKm && (
              <div className="bg-muted/30 rounded-lg p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Navigation className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nearest Metro</p>
                  <p className="text-2xl font-semibold">
                    {community.accessibility.nearestMetro.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {community.accessibility.nearestMetro.distanceKm} km away
                  </p>
                </div>
              </div>
            )}
        </section>

        {/* Overview Narrative */}
        {community.narratives?.overview && (
          <section id="overview" className="scroll-mt-32">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold">Overview</h2>
              {community.narratives.overview.confidenceScore && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">
                    Confidence:{" "}
                    {(
                      community.narratives.overview.confidenceScore * 100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
              )}
            </div>
            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {community.narratives.overview.content}
              </p>
            </div>
          </section>
        )}

        {/* Investor Verdict */}
        {community.narratives?.investor_verdict && (
          <section id="investor-verdict" className="scroll-mt-32">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold">Investor Verdict</h2>
              {community.narratives.investor_verdict.confidenceScore && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">
                    Confidence:{" "}
                    {(
                      community.narratives.investor_verdict.confidenceScore *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
              )}
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {community.narratives.investor_verdict.content}
              </p>
            </div>
          </section>
        )}

        {/* Risks */}
        {community.narratives?.risks && (
          <section id="risks" className="scroll-mt-32">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold">Risks</h2>
              {community.narratives.risks.confidenceScore && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-muted-foreground">
                    Confidence:{" "}
                    {(community.narratives.risks.confidenceScore * 100).toFixed(
                      0
                    )}
                    %
                  </span>
                </div>
              )}
            </div>
            <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-lg p-6">
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {community.narratives.risks.content}
              </p>
            </div>
          </section>
        )}

        {/* Image Gallery */}
        {galleryImages.length > 0 && (
          <section id="gallery" className="scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-6">Gallery</h2>

            {/* Main Gallery Carousel */}
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-xl mb-4">
              <img
                src={galleryImages[currentImageIndex].url}
                alt={`${community.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Navigation Buttons */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                      currentImageIndex === index
                        ? "ring-4 ring-accent scale-95"
                        : "hover:scale-95 opacity-70 hover:opacity-100"
                    }`}
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

        {/* Description Section */}
        {community.description && (
          <section id="description" className="scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-6">Description</h2>
            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {community.description}
              </p>
            </div>
          </section>
        )}

        {/* Accessibility & Location */}
        {community.accessibility && (
          <section id="accessibility" className="scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-6">Accessibility</h2>
            <div className="space-y-6">
              {/* Coordinates and Metro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Coordinates */}
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Coordinates
                  </h3>
                  <div className="space-y-2">
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

                {/* Metro Information */}
                {community.accessibility.nearestMetro?.name &&
                  community.accessibility.nearestMetro?.distanceKm && (
                    <div className="bg-muted/30 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        Metro Access
                      </h3>
                      <div className="space-y-2">
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

              {/* Key Distances */}
              {community.accessibility.keyDistances && (
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Key Distances</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <span className="text-muted-foreground">
                        Downtown Dubai
                      </span>
                      <span className="font-semibold">
                        {community.accessibility.keyDistances.downtownKm} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <span className="text-muted-foreground">
                        Business Bay
                      </span>
                      <span className="font-semibold">
                        {community.accessibility.keyDistances.businessBayKm} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <span className="text-muted-foreground">Airport</span>
                      <span className="font-semibold">
                        {community.accessibility.keyDistances.airportKm} km
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Major Roads */}
              {community.accessibility.majorRoads &&
                community.accessibility.majorRoads.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Major Roads</h3>
                    <div className="flex flex-wrap gap-2">
                      {community.accessibility.majorRoads.map((road, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {road}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Area Distances */}
              {community.accessibility.areaDistances &&
                Object.keys(community.accessibility.areaDistances).length >
                  0 && (
                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Distances to Key Areas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {Object.entries(community.accessibility.areaDistances)
                        .sort(([, a], [, b]) => a - b)
                        .map(([area, distance]) => (
                          <div
                            key={area}
                            className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm capitalize text-muted-foreground">
                              {area
                                .replace(/distance_to_|_km/g, "")
                                .replace(/_/g, " ")}
                            </span>
                            <span className="font-semibold text-sm ml-2">
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

        {/* Special Classifications Section */}
        {community.classifications && community.classifications.length > 0 && (
          <section id="classifications" className="scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-6">
              Special Classifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {community.classifications.map((classification) => (
                <div
                  key={classification.id}
                  className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-lg p-6 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    {classification.title}
                  </h3>
                  {classification.type && (
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mb-2">
                      {classification.type}
                    </span>
                  )}
                  {classification.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      {classification.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Amenities Section */}
        {community.amenities && community.amenities.length > 0 && (
          <section id="amenities" className="scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-6">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {community.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="bg-muted/30 rounded-lg p-4 text-center hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium">{amenity.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Road Locations Section */}
        {community.roads && community.roads.length > 0 && (
          <section id="roads" className="scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-6">Road Locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {community.roads.map((road) => (
                <div
                  key={road.id}
                  className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium">{road.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Location Map Placeholder */}
        <section id="location" className="scroll-mt-32">
          <h2 className="text-3xl font-semibold mb-6">Location Map</h2>
          <div className="bg-muted/30 rounded-lg p-6 h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Interactive map will be displayed here
              </p>
              {community.accessibility?.coordinates && (
                <p className="text-sm text-muted-foreground">
                  {community.accessibility.coordinates.latitude},{" "}
                  {community.accessibility.coordinates.longitude}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="scroll-mt-32">
          <h2 className="text-3xl font-semibold mb-6">Related Projects</h2>

          {!community?.topProjects || community.topProjects.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-muted-foreground">
                No projects available for this community.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Developer</th>
                    <th className="px-4 py-3 font-medium">Starting Price</th>
                    <th className="px-4 py-3 font-medium">Down Payment</th>
                    <th className="px-4 py-3 font-medium">Phase</th>
                    <th className="px-4 py-3 font-medium">Delivery</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">🔥 Hotness</th>
                  </tr>
                </thead>

                <tbody>
                  {community.topProjects.map((project) => (
                    <tr
                      key={project.projectId}
                      className="border-t hover:bg-muted/40 transition"
                    >
                      <td className="px-4 py-3 font-medium">
                        {project.projectName}
                      </td>

                      <td className="px-4 py-3">
                        {project.developer?.name ?? "—"}
                      </td>

                      <td className="px-4 py-3">
                        {project.startingPrice
                          ? `AED ${project.startingPrice.toLocaleString()}`
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        {project.downPaymentPercentage
                          ? `${project.downPaymentPercentage}%`
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-xs">
                          <div>
                            Construction: {project.constructionPhase ?? "—"}
                          </div>
                          <div>Sales: {project.salesPhase ?? "—"}</div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {project.deliveryDate
                          ? new Date(project.deliveryDate).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-4 py-3 capitalize">
                        {project.stockAvailability ?? "—"}
                      </td>

                      <td className="px-4 py-3 font-semibold">
                        {project.hotnessLevel ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Market Insights Section */}
        <section id="market-insights" className="scroll-mt-32">
          <h2 className="text-3xl font-semibold mb-6">Market Insights</h2>
          <div className="bg-muted/30 rounded-lg p-6">
            <p className="text-muted-foreground">
              Market data and insights will be available here
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
