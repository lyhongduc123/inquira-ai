"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Box } from "@/components/layout/box";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { TypographyP } from "@/components/global/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users } from "lucide-react";
import { AuthorMetricsSection } from "./AuthorMetricsSection";
import { PapersTabs } from "./PaperTabs";
import { QuartileChart } from "./QuartileChart";
import { PublicationChartCard } from "./PublicationTimelineCard";
import { CoAuthorsTabs } from "./CoAuthorsTabs";
import { AuthorInfoSection } from "./AuthorInfoSection";
import { useAuthorDetails, useAuthorPapers } from "../hooks";
import { CitationChartCard } from "./CitationChartCard";
import { toast } from "sonner";
import type { PaperMetadata } from "@/types/paper.type";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  PaperDetailContent,
  PaperDetailFooter,
} from "@/app/(main)/_components/PaperDetailContent";

export function AuthorPageClient() {
  const params = useParams();
  const authorId = params.id as string;
  const queryClient = useQueryClient();
  const [paperSortBy, setPaperSortBy] = useState<"year" | "citation">("year");
  const [paperSortOrder, setPaperSortOrder] = useState<"asc" | "desc">("desc");
  const {
    data: author,
    isLoading,
    isSuccess,
    error,
  } = useAuthorDetails(authorId);
  const previousStatusRef = useRef<string | null>(null);
  const lastNotifiedTerminalKeyRef = useRef<string | null>(null);

  const [currentOffset, setCurrentOffset] = useState(0);
  const [selectedPaper, setSelectedPaper] = useState<{
    paper: PaperMetadata;
  } | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: currentPageResponse, isLoading: isCurrentPageLoading } =
    useAuthorPapers(
      authorId,
      currentOffset,
      20,
      true,
      paperSortBy,
      paperSortOrder === "desc",
    );

  useEffect(() => {
    const currentStatus = author?.enrichmentStatus?.status ?? null;
    const previousStatus = previousStatusRef.current;
    const taskId = author?.enrichmentStatus?.taskId ?? "default";
    const terminalKey = `${authorId}:${taskId}:${currentStatus}`;

    const transitionedFromEnrichingToCompleted =
      previousStatus === "enriching" && currentStatus === "completed";
    const transitionedFromEnrichingToFailed =
      previousStatus === "enriching" && currentStatus === "failed";

    if (
      transitionedFromEnrichingToCompleted &&
      lastNotifiedTerminalKeyRef.current !== terminalKey
    ) {
      toast.success("Author enrichment completed", {
        id: `author-enrichment-${authorId}`,
        description: "Latest author data has been loaded.",
      });
      lastNotifiedTerminalKeyRef.current = terminalKey;
    }

    if (
      transitionedFromEnrichingToFailed &&
      lastNotifiedTerminalKeyRef.current !== terminalKey
    ) {
      toast.error("Author enrichment failed", {
        id: `author-enrichment-${authorId}`,
        description:
          author?.enrichmentStatus?.message || "Please try refreshing again.",
      });
      lastNotifiedTerminalKeyRef.current = terminalKey;
    }

    previousStatusRef.current = currentStatus;
  }, [
    authorId,
    author?.enrichmentStatus?.message,
    author?.enrichmentStatus?.status,
    author?.enrichmentStatus?.taskId,
  ]);

  const handleOnPaperView = (paper: PaperMetadata) => {
    setSelectedPaper({ paper });
    setIsSheetOpen(true);
  };

  const handleLoadMorePapers = () => {
    setCurrentOffset((prev) => prev + 20);
  };

  const handleSortByChange = (value: "year" | "citation") => {
    setCurrentOffset(0);
    setPaperSortBy(value);
  };

  const handleSortOrderChange = (value: "asc" | "desc") => {
    setCurrentOffset(0);
    setPaperSortOrder(value);
  };

  const allPapers = useMemo(() => {
    const loadedOffsets = Array.from(
      { length: Math.floor(currentOffset / 20) + 1 },
      (_, index) => index * 20,
    );
    const merged: PaperMetadata[] = [];
    const seen = new Set<string>();

    for (const offset of loadedOffsets) {
      const pageResponse =
        offset === currentOffset
          ? currentPageResponse
          : queryClient.getQueryData<{ items?: PaperMetadata[] }>([
              "author",
              authorId,
              "papers",
              offset,
              20,
              paperSortBy,
              paperSortOrder === "desc",
            ]);

      for (const paper of pageResponse?.items ?? []) {
        if (seen.has(paper.paperId)) {
          continue;
        }
        seen.add(paper.paperId);
        merged.push(paper);
      }
    }

    return merged;
  }, [
    authorId,
    currentOffset,
    currentPageResponse,
    paperSortBy,
    paperSortOrder,
    queryClient,
  ]);

  const totalPapersInDb = currentPageResponse?.total ?? 0;
  const isLoadingMore = isCurrentPageLoading && currentOffset > 0;
  const isFirstPageLoading = isCurrentPageLoading && currentOffset === 0;

  if (error) {
    throw error;
  }

  if (!author && isSuccess) {
    notFound();
  }

  return (
    <Box className="bg-linear-to-br from-background via-background overflow-auto">
      <HStack className="flex-col lg:flex-row gap-6 max-w-7xl mx-auto p-8 items-start min-w-0">
        <VStack className="gap-6 w-full flex-1 min-w-0 lg:min-w-[600px] overflow-x-auto">
          <AuthorInfoSection
            author={author || undefined}
            isLoading={isLoading}
          />

          <Tabs defaultValue="papers" className="w-full">
            <TabsList variant="line">
              <TabsTrigger value="papers">
                <BookOpen className="h-4 w-4 mr-2" />
                Publications ({totalPapersInDb})
              </TabsTrigger>
              <TabsTrigger value="collaborations">
                <Users className="h-4 w-4 mr-2" />
                Collaborations ({author?.coAuthors.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="papers" className="mt-6">
              <VStack className="gap-6">
                <PapersTabs
                  papers={allPapers}
                  totalPapers={totalPapersInDb}
                  currentAuthorName={author?.displayName || author?.name}
                  onLoadMore={handleLoadMorePapers}
                  sortBy={paperSortBy}
                  sortOrder={paperSortOrder}
                  onSortByChange={handleSortByChange}
                  onSortOrderChange={handleSortOrderChange}
                  isLoading={isLoading || isFirstPageLoading}
                  isLoadingMore={isLoadingMore}
                  onView={handleOnPaperView}
                />
              </VStack>
            </TabsContent>

            <TabsContent value="citing" className="mt-6">
              <Card className="border-2">
                <CardContent className="py-12 text-center">
                  <TypographyP variant="muted">
                    List of authors who have cited this author.
                  </TypographyP>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referenced" className="mt-6">
              <Card className="border-2">
                <CardContent className="py-12 text-center">
                  <TypographyP variant="muted">
                    List of authors cited by this author.
                  </TypographyP>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collaborations" className="mt-6">
              <CoAuthorsTabs
                coAuthors={author?.coAuthors}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </VStack>

        <VStack className="gap-6 w-full max-w-96 shrink top-6">
          <AuthorMetricsSection author={author || undefined} />
          {author?.quartileBreakdown && (
            <QuartileChart quartileBreakdown={author.quartileBreakdown} />
          )}
          {author?.countsByYear && (
            <>
              <CitationChartCard
                countsByYear={author.countsByYear}
                openalexCountsByYear={author.openalexCountsByYear ?? undefined}
              />
              <PublicationChartCard
                countsByYear={author.countsByYear}
                openalexCountsByYear={author.openalexCountsByYear ?? undefined}
              />{" "}
            </>
          )}
        </VStack>
      </HStack>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col">
          {selectedPaper?.paper && (
            <>
              {/* Header */}
              <SheetHeader className="border-b px-4 py-3 bg-background">
                <SheetTitle>Paper</SheetTitle>
              </SheetHeader>
              <Box className="h-full p-4 overflow-auto">
                <PaperDetailContent paper={selectedPaper.paper} />
              </Box>
              {/* Footer - Reuse PaperDetailFooter */}
              <Box className="border-t p-4 bg-background">
                <PaperDetailFooter paperMetadata={selectedPaper.paper} />
              </Box>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Box>
  );
}
