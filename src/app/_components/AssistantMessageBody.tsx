"use client";

import { StreamdownRender } from "@/app/_components/StreamdownRender";
import type { PaperMetadata } from "@/types/paper.type";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";

interface AnswerContentProps {
  text: string;
  sources?: PaperMetadata[];
  scopedQuoteRefs?: ScopedCitationRef[];
  isDone?: boolean;
}

export function AssistantMessageBody({
  text,
  sources,
  scopedQuoteRefs,
  isDone = false,
}: AnswerContentProps) {
  return (
    <div className="w-full grid grid-cols-1">
      <div className="prose prose-sm max-w-none dark:prose-invert wrap-break-word">
        <StreamdownRender
          message={text || ""}
          sources={sources}
          scopedQuoteRefs={scopedQuoteRefs}
          isStatic={isDone}
        />
      </div>
    </div>
  );
}
