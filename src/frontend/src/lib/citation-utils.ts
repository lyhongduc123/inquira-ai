import type { PaperMetadata } from "@/types/paper.type";
import {
  createCitationMap as createCitationNumberMap,
  extractCitedPaperIds as extractCitedIds,
  getCitedPapers as getCitedSourcePapers,
} from "@/lib/citation/core";
import {
  formatCitationsToApa,
  buildReferencesSection as buildApaReferencesSection,
} from "@/lib/citation/render-apa";

/**
 * Extracts all paper IDs that are cited in the message text
 * Supports both formats:
 * - (cite:paper_id)
 * - [number](paper_id)
 */
export function extractCitedPaperIds(text: string): string[] {
  return extractCitedIds(text);
}

/**
 * Filters sources to only include papers that are cited in the message text
 * Returns papers in the order they appear in the sources array
 */
export function getCitedPapers(
  text: string,
  sources?: PaperMetadata[],
): PaperMetadata[] {
  return getCitedSourcePapers(text, sources);
}

/**
 * Format original content to APA style citations and build references section
 */
export function getFormattedCitedContent(
  text: string,
  cited_sources?: PaperMetadata[],
): string {
  const body = formatCitationsToApa(text, cited_sources);
  return buildReferencesSection(body, cited_sources);
}

/**
 * Builds the references section for cited papers
 * Returns a string containing the references section
 */
export function buildReferencesSection(
  text?: string,
  cited_sources?: PaperMetadata[],
): string {
  return buildApaReferencesSection(text, cited_sources);
}

/**
 * Creates a citation number map for cited papers
 * Returns a map of paperId to citation number (1-indexed)
 */
export function createCitationMap(
  text: string,
  sources?: PaperMetadata[],
): Map<string, number> {
  const citedPapers = getCitedSourcePapers(text, sources);
  const map = new Map<string, number>();

  if (!citedPapers.length) {
    return createCitationNumberMap(sources);
  }

  citedPapers.forEach((paper, index) => {
    if (paper.paperId) map.set(paper.paperId, index + 1);
  });

  return map;
}
