"use client";

import React from "react";
import { Streamdown } from "streamdown";
import type { PaperMetadata } from "@/types/paper.type";
import { Citation, CitationGroup, MissingCitation } from "./Citation";
import { convertCitationsToElements } from "@/lib/citation/render-html";
import {
  createScopedCitationRefMap,
  getScopedCitationRef,
  getScopedCitationKey,
} from "@/lib/scoped-citation-utils";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";

interface StreamdownRenderProps {
  message: string;
  sources?: PaperMetadata[];
  scopedQuoteRefs?: ScopedCitationRef[];
  isStatic?: boolean;
}

export function StreamdownRender({
  message,
  sources,
  scopedQuoteRefs,
}: StreamdownRenderProps) {
  
  const processedMessage = React.useMemo(() => {
    const res = convertCitationsToElements(message, sources, scopedQuoteRefs);
    // console.log("Processed message with citations:", res);
    // console.log("Sources used for processing:", message);
    return res;
  }, [message, scopedQuoteRefs, sources]);

  const scopedRefMap = React.useMemo(
    () => createScopedCitationRefMap(scopedQuoteRefs),
    [scopedQuoteRefs],
  );

  // Memoize CitationComponent with sources to avoid stale closures
  const CitationComponent = React.useCallback(
    (props: { [key: string]: string }) => {
      const number = props["data-number"];
      const paperId = props["data-id"];
      const source = Array.isArray(sources)
        ? sources.find((src) => src.paperId === paperId)
        : undefined;

      return <Citation number={number} paperId={paperId} source={source} />;
    },
    [sources],
  );

  const ScopedCitationComponent = React.useCallback(
    (props: { [key: string]: string }) => {
      const number = props["data-number"] ?? "";
      const paperId = props["data-id"] ?? "";
      const chunkId = props["data-chunk-id"] ?? "";
      const marker = props["data-marker"] ?? "";

      const source = Array.isArray(sources)
        ? sources.find((src) => src.paperId === paperId)
        : undefined;

      const charStart = props["data-char-start"];
      const charEnd = props["data-char-end"];

      const scopedKey =
        props["data-key"] ||
        getScopedCitationKey({
          paperId,
          chunkId,
          charStart: charStart ? Number(charStart) : null,
          charEnd: charEnd ? Number(charEnd) : null,
        });

      const scopedRef = getScopedCitationRef(scopedRefMap, scopedKey, marker);

      const fallbackScopedRef = {
        paperId,
        chunkId,
        marker,
        section: props["data-section"] || null,
        quote: props["data-quote"] || null,
        charStart: charStart ? Number(charStart) : null,
        charEnd: charEnd ? Number(charEnd) : null,
      };

      return (
        <Citation
          number={number}
          paperId={paperId}
          source={source}
          variant="scoped"
          scopedRef={scopedRef ?? fallbackScopedRef}
        />
      );
    },
    [scopedRefMap, sources],
  );

  const CitationGroupComponent = React.useCallback(
    (props: { [key: string]: string }) => {
      const ids = (props["data-ids"] ?? "").split(",").filter(Boolean);
      const numbers = (props["data-numbers"] ?? "")
        .split(",")
        .filter(Boolean);

      const citations = ids.map((paperId, index) => ({
        paperId,
        number: numbers[index] ?? String(index + 1),
        source: Array.isArray(sources)
          ? sources.find((src) => src.paperId === paperId)
          : undefined,
      }));

      return <CitationGroup citations={citations} />;
    },
    [sources],
  );

  const MissingCitationComponent = React.useCallback(() => {
    console.warn(
      "Rendering MissingCitation component for a citation without a valid source",
    );
    return <MissingCitation />;
  }, []);

  return (
    <div className="markdown-content min-w-0 w-full">
      <Streamdown
        mode={"streaming"}
        allowedTags={{
          citation: ["data*"],
          "scoped-citation": ["data*"],
          "citation-group": ["data*"],
          missing: ["data*"],
        }}
        components={{
          citation: CitationComponent as React.ElementType,
          "scoped-citation": ScopedCitationComponent as React.ElementType,
          "citation-group": CitationGroupComponent as React.ElementType,
          missing: MissingCitationComponent,

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          table: (props: any) => (
            <div className="w-full overflow-x-auto my-4 scrollbar-thin scrollbar-thumb-border/50">
              <table className="w-full min-w-[600px] m-0 text-sm" {...props} />
            </div>
          ),
        }}
      >
        {processedMessage}
      </Streamdown>
    </div>
  );
}
