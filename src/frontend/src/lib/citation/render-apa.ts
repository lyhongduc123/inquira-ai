import type { PaperMetadata } from "@/types/paper.type";
import { getSourceFromCitationToken, getSourcesFromCitationToken } from "./core";
import {
  CITATIONS_REGEX,
  LEGACY_FORMAT_REGEX,
  SCOPED_CITATION_REGEX,
} from "./regex";

function formatInlineApaCitation(paper: PaperMetadata): string {
  const authors = paper.authors ?? [];
  const year = paper.year ?? "n.d.";

  const firstLastName = authors[0]?.name?.split(" ").slice(-1)[0] ?? "Unknown";

  if (authors.length >= 3) {
    return `(${firstLastName} et al., ${year})`;
  }

  if (authors.length === 2) {
    const secondLastName = authors[1]?.name?.split(" ").slice(-1)[0] ?? "Unknown";
    return `(${firstLastName} & ${secondLastName}, ${year})`;
  }

  return `(${firstLastName}, ${year})`;
}

export function formatCitationsToApa(
  text: string,
  sources?: PaperMetadata[],
): string {
  let result = text.replace(/(^|[^\w(])cite:([^\s)]+)/g, (_, prefix, token) => {
    return `${prefix}(cite:${token})`;
  });

  result = result.replace(LEGACY_FORMAT_REGEX, (_match, _number, token) => {
    const paper = getSourceFromCitationToken(token, sources);
    if (!paper) return _match;
    return formatInlineApaCitation(paper);
  });

  result = result.replace(
    SCOPED_CITATION_REGEX,
    (match, paperIdRaw) => {
      const paper = getSourceFromCitationToken(String(paperIdRaw).trim(), sources);
      if (!paper) {
        return match;
      }

      return formatInlineApaCitation(paper);
    },
  );

  result = result.replace(CITATIONS_REGEX, (match, content) => {
    const parts = String(content)
      .split(",")
      .map((part) => part.trim());

    const rendered: string[] = [];

    for (const part of parts) {
      const token = part.startsWith("cite:")
        ? part.slice(5).trim()
        : part;

      const papers = getSourcesFromCitationToken(token, sources);
      if (!papers.length) {
        return match;
      }

      rendered.push(...papers.map(formatInlineApaCitation));
    }

    return rendered.join("");
  });

  return result;
}

export function getFormattedCitedContent(
  text: string,
  sources?: PaperMetadata[],
): string {
  const body = formatCitationsToApa(text, sources);
  return buildReferencesSection(body, sources);
}

export function buildReferencesSection(
  text?: string,
  sources?: PaperMetadata[],
) {
  const sectionHeader = "## References\n\n";

  if (!sources?.length) {
    const section = `${sectionHeader}No references cited.`;
    return text ? `${text}\n\n${section}` : section;
  }

  const section =
    sectionHeader
    + sources
      .map((source) => source.citationStyles?.apa ?? `${source.title} (${source.paperId})`)
      .join("\n");

  return text ? `${text}\n\n${section}` : section;
}
