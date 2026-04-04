"use client";

import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import {
  usePaperDetail,
  usePaperCitations,
  usePaperReferences,
} from "../hooks";

import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Box } from "@/components/layout/box";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSidebar } from "@/components/ui/sidebar";

import {
  PaperMetadataSection,
  PaperActionBar,
  PaperAbstractSection,
  PaperCitationsView,
  PaperReferenceView,
  PaperChatInput,
} from "@/app/(protected)/papers/_components";

import { PaperAbstractSectionSkeleton } from "../_components/PaperAbstractSection";
import { PaperActionBarSkeleton } from "../_components/PaperActionBar";
import { PaperMetadataSectionSkeleton } from "../_components/PaperMetadataSection";
import { saveChatLaunchPayload } from "@/lib/scoped-chat-selection";
import { PaperMetadata } from "@/types/paper.type";


export function PaperPageClient() {
  const params = useParams();
  const paperId = params.id as string;
  const { toggleSidebar } = useSidebar();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("abstract");

  const { data: paper, isLoading, isError, error } = usePaperDetail(paperId);

  const { data: citationsData, isLoading: citationsLoading } =
    usePaperCitations(paperId, activeTab === "citations");

  const { data: referencesData, isLoading: referencesLoading } =
    usePaperReferences(paperId, activeTab === "references");

  const citations = citationsData?.data || [];
  const references = referencesData?.data || [];

  console.log("PaperDetailsPageContent rendered with paper:", paper);
  console.log("Citations:", citations);
  console.log("References:", references);

  const handleFulltext = () => {
    if (paper?.pdfUrl) {
      window.open(paper.pdfUrl, "_blank");
    }
  };

  const handlePeek = () => {
    toggleSidebar();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleSendMessage = (msg: string) => {
    if (!paper) return;

    const scopedPaper = mapPaperDetailToMetadata(paper);
    const launchId = saveChatLaunchPayload({
      query: msg,
      scopedPapers: [scopedPaper],
      source: "paper-detail",
    });

    if (!launchId) return;
    const target = `/?launch=${encodeURIComponent(launchId)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const handleAddToChat = () => {
    if (!paper) return;

    const scopedPaper = mapPaperDetailToMetadata(paper);
    const launchId = saveChatLaunchPayload({
      query: "",
      scopedPapers: [scopedPaper],
      source: "paper-detail",
    });

    if (!launchId) return;
    const target = `/?launch=${encodeURIComponent(launchId)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  if (isError) {
    throw error;
  }

  if (!paper && !isLoading) {
    notFound();
  }

  return (
    <HStack className="h-full w-full relative">
      <Box className="h-full w-full">
        <ScrollArea className="h-full w-full">
          <VStack className="p-4 sm:p-6 lg:p-8">
            <Box className="max-w-3xl w-full mx-auto space-y-6">
              {isLoading ? (
                <>
                  <PaperMetadataSectionSkeleton />
                  <PaperActionBarSkeleton />
                  <Separator />
                  <PaperAbstractSectionSkeleton />
                </>
              ) : paper ? (
                <>
                  <PaperMetadataSection paper={paper} />
                  <PaperActionBar
                    paper={paper}
                    isBookmarked={isBookmarked}
                    onFulltext={handleFulltext}
                    onPeek={handlePeek}
                    onBookmark={handleBookmark}
                    onAddToChat={handleAddToChat}
                  />

                  <Separator />
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList variant="line">
                      <TabsTrigger value="abstract">Abstract</TabsTrigger>
                      <TabsTrigger value="citations">
                        Citations ({paper.citationCount || 0})
                      </TabsTrigger>
                      <TabsTrigger value="references">
                        References ({paper.referenceCount || 0})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="abstract" className="mt-4">
                      <PaperAbstractSection abstract={paper.abstract} />
                    </TabsContent>
                    <TabsContent value="citations" className="mt-4">
                      <PaperCitationsView
                        paper={paper}
                        citations={citations}
                        isLoading={citationsLoading}
                      />
                    </TabsContent>
                    <TabsContent value="references" className="mt-4">
                      <PaperReferenceView
                        references={references}
                        isLoading={referencesLoading}
                      />
                    </TabsContent>
                  </Tabs>
                </>
              ) : null}
            </Box>
            <Box className="h-32" />
          </VStack>
        </ScrollArea>

        <Box className="absolute bottom-0 left-0 right-0 p-4">
          <Box className="max-w-3xl mx-auto">
            <PaperChatInput
              paperTitle={paper?.title || ""}
              onSend={handleSendMessage}
              isDisabled={!paper}
            />
          </Box>
        </Box>
      </Box>
    </HStack>
  );
}

function mapPaperDetailToMetadata(paper: {
  paperId: string;
  title: string;
  abstract: string;
  authors: PaperMetadata["authors"];
  publicationDate?: string | null;
  venue?: string | null;
  url?: string | null;
  pdfUrl?: string | null;
  journal?: PaperMetadata["journal"];
  citationCount: number;
  influentialCitationCount?: number;
  citationStyles?: Record<string, string> | null;
  referenceCount?: number;
  isOpenAccess: boolean;
  isRetracted: boolean;
  topics?: Array<Record<string, unknown>> | null;
  keywords?: Array<Record<string, unknown>> | null;
}): PaperMetadata {
  return {
    paperId: paper.paperId,
    title: paper.title,
    abstract: paper.abstract,
    authors: paper.authors,
    year: paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : null,
    publicationDate: paper.publicationDate,
    venue: paper.venue,
    url: paper.url,
    pdfUrl: paper.pdfUrl,
    journal: paper.journal ?? null,
    citationCount: paper.citationCount,
    influentialCitationCount: paper.influentialCitationCount,
    citationStyles: paper.citationStyles ?? null,
    referenceCount: paper.referenceCount,
    isOpenAccess: paper.isOpenAccess,
    isRetracted: paper.isRetracted,
    topics: paper.topics ?? null,
    keywords: paper.keywords ?? null,
  };
}

