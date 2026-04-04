import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SearchFilters } from "@/app/_components/FilterPanel";

/**
 * Hook to manage search filters via URL parameters.
 * This ensures filters are persistent across page refreshes and sharable via URL.
 */
export function useSearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo((): { filters: SearchFilters; pipeline: "research" | "agent" } => {
    const f: SearchFilters = {};

    const author = searchParams.get("author");
    if (author) f.author = author;

    const yearMin = searchParams.get("year_min");
    if (yearMin) f.year_min = parseInt(yearMin, 10);

    const yearMax = searchParams.get("year_max");
    if (yearMax) f.year_max = parseInt(yearMax, 10);

    const venue = searchParams.get("venue");
    if (venue) f.venue = venue;

    const minCitations = searchParams.get("min_citations");
    if (minCitations) f.min_citations = parseInt(minCitations, 10);

    const maxCitations = searchParams.get("max_citations");
    if (maxCitations) f.max_citations = parseInt(maxCitations, 10);

    const categories = searchParams.get("category")?.split(",").filter(Boolean);
    if (categories && categories.length > 0) f.category = categories;

    const openAccess = searchParams.get("open_access");
    if (openAccess === "true") f.openAccessOnly = true;

    const excludePreprints = searchParams.get("exclude_preprints");
    if (excludePreprints === "true") f.excludePreprints = true;

    const topJournals = searchParams.get("top_journals");
    if (topJournals === "true") f.topJournalsOnly = true;

    // Handle pipeline mode
    const pipelineParam = searchParams.get("mode");
    const mode = (pipelineParam === "agent" ? "agent" : "research") as "research" | "agent";

    // Handle legacy yearRange for UI compatibility if needed
    if (f.year_min !== undefined || f.year_max !== undefined) {
      f.yearRange = {
        min: f.year_min,
        max: f.year_max,
      };
    }

    return { filters: f, pipeline: mode };
  }, [searchParams]);

  const setParams = useCallback(
    (newFilters: SearchFilters, newPipeline?: "research" | "agent") => {
      const params = new URLSearchParams(searchParams.toString());

      // Helper to set or delete param
      const updateParam = (key: string, value: any) => {
        if (value !== undefined && value !== null && value !== "" && value !== false) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      };

      updateParam("author", newFilters.author);
      
      // Prefer yearRange if it exists, otherwise use flat fields
      const yearMin = newFilters.yearRange?.min ?? newFilters.year_min;
      const yearMax = newFilters.yearRange?.max ?? newFilters.year_max;
      updateParam("year_min", yearMin);
      updateParam("year_max", yearMax);

      updateParam("venue", newFilters.venue);
      updateParam("min_citations", newFilters.min_citations);
      updateParam("max_citations", newFilters.max_citations);
      
      if (newFilters.category && newFilters.category.length > 0) {
        params.set("category", newFilters.category.join(","));
      } else {
        params.delete("category");
      }

      updateParam("open_access", newFilters.openAccessOnly);
      updateParam("exclude_preprints", newFilters.excludePreprints);
      updateParam("top_journals", newFilters.topJournalsOnly);

      if (newPipeline) {
        params.set("mode", newPipeline);
      }

      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const clearFilters = useCallback(() => {
    setParams({}, state.pipeline);
  }, [setParams, state.pipeline]);

  return {
    filters: state.filters,
    pipeline: state.pipeline,
    setParams,
    clearFilters,
  };
}
