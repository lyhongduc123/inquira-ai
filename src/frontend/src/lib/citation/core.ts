import type { PaperMetadata } from "@/types/paper.type";
import { extractScopedCitationRefs } from "@/lib/scoped-citation-utils";

const RANGE_SEPARATOR_REGEX = /[-\u2010-\u2015\u2212]/;

function getSourceIndexFromCitationToken(token: string): number | null {
  const normalized = token.trim();
  if (!normalized) return null;

  const pairMatch = normalized.match(/^(?:idx)(\d+)[-_\u2010-\u2015\u2212](?:idy)(\d+)$/i);

  if (pairMatch) {
    return Number(pairMatch[1]);
  }

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  return null;
}

function getSourceByIndex(index: number, sources?: PaperMetadata[]): PaperMetadata | undefined {
  if (!sources?.length) return undefined;

  if (index >= 0 && index < sources.length) return sources[index];

  const oneBased = index - 1;
  if (oneBased >= 0 && oneBased < sources.length) return sources[oneBased];

  return undefined;
}

export function getSourcesFromCitationToken(
  token: string,
  sources?: PaperMetadata[],
): PaperMetadata[] {
  if (!sources?.length) return [];

  const normalized = token.trim();
  if (!normalized) return [];

  const direct = getSourceFromCitationToken(normalized, sources);
  if (direct) return [direct];

  const [startRaw, endRaw, ...rest] = normalized.split(RANGE_SEPARATOR_REGEX);
  if (rest.length > 0 || !startRaw || !endRaw) return [];

  const start = Number(startRaw.trim());
  const end = Number(endRaw.trim());
  if (!Number.isInteger(start) || !Number.isInteger(end)) return [];

  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const citedSources: PaperMetadata[] = [];
  const seen = new Set<string>();

  for (let index = min; index <= max; index += 1) {
    const source = getSourceByIndex(index, sources);
    if (!source?.paperId || seen.has(source.paperId)) continue;
    seen.add(source.paperId);
    citedSources.push(source);
  }

  return citedSources;
}

export function getSourceFromCitationToken(
  token: string,
  sources?: PaperMetadata[],
): PaperMetadata | undefined {
  if (!sources?.length) return undefined;

  const normalized = token.trim();
  if (!normalized) return undefined;

  const direct = sources.find(s => s.paperId === normalized);
  if (direct) return direct;

  const idx = getSourceIndexFromCitationToken(normalized);
  if (idx !== null) {
    return getSourceByIndex(idx, sources);
  }

  return undefined;
}

export function extractCitedPaperIds(text: string): string[] {
  const cited = new Set<string>();

  for (const ref of extractScopedCitationRefs(text)) {
    cited.add(ref.paperId);
  }

  for (const match of text.matchAll(/cite:([^()\s]+)/g)) {
    const tokens = String(match[1])
      .split(",")
      .map((part) => part.split("|")[0].trim())
      .filter(Boolean);

    for (const token of tokens) {
      cited.add(token);
    }
  }

  for (const match of text.matchAll(/\[\d+\]\(([^)]+)\)/g)) {
    cited.add(match[1]);
  }

  return [...cited];
}

export function getCitedPapers(
  text: string,
  sources?: PaperMetadata[],
): PaperMetadata[] {
  if (!sources?.length) return [];

  const citedIds = new Set<string>();

  for (const token of extractCitedPaperIds(text)) {
    const citedSources = getSourcesFromCitationToken(token, sources);
    for (const source of citedSources) {
      if (source.paperId) citedIds.add(source.paperId);
    }
  }

  return sources.filter(
    (source) => source.paperId && citedIds.has(source.paperId),
  );
}

export function createCitationMap(
  sources?: PaperMetadata[],
): Map<string, number> {
  const map = new Map<string, number>();
  sources?.forEach((s, i) => {
    if (s.paperId) map.set(s.paperId, i + 1);
  });
  return map;
}
