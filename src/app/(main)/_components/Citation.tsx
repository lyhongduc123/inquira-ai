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
import { useScopedPaperSelection } from "@/hooks/use-scoped-paper-selection";
import { cn } from "@/lib/utils";
import { BookOpenIcon } from "lucide-react";
import { Stack } from "@/components/layout/stack";
import { TypographyP } from "@/components/global/typography";

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
  const { selectedScopedPaperIds, toggleScopedPaper } =
    useScopedPaperSelection();

  if (!source) {
    return <span>[{number}]</span>;
  }

  const isScopedSelected = selectedScopedPaperIds.includes(source.paperId);

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
            isScopedSelected={isScopedSelected}
            onToggleScopedPaper={() => {
              if (source.paperId) {
                toggleScopedPaper(source.paperId);
              }
            }}
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

interface CitationGroupItem {
  number: string;
  paperId: string;
  source?: PaperMetadata;
}

interface CitationGroupProps {
  citations: CitationGroupItem[];
}

export function CitationGroup({ citations }: CitationGroupProps) {
  const validCitations = citations.filter(
    (citation) => citation.source?.paperId,
  );
  const preview = validCitations.slice(0, 2);
  const hiddenCount = Math.max(validCitations.length - preview.length, 0);

  if (!validCitations.length) {
    return <MissingCitation />;
  }

  if (validCitations.length === 1) {
    const citation = validCitations[0];
    return (
      <Citation
        number={citation.number}
        paperId={citation.paperId}
        source={citation.source}
      />
    );
  }

  return (
    <HoverCard>
      {preview.map((citation) => (
        <Citation
          key={citation.paperId}
          number={citation.number}
          paperId={citation.paperId}
          source={citation.source}
        />
      ))}
      <HoverCardTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          className={cn(
            "inline-flex h-6 max-w-full items-center gap-0.5 rounded-md bg-secondary px-1 align-baseline text-sm text-secondary-foreground",
            "mx-0.5 cursor-pointer select-none border border-border/60 transition-colors hover:bg-secondary/80",
          )}
        >
          {hiddenCount > 0 && (
            <span className="px-1 font-medium text-muted-foreground">
              + {hiddenCount} more
            </span>
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent sideOffset={8} className="w-96 p-0">
        <TypographyP className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
          {validCitations.length} cited sources
        </TypographyP>
        <Stack className="max-h-96 overflow-y-auto gap-2 p-2">
          {validCitations.map((citation) => (
            <CitationGroupRow
              key={`${citation.paperId}-${citation.number}`}
              citation={citation}
            />
          ))}
        </Stack>
      </HoverCardContent>
    </HoverCard>
  );
}

function CitationGroupRow({ citation }: { citation: CitationGroupItem }) {
  const { openPaper } = useDetailSidebar();
  const { activePaperId, setActiveCitation } = useCitationSelectionStore();
  const source = citation.source;

  if (!source) return null;

  const authors = source.authors ?? [];
  const firstAuthor = authors[0]?.name;
  const isSelected = activePaperId === source.paperId;

  const handleClick = () => {
    setActiveCitation(source.paperId, null);
    openPaper(source);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full gap-2 rounded-md p-2 text-left transition-colors hover:bg-muted",
        isSelected && "bg-primary/10",
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded bg-secondary text-secondary-foreground px-1 text-xs font-medium",
          isSelected && "bg-primary text-primary-foreground",
        )}
      >
        {citation.number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-medium">{source.title}</span>
        <span className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <span>{source.year ?? "n.d."}</span>
          {firstAuthor && (
            <>
              <span>•</span>
              <span className="truncate">
                {firstAuthor}
                {authors.length > 1 ? ", et al." : ""}
              </span>
            </>
          )}
        </span>
        {source.venue && (
          <span className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <BookOpenIcon className="size-3 shrink-0" />
            <span className="truncate">{source.venue}</span>
          </span>
        )}
      </span>
    </button>
  );
}
