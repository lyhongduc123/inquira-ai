/**
 * Utility functions for transforming search filters between frontend and backend formats
 */

import { SearchFilters } from "@/app/(main)/_components/FilterPanel";
import { ChatSubmitFilters } from "@/types/task.type";

/**
 * Remove empty values while preserving the chat submit filter shape.
 */
export function transformFiltersForBackend(
  filters?: SearchFilters,
): ChatSubmitFilters | undefined {
  if (!filters) return undefined;

  const transformed: ChatSubmitFilters = {};

  if (filters.authorName) transformed.authorName = filters.authorName;
  if (filters.yearMin !== undefined) transformed.yearMin = filters.yearMin;
  if (filters.yearMax !== undefined) transformed.yearMax = filters.yearMax;
  if (filters.venue) transformed.venue = filters.venue;
  if (filters.minCitationCount !== undefined) {
    transformed.minCitationCount = filters.minCitationCount;
  }
  if (filters.maxCitationCount !== undefined) {
    transformed.maxCitationCount = filters.maxCitationCount;
  }
  if (filters.journalQuartile) {
    transformed.journalQuartile = filters.journalQuartile;
  }
  if (filters.fieldOfStudy && filters.fieldOfStudy.length > 0) {
    transformed.fieldOfStudy = filters.fieldOfStudy;
  }
  if (filters.paperIds && filters.paperIds.length > 0) {
    transformed.paperIds = filters.paperIds;
  }

  return Object.keys(transformed).length > 0 ? transformed : undefined;
}

/**
 * Check if filters object has any active filters
 */
export function hasActiveFilters(filters?: SearchFilters): boolean {
  if (!filters) return false;

  return (
    Boolean(filters.authorName) ||
    Boolean(filters.venue) ||
    filters.yearMin !== undefined ||
    filters.yearMax !== undefined ||
    filters.minCitationCount !== undefined ||
    filters.maxCitationCount !== undefined ||
    Boolean(filters.fieldOfStudy && filters.fieldOfStudy.length > 0) ||
    Boolean(filters.paperIds && filters.paperIds.length > 0) ||
    Boolean(filters.journalQuartile)
  );
}
