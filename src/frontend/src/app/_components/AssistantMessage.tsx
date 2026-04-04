"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronUp, ClipboardIcon, ClipboardPasteIcon, RefreshCw } from "lucide-react";
import type { PaperMetadata } from "@/types/paper.type";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";
import { AssistantMessageBody } from "./AssistantMessageBody";
import { Box } from "@/components/layout/box";
import { getCitedPapers } from "@/lib/citation-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VStack } from "@/components/layout/vstack";
import { PaperCard } from "./PaperCard";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,  DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AssistantMessageProps {
  text: string;
  sources?: PaperMetadata[];
  scopedQuoteRefs?: ScopedCitationRef[];
  showDivider?: boolean;
  isVisible?: boolean;
  isDone?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isAnalyzing?: boolean;
  selectedPaperIds?: string[];
  onTogglePaperSelection?: (paper: PaperMetadata) => void;
}

export function AssistantMessage({
  text,
  sources,
  scopedQuoteRefs,
  showDivider = false,
  isDone = false,
  isError = false,
  onRetry,
  isAnalyzing = false,
  selectedPaperIds = [],
  onTogglePaperSelection,
}: AssistantMessageProps) {
  const citedPapers = getCitedPapers(text, sources);
  const { openPaper, closeSidebar, content, contentType } = useDetailSidebar();
  const [tabsValue, setTabsValue] = useState<string | null>(null);

  const handleOpenPaper = (paper: PaperMetadata) => {
    const isSamePaperOpen =
      !!content && contentType === "paper" && content.paperId === paper.paperId;

    if (isSamePaperOpen) {
      closeSidebar();
      return;
    }

    openPaper(paper);
  };

  const handleTabChange = (value: string) => {
    setTabsValue((prev) => (prev === value ? null : value));
  };
  return (
    <Box className="min-w-0">
      {isAnalyzing && !text ? (
        <VStack className="space-y-2 animate-pulse pr-12 pb-4">
          <Box className="h-4 bg-muted rounded-sm w-full" />
          <Box className="h-4 bg-muted rounded-sm w-[90%]" />
          <Box className="h-4 bg-muted rounded-sm w-[40%]" />
          <Box className="mt-2 text-xs text-muted-foreground italic">Analyzing research papers...</Box>
        </VStack>
      ) : (
        <AssistantMessageBody
          text={text}
          sources={sources}
          scopedQuoteRefs={scopedQuoteRefs}
          isDone={isDone}
        />
      )}

      {isError && onRetry && (
        <Box className="mt-4">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </Box>
      )}

      {sources && sources.length > 0 && (
        <Tabs defaultValue="results" className="w-full mt-4">
          {/* <HStack> */}
          <TabsList variant={"line"}>
            <TabsTrigger
              value="results"
              onClick={() => handleTabChange("results")}
            >
              Results
              {tabsValue === "results" ? (
                <ChevronDown className="ml-1 h-3 w-3" />
              ) : <ChevronUp className="ml-1 h-3 w-3" />}
            </TabsTrigger>
            <TabsTrigger
              value="references"
              onClick={() => handleTabChange("references")}
            >
              References
              {tabsValue === "references" ? (
                <ChevronDown className="ml-1 h-3 w-3" />
              ) : (
                <ChevronUp className="ml-1 h-3 w-3" />
              )}
            </TabsTrigger>
            <ExportDropdown />
          </TabsList>
          
          <AnimatePresence mode="wait">
            {tabsValue === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="results" className="">
                  {Array.isArray(sources) && sources.length > 0 && (
                    <VStack className="mt-2 space-y-2 min-w-0">
                      {sources.map((source, j) => (
                        <PaperCard
                          key={source.paperId || j}
                          idx={j}
                          paperMetadata={source}
                          isViewing={
                            !!content &&
                            contentType === "paper" &&
                            content.paperId === source.paperId
                          }
                          isSelected={selectedPaperIds.includes(source.paperId)}
                          onSelect={() => onTogglePaperSelection?.(source)}
                          onView={handleOpenPaper}
                        />
                      ))}
                    </VStack>
                  )}
                </TabsContent>
              </motion.div>
            )}
            {tabsValue === "references" && (
              <motion.div
                key="references"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="references">
                  {citedPapers.length > 0 ? (
                    <VStack className="mt-2 space-y-2 min-w-0">
                      {citedPapers.map((source, j) => (
                        <PaperCard
                          key={source.paperId || j}
                          idx={j}
                          paperMetadata={source}
                          isViewing={
                            !!content &&
                            contentType === "paper" &&
                            content.paperId === source.paperId
                          }
                          isSelected={selectedPaperIds.includes(source.paperId)}
                          onSelect={() => onTogglePaperSelection?.(source)}
                          onView={handleOpenPaper}
                        />
                      ))}
                    </VStack>
                  ) : null}
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      )}

      {showDivider && <Separator className="my-8" />}
    </Box>
  );
}


const ExportDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <ClipboardIcon className="size-4" />
          <ChevronRight className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right">
        <DropdownMenuItem>
          <ClipboardPasteIcon className="size-4" />
          Copy text
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ClipboardPasteIcon className="size-4" />
          Copy with citations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}