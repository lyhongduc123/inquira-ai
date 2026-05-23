import { UserIcon, InfoIcon, ArrowUpRight } from "lucide-react";

import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Badge } from "@/components/ui/badge";
import {
  TypographyH1,
  TypographyH3,
  TypographyH4,
  TypographyP,
} from "@/components/global/typography";
import type {
  ConferenceData,
  JournalData,
  PaperDetail,
} from "@/types/paper.type";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Box } from "@/components/layout/box";

interface PaperMetadataSectionProps {
  paper: PaperDetail;
}

export function PaperMetadataSection({ paper }: PaperMetadataSectionProps) {
  const doiLink = paper.externalIds?.doi
    ? `https://doi.org/${paper.externalIds.doi}`
    : null;

  return (
    <VStack className="gap-4">
      {/* Title */}
      <TypographyH1 className="">{paper.title}</TypographyH1>

      {/* Authors */}
      <PaperAuthors paper={paper} />
      <VStack className="gap-4">
        {/* Metadata Row */}
        <HStack className="gap-4 flex-wrap items-center text-sm text-muted-foreground">
          {paper.publicationDate ? (
            <HStack className="gap-1.5 items-center">
              <TypographyP size="sm" variant="muted">
                Published at{" "}
                {formatDate(new Date(paper.publicationDate), "PPP")}
              </TypographyP>
            </HStack>
          ) : (
            <HStack className="gap-1.5 items-center">
              <TypographyP size="sm" variant="muted">
                Published in {paper.year}
              </TypographyP>
            </HStack>
          )}

          {paper.externalIds && (
            <a href={doiLink!} target="_blank" rel="noopener noreferrer">
              <HStack className="gap-1.5 items-center border-b-2 border-muted-foreground">
                <ArrowUpRight className="size-4 text-muted-foreground" />
                DOI
              </HStack>
            </a>
          )}
          <a href={paper.url || "#"} target="_blank" rel="noopener noreferrer">
            <HStack className="gap-1.5 items-center border-b-2 border-muted-foreground">
              <ArrowUpRight className="size-4 text-muted-foreground" />
              Semantic Scholar
            </HStack>
          </a>
        </HStack>

        {/* Badges */}
        <BadgeSection paper={paper} />

        <HStack className="w-full justify-between">
          <HStack className="gap-2 items-center min-w-fit">
            <VStack className="gap-2 items-start">
              <TypographyH3>{paper.citationCount}</TypographyH3>
              <TypographyP size="sm" variant="muted">
                Citations
              </TypographyP>
            </VStack>
            <VStack className="gap-2 items-start">
              <HStack className="gap-1 items-center">
                <TypographyH3>{paper.influentialCitationCount} </TypographyH3>
                <HoverCard>
                  <HoverCardTrigger>
                    <InfoIcon className="size-4 text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <a
                      href={
                        "https://www.semanticscholar.org/faq#influential-citations"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TypographyP className="underline">
                        Influential Citations
                      </TypographyP>
                    </a>
                    <Separator />
                    <TypographyP size="sm" className="text-muted-foreground">
                      Citations that significantly impact the citing paper,
                      determined by using machine learning analyzing citation
                      frequency and context by{" "}
                      <span className="font-semibold text-special">
                        Semantic Scholar.
                      </span>
                    </TypographyP>
                  </HoverCardContent>
                </HoverCard>
              </HStack>
              <TypographyP size="sm" variant="muted">
                Influential Citations
              </TypographyP>
            </VStack>
          </HStack>
          <PaperJournalSection
            journal={paper.journal || undefined}
            venue={paper.venue || undefined}
            conference={paper.conference || undefined}
          />
        </HStack>
      </VStack>
    </VStack>
  );
}

export function PaperMetadataSectionSkeleton() {
  return (
    <VStack className="space-y-3">
      <Skeleton className="h-8 w-3/4" /> {/* title */}
      <Skeleton className="h-4 w-1/2" /> {/* authors */}
      <Skeleton className="h-4 w-1/3" /> {/* venue/year */}
    </VStack>
  );
}

const PaperJournalSection = ({
  journal,
  conference,
  venue,
}: {
  journal?: JournalData;
  conference?: ConferenceData;
  venue?: string;
}) => {
  if (!journal && !venue && !conference) return null;
  if (journal) {
    return (
      <VStack className="gap-2 items-start max-w-[60%]">
        <HStack className="gap-2 items-center">
          <TypographyH3>{journal?.title || venue}</TypographyH3>
          <HoverCard>
            <HoverCardTrigger>
              <InfoIcon className="size-4 text-muted-foreground" />
            </HoverCardTrigger>
            <HoverCardContent>
              <VStack className="gap-1">
                <VStack className="gap-1">
                  <TypographyH4>{journal?.title || venue}</TypographyH4>

                  {journal?.publisher && (
                    <TypographyP size="sm" variant="muted">
                      {journal.publisher}
                    </TypographyP>
                  )}

                  <TypographyP size="sm" variant="muted">
                    SJR {journal?.sjrScore || "N/A"} · H-index{" "}
                    {journal?.hIndex || "N/A"}
                  </TypographyP>

                  <JournalRankBar quartile={journal?.sjrBestQuartile} />
                </VStack>
                <Separator />
                <TypographyP size="sm" className="text-muted-foreground">
                  SJR (SCImago Journal Rank) is a measure of journal impact and
                  prestige. SJR Score are divied into quartiles (Q1-Q4) with Q1
                  being the highest. The H-index measures both the productivity
                  and citation impact of the publications of a journal.
                </TypographyP>
              </VStack>
            </HoverCardContent>
          </HoverCard>
        </HStack>
        <HStack className="gap-2 items-center">
          {journal?.sjrBestQuartile ? (
            <>
              <TypographyP size="sm" variant="muted">
                SJR Quartile:
              </TypographyP>
              <JournalBadge quartile={journal?.sjrBestQuartile} />
            </>
          ) : (
            <TypographyP size="sm" variant="muted">
              No journal data available
            </TypographyP>
          )}
        </HStack>
      </VStack>
    );
  }

  if (conference) {
    return (
      <VStack className="gap-2 items-start">
        <HStack className="gap-2 items-center">
          <TypographyH3>{conference?.acronym || venue}</TypographyH3>
          <HoverCard>
            <HoverCardTrigger>
              <InfoIcon className="size-4 text-muted-foreground" />
            </HoverCardTrigger>
            <HoverCardContent>
              <VStack className="gap-1">
                <VStack className="gap-1">
                  <TypographyH4>{conference?.acronym || venue}</TypographyH4>
                  {conference?.title && (
                    <TypographyP size="sm">{conference.title}</TypographyP>
                  )}
                  {conference?.rank && (
                    <TypographyP size="sm" className="text-special">
                      Conference Rank: {conference.rank}
                    </TypographyP>
                  )}
                </VStack>
                <Separator />
                <TypographyP size="sm" className="text-muted-foreground">
                  Conference rankings from ICORE (International Conference
                  Ranking).
                </TypographyP>
              </VStack>
            </HoverCardContent>
          </HoverCard>
        </HStack>
        <HStack className="gap-2 items-center">
          <ConferenceBadge rank={conference?.rank || "Unranked"} />
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack className="gap-2 items-start">
      <HStack className="gap-2 items-center">
        <TypographyH3>{venue}</TypographyH3>
        <HoverCard>
          <HoverCardTrigger>
            <InfoIcon className="size-4 text-muted-foreground" />
          </HoverCardTrigger>
          <HoverCardContent>
            <VStack className="gap-1">
              <VStack className="gap-1">
                <TypographyH4>{venue}</TypographyH4>
              </VStack>
              <Separator />
              <TypographyP size="sm" className="text-muted-foreground">
                No additional venue data available for this paper.
              </TypographyP>
            </VStack>
          </HoverCardContent>
        </HoverCard>
      </HStack>
      <TypographyP size="sm" variant="muted">
        No data available
      </TypographyP>
    </VStack>
  );
};

const ConferenceBadge = ({ rank }: { rank: string }) => {
  const colorMap: Record<string, string> = {
    "A*": "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30",

    A: "bg-green-100 text-green-700 ring-1 ring-green-200 dark:bg-green-500/15 dark:text-green-400 dark:ring-green-500/30",

    B: "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30",

    C: "bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:ring-orange-500/30",

    Unranked:
      "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-400 dark:ring-zinc-500/30",
  };
  const color = colorMap[rank] || "bg-gray-400";
  return (
    <Badge variant="outline" className={cn("font-semibold text-white", color)}>
      {rank === "Unranked" ? "Unranked" : `Rank: ${rank}`}
    </Badge>
  );
};

const JournalBadge = ({ quartile }: { quartile: string }) => {
  const colorMap: Record<string, string> = {
    Q1: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30",

    Q2: "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30",

    Q3: "bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:ring-orange-500/30",

    Q4: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:ring-rose-500/30",

    None: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-400 dark:ring-zinc-500/30",
  };
  const color = colorMap[quartile] || "bg-gray-400";

  return (
    <Badge variant="outline" className={cn("font-semibold text-white", color)}>
      {quartile ? `${quartile}` : "N/A"}
    </Badge>
  );
};

interface JournalMetrics {
  quartile?: "Q1" | "Q2" | "Q3" | "Q4" | "None";
}

function JournalRankBar({ quartile }: JournalMetrics) {
  if (!quartile) quartile = "None";
  const rankConfig = {
    Q1: { activeBars: 4, color: "bg-emerald-500", label: "Q1" },
    Q2: { activeBars: 3, color: "bg-yellow-500", label: "Q2" },
    Q3: { activeBars: 2, color: "bg-orange-500", label: "Q3" },
    Q4: { activeBars: 1, color: "bg-red-400", label: "Q4" },
    None: { activeBars: 0, color: "bg-gray-400", label: "N/A" },
  };

  const config = rankConfig[quartile] || rankConfig.None;

  return (
    <HStack className="gap-1 items-center">
      <TypographyP size="sm">{quartile} Quartile:</TypographyP>
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={cn(
            "h-2 w-6 rounded",
            bar <= config.activeBars
              ? config.color
              : "border border-accent bg-transparent",
          )}
        />
      ))}
    </HStack>
  );
}

