/**
 * Utility functions for transforming search filters between frontend and backend formats
 */

import { SearchFilters } from "@/app/_components/FilterPanel";

/**
 * Transform frontend filter format to backend expected format
 * 
 * Frontend uses camelCase and nested objects (yearRange)
 * Backend expects snake_case and flat structure (year_min, year_max)
 */
export function transformFiltersForBackend(filters?: SearchFilters): Record<string, unknown> | undefined {
  if (!filters) return undefined;

  const transformed: Record<string, unknown> = {};

  // Transform yearRange to yearMin/yearMax
  if (filters.yearRange) {
    if (filters.yearRange.min !== undefined) {
      transformed.yearMin = filters.yearRange.min;
    }
    if (filters.yearRange.max !== undefined) {
      transformed.yearMax = filters.yearRange.max;
    }
  }

  // Direct mappings for camelCase fields
  if (filters.author) transformed.author = filters.author;
  if (filters.year_min !== undefined) transformed.yearMin = filters.year_min;
  if (filters.year_max !== undefined) transformed.yearMax = filters.year_max;
  if (filters.venue) transformed.venue = filters.venue;
  if (filters.min_citations !== undefined) transformed.minCitations = filters.min_citations;
  if (filters.max_citations !== undefined) transformed.maxCitations = filters.max_citations;

  return Object.keys(transformed).length > 0 ? transformed : undefined;
}

/**
 * Check if filters object has any active filters
 */
export function hasActiveFilters(filters?: SearchFilters): boolean {
  if (!filters) return false;

  return (
    Boolean(filters.author) ||
    Boolean(filters.venue) ||
    (filters.yearRange?.min !== undefined || filters.yearRange?.max !== undefined) ||
    (filters.year_min !== undefined || filters.year_max !== undefined) ||
    (filters.min_citations !== undefined || filters.max_citations !== undefined) ||
    (filters.category && filters.category.length > 0) ||
    filters.openAccessOnly === true ||
    filters.excludePreprints === true ||
    filters.topJournalsOnly === true
  );
}
