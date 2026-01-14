"use client";

import {
  Loader2,
  Sparkles,
  Badge,
  GitCompare,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/helpers/OrgLLMRES";
import SnapShotSection from "./SnapShotSection";
import InvestmentScore from "./InvestmentScore";

// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";

const PremiumModal = ({
  showModal,
  setShowModal,
  chartType,
  areaName,
  summary = [],
}) => {
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [compareArea, setCompareArea] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const [areaSearchOpen, setAreaSearchOpen] = useState(false);
  const [areaSearchValue, setAreaSearchValue] = useState("");
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [aiNarrative, setAiNarrative] = useState("");
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  useEffect(() => {
    console.log("🔥 useEffect triggered", {
      showModal,
      chartType,
      areaName,
      summary,
    });

    if (!showModal || !chartType || !areaName || !summary) {
      console.log("⛔ Skipping fetch because missing:", {
        showModal,
        chartType,
        areaName,
        summary,
      });
      return;
    }

    const fetchNarrative = async () => {
      console.log("🚀 Fetching narrative now...");

      setLoadingNarrative(true);
      setAiNarrative("");

      try {
        const res = await fetch(
          "http://localhost:8000/api/ai/generate/insights",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chart_type: chartType,
              context: { area: areaName, propertyType: "apartments" },
              data_summary: summary,
              detail_level: "detailed",
              mode: "narrative",
            }),
          }
        );

        console.log("📥 Raw response:", res);

        const data = await res.json();
        console.log("🎯 Parsed AI narrative data:", data);

        setAiNarrative(data.aiNarrative || "No narrative available");
      } catch (err) {
        console.error("💥 Fetch narrative FAILED:", err);
        setAiNarrative("⚠️ Unable to generate AI narrative right now.");
      } finally {
        setLoadingNarrative(false);
      }
    };

    fetchNarrative();
  }, [showModal, chartType, areaName, summary]);

  useEffect(() => {
    const fetchAreas = async () => {
      if (areaSearchValue.trim().length < 2) {
        setFilteredAreas([]);
        return;
      }

      setLoadingSearch(true);
      try {
        const res = await fetch(`/api/areas?search=${areaSearchValue}`);
        const data = await res.json();
        setFilteredAreas(data || []);
      } catch (err) {
        console.error("Error fetching areas:", err);
      } finally {
        setLoadingSearch(false);
      }
    };

    const delay = setTimeout(fetchAreas, 300);
    return () => clearTimeout(delay);
  }, [areaSearchValue]);

  // console.log(summary)

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto">
        {loadingDetails ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                Analyzing data and generating insights...
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Market Insights — {chartType} in {areaName}
                    {showComparison && compareArea && (
                      <span className="text-muted-foreground">
                        {" "}
                        vs {compareArea}
                      </span>
                    )}
                  </DialogTitle>
                  <p className="text-muted-foreground mt-2">
                    AI-driven analysis powered by DLD, web, and market data.
                  </p>
                </div>

                {/* Compare Area Selector */}
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-accent" />
                  <Popover
                    open={areaSearchOpen}
                    onOpenChange={setAreaSearchOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-between"
                      >
                        {compareArea ? (
                          <Badge className="px-2 py-0.5">{compareArea}</Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            Search area...
                          </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search area..."
                          value={areaSearchValue}
                          onValueChange={setAreaSearchValue}
                        />
                        <CommandList>
                          {loadingSearch ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <>
                              <CommandEmpty>No area found.</CommandEmpty>
                              <CommandGroup className="max-h-[200px] overflow-y-auto">
                                <CommandItem
                                  key="none"
                                  value="none"
                                  onSelect={() => {
                                    setCompareArea(null);
                                    setShowComparison(false);
                                    setAreaSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      !showComparison
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  No comparison
                                </CommandItem>

                                {filteredAreas.map((area) => (
                                  <CommandItem
                                    key={area.id}
                                    value={area.name}
                                    onSelect={() => {
                                      setCompareArea(area.name);
                                      setShowComparison(true);
                                      setAreaSearchOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        compareArea === area.name
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {area.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* <div className="flex gap-2 mt-3">
                <Badge className="bg-emerald/10 text-emerald border-emerald/20">
                  🟩 High Confidence
                </Badge>
              </div> */}
            </DialogHeader>

            {/* 🧠 AI Narrative Summary Section */}
            <div>
              <SnapShotSection
                chartType={chartType}
                areaName={areaName}
                summary={summary}
              />
            </div>
            <div className="max-h-[500px] overflow-y-auto p-4 bg-white rounded-xl shadow-sm">
              <MarkdownRenderer text={aiNarrative} />
            </div>
            <div>
              <InvestmentScore areaName={areaName} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;
