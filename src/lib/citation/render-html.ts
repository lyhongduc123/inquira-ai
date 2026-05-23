import type { PaperMetadata } from "@/types/paper.type";
import {
  createScopedCitationRefMap,
  getScopedCitationKey,
  getScopedCitationRef,
} from "@/lib/scoped-citation-utils";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";
import {
  getSourceFromCitationToken,
  getSourcesFromCitationToken,
  createCitationMap,
} from "./core";

import {
  SCOPED_CITATION_REGEX,
  CITATIONS_REGEX,
  LEGACY_FORMAT_REGEX,
} from "./regex";

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/\"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderCitationTag(
  tagName: "citation" | "scoped-citation" | "citation-group" | "missing",
  attributes: Record<string, string>,
  content: string,
) {
  const renderedAttributes = Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeHtmlAttribute(value)}"`)
    .join(" ");

  return `<${tagName}${renderedAttributes ? ` ${renderedAttributes}` : ""}>${content}</${tagName}>`;
}

export function convertCitationsToElements(
  text: string,
  sources?: PaperMetadata[],
  scopedQuoteRefs?: ScopedCitationRef[],
) {
  const citationMap = createCitationMap(sources);
  const scopedMap = createScopedCitationRefMap(scopedQuoteRefs);

  let result = text.replace(
    SCOPED_CITATION_REGEX,
    (match, paperIdRaw, chunkIdRaw, charStart, charEnd) => {
      const token = paperIdRaw?.trim();
      const chunkId = chunkIdRaw?.trim();

      if (!token || !chunkId) {
        return match;
      }

      const source = getSourceFromCitationToken(token, sources);
      const paperId = source?.paperId;
      if (!paperId) {
        return match;
      }

      const number = citationMap.get(paperId);
      if (number === undefined) {
        return match;
      }

      const scopedKey = getScopedCitationKey({
        paperId,
        chunkId,
        charStart: charStart ? Number(charStart) : null,
        charEnd: charEnd ? Number(charEnd) : null,
      });

      const scopedRef = getScopedCitationRef(scopedMap, scopedKey, match);
      const quote = escapeHtmlAttribute(scopedRef?.quote ?? "");
      const section = escapeHtmlAttribute(scopedRef?.section ?? "");

      return renderCitationTag(
        "scoped-citation",
        {
          "data-id": paperId,
          "data-number": String(number),
          "data-chunk-id": chunkId,
          "data-char-start": charStart ?? "",
          "data-char-end": charEnd ?? "",
          "data-key": scopedKey,
          "data-marker": match,
          "data-section": section,
          "data-quote": quote,
        },
        `[${number}]`,
      );
    },
  );

  result = result.replace(CITATIONS_REGEX, (match, content) => {
    const parts = String(content).split(/(\s*,\s*)/);
    const rendered: string[] = [];

    for (const part of parts) {
      if (/^\s*,\s*$/.test(part)) {
        rendered.push(part);
        continue;
      }

      const token = part.replace("cite:", "").trim();
      const tokenSources = getSourcesFromCitationToken(token, sources);
      // console.log("Processing token:", token, "Found source:", tokenSources);
      if (!tokenSources.length) {
        rendered.push(
          renderCitationTag(
            "missing",
            {
              "data-token": token,
            },
            "[?]",
          ),
        );
        continue;
      }

      if (tokenSources.length > 4) {
        const groupNumbers = tokenSources
          .map((source) => citationMap.get(source.paperId))
          .filter((number): number is number => number !== undefined);

        if (groupNumbers.length) {
          rendered.push(
            renderCitationTag(
              "citation-group",
              {
                "data-ids": tokenSources.map((source) => source.paperId).join(","),
                "data-numbers": groupNumbers.join(","),
                "data-token": token,
              },
              `[${groupNumbers[0]}-${groupNumbers[groupNumbers.length - 1]}]`,
            ),
          );
          continue;
        }
      }

      for (const source of tokenSources) {
        const number = citationMap.get(source.paperId);
        if (number === undefined) {
          rendered.push(
            renderCitationTag(
              "missing",
              {
                "data-id": source.paperId,
                "data-token": token,
              },
              "[?]",
            ),
          );
          continue;
        }

        rendered.push(
          renderCitationTag(
            "citation",
            {
              "data-id": source.paperId,
              "data-number": String(number),
            },
            `[${number}]`,
          ),
        );
      }
    }

    return rendered.join("");
  });

  result = result.replace(LEGACY_FORMAT_REGEX, (_match, number, paperId) => {
    return renderCitationTag(
      "citation",
      {
        "data-id": paperId,
        "data-number": number,
      },
      `[${number}]`,
    );
  });

  return result;
}
