"use client";

import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams, useRouter } from "next/navigation";
import { Project } from "@/types/topProjects";

export default function TopProjectsInArea() {
  const { areaName } = useParams(); // e.g. "Abu-Hail"
  const router = useRouter();

  const slugParam = Array.isArray(areaName) ? areaName[0] : areaName;
  const NormAreaName = slugParam?.replace(/-/g, " ");

  const [filters, setFilters] = useState({
    mode: "sales", // "sales" | "rents"
    year: "2024",
    propertyTypes: [] as string[],
    transferType: "all",
    propertyUsage: "all",
    regType: "all",
    salesVolume: "desc",
    avgPrice: "desc",
  });

  const PROPERTY_TYPES_BY_USAGE: Record<string, string[]> = {
    all: [
      "Apartment",
      "Villa",
      "Stacked Townhouses",
      "Office",
      "Shop",
      "Hotel Apartment",
      "Hotel Rooms",
    ],
    Residential: ["Apartment", "Villa", "Stacked Townhouses"],
    Commercial: ["Office", "Shop"],
    Hospitality: ["Hotel Apartment", "Hotel Rooms"],
  };

  const visiblePropertyTypes =
    PROPERTY_TYPES_BY_USAGE[filters.propertyUsage] || [];

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from backend
  useEffect(() => {
    if (!areaName) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          search: NormAreaName,
          year: filters.year,
          regType: filters.regType,
          transferType: filters.transferType,
          propertyUsage: filters.propertyUsage,
          propertyTypes: filters.propertyTypes.join(","),
        });

        // 🔄 Dynamically choose endpoint based on mode
        const endpoint =
          filters.mode === "rents"
            ? "http://localhost:8080/api/get-top-rent-projects"
            : "http://localhost:8080/api/get-top-projects";

        const res = await fetch(`${endpoint}?${query.toString()}`);
        if (!res.ok) {
          console.error("Failed request:", res.status, res.statusText);
        }

        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    areaName,
    filters.year,
    filters.regType,
    filters.transferType,
    filters.propertyUsage,
    filters.propertyTypes,
  ]);

  const togglePropertyType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((t) => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value;
  };

  const handleRowClick = (project: Project) => {
    const projectSlug = project?.name?.toLowerCase().replace(/\s+/g, "-");
    router.push(`/project-insights/${projectSlug}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Apartment":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Villa":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Stacked Townhouses":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Office":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Shop":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";
      case "Hotel Apartment":
      case "Hotel Rooms":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Transfer type color
  const getTransferColor = (transferType: string) => {
    switch (transferType) {
      case "Sales":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "Mortgage":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Usage color
  const getUsageColor = (usage: string) => {
    switch (usage) {
      case "Residential":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300";
      case "Commercial":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Project status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Existing Properties":
        return "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300";
      case "Off-Plan":
        return "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredProjects = projects.filter((project) => {
    // Property Usage
    if (
      filters.propertyUsage !== "all" &&
      project.property_usage?.toLowerCase() !==
        filters.propertyUsage.toLowerCase()
    ) {
      return false;
    }

    // Property Types (normalize)
    if (
      filters.propertyTypes.length > 0 &&
      !filters.propertyTypes.some(
        (t) => t.trim().toLowerCase() === project.type?.trim().toLowerCase()
      )
    ) {
      return false;
    }

    // Transfer Type
    if (
      filters.transferType !== "all" &&
      project.transferType?.toLowerCase() !== filters.transferType.toLowerCase()
    ) {
      return false;
    }

    // Registration Type
    if (
      filters.regType !== "all" &&
      project.reg_type?.toLowerCase() !== filters.regType.toLowerCase()
    ) {
      return false;
    }

    return true;
  });

  const sortedProjects = filteredProjects.sort((a, b) => {
    // Sales Volume
    if (filters.salesVolume === "desc") {
      return b.salesVolume - a.salesVolume;
    } else if (filters.salesVolume === "asc") {
      return a.salesVolume - b.salesVolume;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-background mb-6">
      {/* Filters */}
      <Card className="sticky top-14 z-10 shadow-lg bg-card rounded-lg border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Top Projects
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button
              variant={filters.mode === "sales" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, mode: "sales" }))}
            >
              Sales Mode
            </Button>
            <Button
              variant={filters.mode === "rents" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, mode: "rents" }))}
            >
              Rentals Mode
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Year */}
            <div className="min-w-[120px]">
              <label className="text-xs font-medium text-muted-foreground">
                Year
              </label>
              <Select
                value={filters.year}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, year: value }))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["2024", "2023", "2022", "2021", "2020"].map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground">
                Property Type
              </label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {visiblePropertyTypes.map((type) => (
                  <Button
                    key={type}
                    variant={
                      filters.propertyTypes.includes(type)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => togglePropertyType(type)}
                    className="h-7 px-2 text-xs"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Transfer Type */}
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground">
                Transfer Type
              </label>
              <Select
                value={filters.transferType}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, transferType: value }))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Mortgages">Mortgage</SelectItem>
                  <SelectItem value="Gift">Gift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Usage */}
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground">
                Usage
              </label>
              <Select
                value={filters.propertyUsage}
                onValueChange={(value) => {
                  const allowedTypes = PROPERTY_TYPES_BY_USAGE[value] || [];
                  setFilters((prev) => ({
                    ...prev,
                    propertyUsage: value,
                    propertyTypes: prev.propertyTypes.filter((t) =>
                      allowedTypes.includes(t)
                    ),
                  }));
                }}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Hospitality">Hospitality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reg Type */}
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground">
                Registration
              </label>
              <Select
                value={filters.regType}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, regType: value }))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Off-plan">Off-plan</SelectItem>
                  <SelectItem value="Existing Properties">Existing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="shadow-md mt-4">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No projects found for {NormAreaName}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Usage</TableHead>
                    {filters.mode === "sales" && (
                      <>
                        <TableHead className="text-center">
                          Project Status
                        </TableHead>
                        <TableHead className="text-center">
                          Transfer Type
                        </TableHead>
                        <TableHead className="text-right">
                          Sales Volume
                        </TableHead>
                        <TableHead className="text-right">
                          Avg Price/Sqft
                        </TableHead>
                      </>
                    )}
                    {filters.mode === "rents" && (
                      <>
                        <TableHead className="text-right">Contracts</TableHead>
                        <TableHead className="text-right">
                          Avg Annual Rent
                        </TableHead>
                        <TableHead className="text-right">
                          Avg Rent/Sqft
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProjects.map((project, index) => (
                    <TableRow
                      key={`${project.id}-${index}`}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => handleRowClick(project)}
                    >
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {project.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={getTypeColor(project.type)}
                          variant="secondary"
                        >
                          {project.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={getUsageColor(project.property_usage)}
                          variant="secondary"
                        >
                          {project.property_usage}
                        </Badge>
                      </TableCell>

                      {/* Sales Mode Columns */}
                      {filters.mode === "sales" && (
                        <>
                          <TableCell className="text-center">
                            <Badge
                              className={getStatusColor(project.reg_type)}
                              variant="secondary"
                            >
                              {project.reg_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={getTransferColor(project.transferType)}
                              variant="secondary"
                            >
                              {project.transferType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(project.salesVolume))} AED
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(Number(project.avgPricePerSqft))}
                          </TableCell>
                        </>
                      )}

                      {/* Rentals Mode Columns */}
                      {filters.mode === "rents" && (
                        <>
                          <TableCell className="text-right">
                            {project.total_contracts}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(Number(project.avg_annual_rent))}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(Number(project.avg_rent_per_sqft))}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
