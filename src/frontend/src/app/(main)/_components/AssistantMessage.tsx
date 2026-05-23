"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ChevronRight,
  ClipboardIcon,
  ClipboardPasteIcon,
} from "lucide-react";
import type { PaperMetadata } from "@/types/paper.type";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";
import { AssistantMessageBody } from "./AssistantMessageBody";
import { Box } from "@/components/layout/box";
import { VStack } from "@/components/layout/vstack";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { getCitedPapers } from "@/lib/citation/core";
import { getFormattedCitedContent } from "@/lib/citation/render-apa"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PaperCard } from "./PaperCard";
import { CITED_ONLY_STORAGE_KEY } from "@/core";
import { HStack } from "@/components/layout/hstack";
import ExportButton from "./_shared/ExportButton";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useScopedPaperSelection } from "@/hooks/use-scoped-paper-selection";
import { cn } from "@/lib/utils/cn";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OpacityShimmer } from "@/components/ui/opacity-shimmer";
import { copyTextWithEvent } from "@/lib/utils/clipboard";

interface AssistantMessageProps {
  text: string;
  sources?: PaperMetadata[];
  scopedQuoteRefs?: ScopedCitationRef[];
  showDivider?: boolean;
  isVisible?: boolean;
  isDone?: boolean;
  isError?: boolean;
  isReading?: boolean;
}

export function AssistantMessage({
  text,
  sources,
  scopedQuoteRefs,
  showDivider = false,
  isDone = false,
  isError = false,
  isReading = false,
}: AssistantMessageProps) {
  const readingStatusText = useShuffleText();
  const { openPaper, closeSidebar, content, contentType } = useDetailSidebar();
  const { selectedScopedPaperIds, toggleScopedPaper } =
    useScopedPaperSelection();

  const handleOpenPaper = (paper: PaperMetadata) => {
    const isSamePaperOpen =
      !!content && contentType === "paper" && content.paperId === paper.paperId;

    if (isSamePaperOpen) {
      closeSidebar();
      return;
    }

    openPaper(paper);
  };

  return (
    <Box className="min-w-0">
      {isReading && !text ? (
        <VStack className="space-y-2 animate-pulse pr-12 pb-4">
          <Box className="h-4 bg-accent rounded-sm w-full" />
          <Box className="h-4 bg-accent rounded-sm w-[90%]" />
          <Box className="h-4 bg-accent rounded-sm w-[40%]" />
          <OpacityShimmer className="mt-2 text-xs text-muted-foreground italic">
            {`${readingStatusText}...`}
          </OpacityShimmer>
        </VStack>
      ) : (
        <AssistantMessageBody
          text={text}
          sources={sources}
          scopedQuoteRefs={scopedQuoteRefs}
          isDone={isDone}
        />
      )}

      {isError && (
        <Box className="mt-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Something wrong happened, please try again
            </AlertDescription>
          </Alert>
        </Box>
      )}

      {Array.isArray(sources) && sources.length > 0 && (
        <HStack className="w-full mt-4">
          <MessageBottomBar
            text={text}
            sources={sources}
            selectedPaperIds={selectedScopedPaperIds}
            onTogglePaperSelection={(paper) => {
              if (paper.paperId) {
                toggleScopedPaper(paper.paperId);
              }
            }}
            onViewPaper={handleOpenPaper}
            viewingPaperId={
              contentType === "paper" && content ? content.paperId : undefined
            }
          />
        </HStack>
      )}

      {showDivider && <Separator className="my-8" />}
    </Box>
  );
}

const SHUFFLE_WORDS = [
  "Reading papers",
  "Reviewing evidence",
  "Linking findings",
  "Synthesizing answer",
  "Drafting response",
  "Checking citations",
];

function useShuffleText(interval = 5500) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % SHUFFLE_WORDS.length);
    }, interval);

    return () => clearInterval(id);
  }, [interval]);

  return SHUFFLE_WORDS[index];
}

interface ExportDropdownProps {
  text: string;
  papers: PaperMetadata[];
  cited_papers: PaperMetadata[];
}

