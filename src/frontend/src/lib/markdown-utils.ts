export {
  CITATIONS_REGEX,
  LEGACY_FORMAT_REGEX,
  SCOPED_CITATION_REGEX,
} from "@/lib/citation/regex";
export { convertCitationsToElements } from "@/lib/citation/render-html";
export { extractScopedCitationRefs } from "@/lib/scoped-citation-utils";

/**
 * Normalizes markdown list formatting by fixing excessive spacing
 * and ensuring consistent line breaks.
 */
export function normalizeMarkdownLists(text: string): string {
  return (
    text
      // Fix stars/dashes/plus bullets with excessive spaces: "*   Text" → "* Text"
      // Only replace if there are 2 or more spaces AND followed by non-whitespace
      .replace(/^([\*\-+])\s{2,}(?=\S)/gm, "$1 ")
      // Fix numbered bullets with excessive spaces: "1.  Text" → "1. Text"
      // Only replace if there are 2 or more spaces AND followed by non-whitespace
      .replace(/^(\d+\.)\s{2,}(?=\S)/gm, "$1 ")
      // Ensure consistent line breaks (max 2 consecutive newlines)
      .replace(/\n{3,}/g, "\n\n")
  );
}
