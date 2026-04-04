"use client";

import type { PaperMetadata } from "@/types/paper.type";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";

import { CitationTrigger } from "./CitationTrigger";
import { CitationCard } from "./CitationCard";
import { ScopedCitationCard } from "./ScopedCitationCard";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useCitationSelectionStore } from "@/store/citation-selection-store";
import { Box } from "@/components/layout/box";

interface CitationProps {
  number: string;
  paperId: string;
  source?: PaperMetadata;
  variant?: "default" | "scoped";
  scopedRef?: ScopedCitationRef;
}

export function Citation({
  number,
  source,
  variant = "default",
  scopedRef,
}: Omit<CitationProps, "paperId"> & { paperId?: string }) {
  const { openPaper, closeSidebar, content, contentType, isOpen } =
    useDetailSidebar();
  const {
    activePaperId,
    activeChunkId,
    setActiveCitation,
    clearActiveCitation,
  } = useCitationSelectionStore();

  if (!source) {
    return <span>[{number}]</span>;
  }

  const clickedChunkId =
    variant === "scoped" ? (scopedRef?.chunkId ?? null) : null;
  const isSameSelectedCitation =
    activePaperId === source.paperId &&
    (activeChunkId ?? null) === (clickedChunkId ?? null);

  const isSelectedByPaper = activePaperId === source.paperId;
  const isScopedChunkSelected =
    variant === "scoped" && !!activeChunkId
      ? (scopedRef?.chunkId ?? null) === activeChunkId
      : true;

  const isSelected = isSelectedByPaper && isScopedChunkSelected;

  const handleClick = () => {
    if (isSameSelectedCitation) {
      clearActiveCitation();

      if (
        isOpen &&
        contentType === "paper" &&
        content?.paperId === source.paperId
      ) {
        closeSidebar();
      }
      return;
    }

    setActiveCitation(source.paperId, clickedChunkId);

    if (
      !(
        isOpen &&
        contentType === "paper" &&
        content?.paperId === source.paperId
      )
    ) {
      openPaper(source);
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger>
        <CitationTrigger
          isSelected={isSelected}
          paperDetail={source}
          number={Number(number)}
          onClick={handleClick}
        />
      </HoverCardTrigger>
      <HoverCardContent sideOffset={8} className="w-80">
        {variant === "scoped" ? (
          <ScopedCitationCard
            isVisible={true}
            idx={Number(number)}
            paperDetail={source}
            scopedRef={scopedRef}
            handleClick={handleClick}
          />
        ) : (
          <CitationCard
            isVisible={true}
            idx={Number(number)}
            paperDetail={source}
            handleClick={handleClick}
          />
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export function MissingCitation() {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <CitationTrigger />
      </HoverCardTrigger>
      <HoverCardContent sideOffset={8} className="w-80">
        <Box className="p-4">
          This info source are missing, this could be a hallucinated info, be
          careful when interpreting the content.
        </Box>
      </HoverCardContent>
    </HoverCard>
  );
}