const ExportDropdown = ({
  text,
  cited_papers,
  papers,
}: ExportDropdownProps) => {
  const handleCopyText = () => {
    const formattedText = getFormattedCitedContent(text, cited_papers);
    try {
      copyTextWithEvent(formattedText);
      toast.success("Copied to clipboard!", {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Failed to copy to clipboard!");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <ClipboardIcon className="size-4" />
          <ChevronRight className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right">
        <DropdownMenuItem
          onClick={handleCopyText}
          className="dark:focus:bg-accent/10 focus:bg-primary/10"
        >
          <ClipboardPasteIcon className="size-4" />
          Copy text
        </DropdownMenuItem>

        <ExportButton asChild variant={"ghost"} sources={papers}>
          <DropdownMenuItem className="dark:focus:bg-accent/10 focus:bg-primary/10">
            <ClipboardPasteIcon className="size-4" />
            Export to CSV
          </DropdownMenuItem>
        </ExportButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface MessageBottomBarProps {
  text: string;
  sources: PaperMetadata[];
  selectedPaperIds?: string[];
  onTogglePaperSelection?: (paper: PaperMetadata) => void;
  onViewPaper: (paper: PaperMetadata) => void;
  viewingPaperId?: string;
}

function MessageBottomBar({
  text,
  sources,
  selectedPaperIds = [],
  onTogglePaperSelection,
  onViewPaper,
  viewingPaperId,
}: MessageBottomBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCitedOnly, setShowCitedOnly] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(CITED_ONLY_STORAGE_KEY) === "1";
  });

  const onShortcut = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "h" && e.altKey) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onShortcut(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleCitedOnly = () => {
    setShowCitedOnly((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CITED_ONLY_STORAGE_KEY, next ? "1" : "0");
      }
      return next;
    });
  };

  const citedPaperIds = useMemo(() => {
    const citedPapers = getCitedPapers(text, sources);
    return new Set(citedPapers.map((paper) => paper.paperId));
  }, [sources, text]);

  const indexedSources = useMemo(
    () => sources.map((source, idx) => ({ source, idx })),
    [sources],
  );

  const citedSources = useMemo(() => {
    return indexedSources.filter(({ source }) =>
      citedPaperIds.has(source.paperId),
    );
  }, [citedPaperIds, indexedSources]);

  const visibleSources = useMemo(() => {
    if (!showCitedOnly) {
      return indexedSources;
    }

    return citedSources;
  }, [citedSources, indexedSources, showCitedOnly]);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible w-full min-w-0 mt-4"
    >
      <HStack className="items-center justify-between gap-2">
        <HStack className="items-center gap-2 ">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="group w-fit cursor-pointer justify-between"
              aria-label="Toggle result list"
            >
              Results
              <ChevronRightIcon className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-90" />
            </Button>
          </CollapsibleTrigger>
          <ExportDropdown
            text={text}
            papers={sources}
            cited_papers={citedSources.map(({ source }) => source)}
          />
        </HStack>
        <HStack className="gap-2 items-center">
          <ToggleGroup
            type="single"
            value={showCitedOnly ? "cited" : "all"}
            onValueChange={(v) => v && toggleCitedOnly()}
            className="inline-flex items-center gap-1 rounded-md bg-muted p-1"
          >
            {["all", "cited"].map((item) => (
              <ToggleGroupItem
                key={item}
                value={item}
                className={cn(
                  "h-8",
                  "data-[spacing=0]:first:rounded-md",
                  "data-[spacing=0]:last:rounded-md",
                  "hover:bg-primary/10",
                  "hover:ring-1",
                  "hover:ring-primary",
                  "data-[state=on]:shadow-lg",
                  "dark:data-[state=on]:bg-primary",
                  "dark:data-[state=on]:text-primary-foreground",
                  "dark:text-white",
                  "dark:hover:text-primary-foreground",
                )}
              >
                {item === "all" ? "All" : "Cited"}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </HStack>
      </HStack>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down duration-500">
        <VStack className="mt-2 space-y-2 min-w-0">
          {visibleSources.map(({ source, idx }) => (
            <PaperCard
              key={source.paperId || idx}
              idx={idx}
              paperMetadata={source}
              isViewing={
                Boolean(viewingPaperId) && viewingPaperId === source.paperId
              }
              isSelected={selectedPaperIds.includes(source.paperId)}
              onSelect={() => onTogglePaperSelection?.(source)}
              onView={onViewPaper}
            />
          ))}
        </VStack>
      </CollapsibleContent>
    </Collapsible>
  );
}
