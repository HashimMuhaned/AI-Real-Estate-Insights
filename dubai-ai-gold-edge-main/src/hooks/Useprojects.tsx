import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/Usedebounce";
import { buildQueryParams, FilterState, LIMIT } from "@/lib/Buildqueryparams";

type Developer = { id: number; name: string; logo?: string };

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
  hotness?: number;
};

const DEFAULT_FILTERS: FilterState = {
  query: "",
  sortBy: "recent",
  priceRange: "all",
  propertyType: "all",
  deliveryStatus: "all",
  selectedDeveloper: "all",
  hotnessLevel: "all",
};

export function useProjects() {
  // ─── UI state (what the user is editing) ──────────────────────────────────
  const [uiFilters, setUiFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // ─── Applied state (what triggers API calls) ──────────────────────────────
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Debounce only the search query; other filters apply instantly via selects
  const debouncedQuery = useDebounce(uiFilters.query, 400);

  // When debounced query settles → push it into appliedFilters
  useEffect(() => {
    setAppliedFilters((prev) => ({ ...prev, query: debouncedQuery }));
  }, [debouncedQuery]);

  // ─── Pagination ───────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ─── Loading flags ────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);      // initial / filter-change load
  const [isFetchingMore, setIsFetchingMore] = useState(false); // infinite scroll
  const [isRefreshing, setIsRefreshing] = useState(false);     // filter changed but data exists

  // AbortController ref — cancel stale requests
  const abortRef = useRef<AbortController | null>(null);

  // ─── Core fetch: reset + reload when appliedFilters change ────────────────
  useEffect(() => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const isFirstLoad = projects.length === 0;
    if (isFirstLoad) {
      setLoading(true);
    } else {
      setIsRefreshing(true); // keep old results visible while we fetch
    }

    // Reset pagination
    setOffset(0);
    setHasMore(true);

    const params = buildQueryParams(appliedFilters, 0);

    fetch(`/api/projects?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects ?? []);
        setOffset(data.nextOffset ?? LIMIT);
        setHasMore(data.hasMore ?? false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // intentionally cancelled — ignore
        console.error("Error loading projects:", err);
        setHasMore(false);
      })
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  // ─── Load more (infinite scroll) ─────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);

    const params = buildQueryParams(appliedFilters, offset);

    try {
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects((prev) => [...prev, ...(data.projects ?? [])]);
      setOffset(data.nextOffset ?? offset + LIMIT);
      setHasMore(data.hasMore ?? false);
    } catch (err) {
      console.error("Error loading more projects:", err);
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
    }
  }, [appliedFilters, offset, hasMore, isFetchingMore]);

  // ─── Filter helpers ───────────────────────────────────────────────────────
  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setUiFilters((prev) => ({ ...prev, [key]: value }));

      // For non-query filters, apply immediately
      if (key !== "query") {
        setAppliedFilters((prev) => ({ ...prev, [key]: value }));
      }
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setUiFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    appliedFilters.query !== "" ||
    appliedFilters.priceRange !== "all" ||
    appliedFilters.propertyType !== "all" ||
    appliedFilters.deliveryStatus !== "all" ||
    appliedFilters.sortBy !== "recent" ||
    appliedFilters.selectedDeveloper !== "all" ||
    appliedFilters.hotnessLevel !== "all";

  return {
    // data
    projects,
    hasMore,
    // ui state (for controlled inputs)
    uiFilters,
    appliedFilters,
    // loading flags
    loading,
    isFetchingMore,
    isRefreshing,
    // actions
    setFilter,
    clearAllFilters,
    loadMore,
    hasActiveFilters,
  };
}