import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SearchFilters } from "@/app/(main)/_components/FilterPanel";
import { usePipelineStore } from "@/store/pipeline-store";

/**
 * Hook to manage search filters via URL parameters
 * and chat pipeline mode via global store.
 */
export function useSearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const persistedPipeline = usePipelineStore((state) => state.pipeline);
  const hasHydrated = usePipelineStore((state) => state.hasHydrated);
  const setPipeline = usePipelineStore((state) => state.setPipeline);
  const pipeline: "research" | "agent" = hasHydrated
    ? persistedPipeline
    : "research";

  const filters = useMemo((): SearchFilters => {
    const f: SearchFilters = {};

    const authorName =
      searchParams.get("authorName") ||
      searchParams.get("author_name") ||
      searchParams.get("author");
    if (authorName) {
      f.authorName = authorName;
    }

    const yearMin = searchParams.get("yearMin") || searchParams.get("year_min");
    if (yearMin) f.yearMin = parseInt(yearMin, 10);

    const yearMax = searchParams.get("yearMax") || searchParams.get("year_max");
    if (yearMax) f.yearMax = parseInt(yearMax, 10);

    const venue = searchParams.get("venue");
    if (venue) f.venue = venue;

    const minCitations =
      searchParams.get("minCitationCount") ||
      searchParams.get("min_citation_count") ||
      searchParams.get("min_citations");
    if (minCitations) {
      f.minCitationCount = parseInt(minCitations, 10);
    }

    const maxCitations =
      searchParams.get("maxCitationCount") ||
      searchParams.get("max_citation_count") ||
      searchParams.get("max_citations");
    if (maxCitations) {
      f.maxCitationCount = parseInt(maxCitations, 10);
    }

    const journalQuartile =
      searchParams.get("journalQuartile") ||
      searchParams.get("journal_quartile") ||
      searchParams.get("journal_rank");
    if (journalQuartile && ["Q1", "Q2", "Q3", "Q4"].includes(journalQuartile)) {
      f.journalQuartile = journalQuartile as "Q1" | "Q2" | "Q3" | "Q4";
    }

    const fields =
      searchParams.get("fieldOfStudy")?.split(",").filter(Boolean)
      || searchParams.get("field_of_study")?.split(",").filter(Boolean)
      || searchParams.get("fields_of_study")?.split(",").filter(Boolean)
      || searchParams.get("category")?.split(",").filter(Boolean);
    if (fields && fields.length > 0) {
      f.fieldOfStudy = fields;
    }

    return f;
  }, [searchParams]);

  useEffect(() => {
    const legacyModeParam = searchParams.get("mode");
    if (legacyModeParam === "agent" || legacyModeParam === "research") {
      if (legacyModeParam !== persistedPipeline) {
        setPipeline(legacyModeParam);
      }
    }
  }, [persistedPipeline, searchParams, setPipeline]);

  const setParams = useCallback(
    (newFilters: SearchFilters, newPipeline?: "research" | "agent") => {
      const params = new URLSearchParams(searchParams.toString());

      // Helper to set or delete param
      const updateParam = (key: string, value: unknown) => {
        if (value !== undefined && value !== null && value !== "" && value !== false) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      };

      updateParam("authorName", newFilters.authorName);
      updateParam("yearMin", newFilters.yearMin);
      updateParam("yearMax", newFilters.yearMax);

      updateParam("venue", newFilters.venue);
      updateParam("minCitationCount", newFilters.minCitationCount);
      updateParam("maxCitationCount", newFilters.maxCitationCount);
      updateParam("journalQuartile", newFilters.journalQuartile);
      
      const selectedFields = newFilters.fieldOfStudy;
      if (selectedFields && selectedFields.length > 0) {
        params.set("fieldOfStudy", selectedFields.join(","));
      } else {
        params.delete("fieldOfStudy");
      }

      [
        "author",
        "author_name",
        "year_min",
        "year_max",
        "min_citation_count",
        "max_citation_count",
        "min_citations",
        "max_citations",
        "journal_quartile",
        "journal_rank",
        "field_of_study",
        "fields_of_study",
        "category",
        "open_access",
        "exclude_preprints",
        "top_journals",
      ].forEach((key) => params.delete(key));

      if (params.has("mode")) {
        params.delete("mode");
      }

      if (newPipeline) {
        setPipeline(newPipeline);
      }

      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams, setPipeline]
  );

  const clearFilters = useCallback(() => {
    setParams({}, pipeline);
  }, [setParams, pipeline]);

  return {
    filters,
    pipeline,
    setParams,
    clearFilters,
  };
}