const BadgeSection = ({ paper }: { paper: PaperDetail }) => {
  return (
    <HStack className="gap-2 flex-wrap">
      {/* {paper.source && (
        <Badge variant="outline" className="capitalize">
          {paper.source}
        </Badge>
      )} */}

      {paper.isOpenAccess ? (
        <Badge variant="active">Open Access</Badge>
      ) : (
        <Badge variant="destructive">Closed Access</Badge>
      )}

      {paper.isRetracted && <Badge variant="destructive">Retracted</Badge>}

      {paper.fwci !== null && paper.fwci !== undefined && (
        <Badge variant="default">FWCI: {paper.fwci.toFixed(2)}</Badge>
      )}

      {paper.isProcessed && <Badge variant="secondary">Processed</Badge>}
    </HStack>
  );
};

const INITIAL_COUNT = 3;

function PaperAuthors({ paper }: { paper: PaperDetail }) {
  const [expanded, setExpanded] = useState(false);

  const authors = paper.authors ?? [];

  if (authors.length === 0) return null;

  const hasOverflow = authors.length > INITIAL_COUNT + 1;

  const visibleAuthors =
    !expanded && hasOverflow
      ? [...authors.slice(0, INITIAL_COUNT), authors[authors.length - 1]]
      : authors;

  return (
    <HStack className="gap-2 items-start">
      <UserIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />

      <Box className="flex flex-wrap items-center gap-y-1 text-sm ">
        {visibleAuthors.map((author, index) => {
          const isLastVisible = index === visibleAuthors.length - 1;

          return (
            <span
              key={author.authorId || author.name}
              className="inline-flex items-center"
            >
              {/* +X more before final author */}
              {!expanded && hasOverflow && index === INITIAL_COUNT && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto px-1 py-0 text-accent"
                    onClick={() => setExpanded(true)}
                  >
                    +{authors.length - INITIAL_COUNT - 1} more
                  </Button>

                  <span className="mx-1 text-muted-foreground">…</span>
                </>
              )}

              <a
                href={`/authors/${author.authorId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                {author.name}
              </a>

              {!isLastVisible && <span>,&nbsp;</span>}
            </span>
          );
        })}

        {expanded && hasOverflow && (
          <Button
            variant="outline"
            size="sm"
            className="ml-1 h-auto px-1 text-accent"
            onClick={() => setExpanded(false)}
          >
            Show less
          </Button>
        )}
      </Box>
    </HStack>
  );
}
