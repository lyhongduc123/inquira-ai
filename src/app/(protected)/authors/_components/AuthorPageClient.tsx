"use client";

import { useEffect, useRef } from "react";
import { notFound, useParams } from "next/navigation";
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
import { PublicationTimeline } from "./PublicationTimelineCard";
import { CoAuthorsTabs } from "./CoAuthorsTabs";
import { AuthorInfoSection } from "./AuthorInfoSection";
import { useAuthorDetails } from "../hooks";
import { CitationChartCard } from "./CitationChartCard";
import { toast } from "sonner";

export function AuthorPageClient() {
  const params = useParams();
  const authorId = params.id as string;
  const {
    data: author,
    isLoading,
    isSuccess,
    error,
  } = useAuthorDetails(authorId);
  const previousStatusRef = useRef<string | null>(null);
  const lastNotifiedTerminalKeyRef = useRef<string | null>(null);

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

  if (error) {
    throw error;
  }

  if (!author && isSuccess) {
    notFound();
  }

  return (
    <Box className="bg-linear-to-br from-background via-background overflow-auto">
      <HStack className="gap-6 max-w-7xl mx-auto p-8 items-start min-w-0">
        <VStack className="gap-6 w-full flex-1 overflow-hidden">
          {/* Header Section */}
          <AuthorInfoSection
            author={author || undefined}
            isLoading={isLoading}
          />
          {/* Main Content Tabs */}
          <Tabs defaultValue="papers" className="w-full">
            <TabsList variant="line">
              <TabsTrigger value="papers">
                <BookOpen className="h-4 w-4 mr-2" />
                Publications ({author?.totalPapers || 0})
              </TabsTrigger>
              {/* <TabsTrigger value="citing">
                <TrendingUp className="h-4 w-4 mr-2" />
                Citing Authors
              </TabsTrigger>
              <TabsTrigger value="referenced">
                <Award className="h-4 w-4 mr-2" />
                Referenced Authors
              </TabsTrigger> */}
              <TabsTrigger value="collaborations">
                <Users className="h-4 w-4 mr-2" />
                Collaborations ({author?.coAuthors.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="papers" className="mt-6">
              <VStack className="gap-6">
                <PapersTabs
                  papers={author?.papers}
                  currentAuthorName={author?.displayName || author?.name}
                  isLoading={isLoading}
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

        {/* Right Sidebar - Metrics Cards */}
        <VStack className="gap-6 w-96 top-6">
          <AuthorMetricsSection author={author || undefined} />
          {author?.quartileBreakdown && (
            <QuartileChart quartileBreakdown={author.quartileBreakdown} />
          )}
          {author?.countsByYear && author.countsByYear.length > 0 && (
            <CitationChartCard countsByYear={author.countsByYear} />
          )}
          {author?.papersByYear && (
            <PublicationTimeline papersByYear={author.papersByYear} />
          )}
        </VStack>
      </HStack>
    </Box>
  );
}
