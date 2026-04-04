import {
  UserIcon,
  ArrowUpRightFromSquare,
  InfoIcon,
} from "lucide-react";

import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Badge } from "@/components/ui/badge";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/global/typography";
import type { JournalData, PaperDetail } from "@/types/paper.type";
import { Skeleton } from "@/components/ui/skeleton";
import { formatter } from "@/lib/utils/date";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface PaperMetadataSectionProps {
  paper: PaperDetail;
}

export function PaperMetadataSection({ paper }: PaperMetadataSectionProps) {
  const doiLink = paper.externalIds?.DOI
    ? `https://doi.org/${paper.externalIds.DOI}`
    : null;

  console.log(doiLink);
  return (
    <VStack className="gap-4">
      {/* Title */}
      <TypographyH1 className="">{paper.title}</TypographyH1>

      {/* Authors */}
      {paper.authors && paper.authors.length > 0 && (
        <HStack className="gap-2 flex-wrap items-center">
          <UserIcon className="size-4 text-muted-foreground shrink-0" />
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {paper.authors.map((author, index) => (
              <TypographyP
                key={author.authorId || author.name}
                size="sm"
                className="inline"
              >
                {author.name}
                {index < paper.authors!.length - 1 && ","}
              </TypographyP>
            ))}
          </div>
        </HStack>
      )}

      <HStack className="justify-between">
        <VStack className="gap-4">
          {/* Metadata Row */}
          <HStack className="gap-4 flex-wrap items-center text-sm text-muted-foreground">
            {paper.publicationDate && (
              <HStack className="gap-1.5 items-center">
                <TypographyP size="sm" variant="muted">
                  Published at{" "}
                  {formatter.format(new Date(paper.publicationDate))}
                </TypographyP>
              </HStack>
            )}

            {paper.externalIds && (
              <a href={doiLink!} target="_blank" rel="noopener noreferrer">
                <HStack className="gap-1.5 items-center underline">
                  <ArrowUpRightFromSquare className="size-4 text-muted-foreground" />
                  DOI
                </HStack>
              </a>
            )}
          </HStack>

          {/* Badges */}
          <BadgeSection paper={paper} />
        </VStack>
        <HStack className="gap-2 flex-wrap">
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
                  <TypographyP size="sm" variant="accent">
                    Citations that significantly impact the citing paper,
                    determined by using machine learning analyzing citation
                    frequency and context by{" "}
                    <span className="text-secondary">Semantic Scholar.</span>
                  </TypographyP>
                </HoverCardContent>
              </HoverCard>
            </HStack>
            <TypographyP size="sm" variant="muted">
              Influential Citations
            </TypographyP>
          </VStack>
          <PaperJournalSection journal={paper.journal || undefined} />
        </HStack>
      </HStack>
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
  venue,
}: {
  journal?: JournalData;
  venue?: string;
}) => {
  if (!journal && !venue) return null;
  return (
    <VStack className="gap-2 items-start">
      <HStack className="gap-2 items-center">
        <TypographyH3>{journal?.title || venue}</TypographyH3>
        <HoverCard>
          <HoverCardTrigger>
            <InfoIcon className="size-4 text-muted-foreground" />
          </HoverCardTrigger>
          <HoverCardContent>
            <VStack className="gap-2">
              <TypographyP>{journal?.title}</TypographyP>
              {journal?.publisher && (
                <TypographyP size="sm">{journal.publisher}</TypographyP>
              )}
              <TypographyP size="sm" variant="white">
                SJR Score: {journal?.sjrScore || "N/A"} | H-index:{" "}
                {journal?.hIndex || "N/A"}
              </TypographyP>
              <JournalRankBar quartile={journal?.sjrBestQuartile} />
              <Separator />
              <TypographyP size="sm" variant="accent">
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
            No SJR data available
          </TypographyP>
        )}
      </HStack>
    </VStack>
  );
};

const JournalBadge = ({ quartile }: { quartile: string }) => {
  const colorMap: Record<string, string> = {
    Q1: "bg-emerald-500",
    Q2: "bg-yellow-500",
    Q3: "bg-orange-500",
    Q4: "bg-gray-400",
  };
  const color = colorMap[quartile] || "bg-gray-400";

  return (
    <Badge variant="outline" className={cn("font-semibold", color)}>
      {quartile}
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
      <TypographyP size="sm" variant="white">
        {quartile} Quartile:
      </TypographyP>
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
        <Badge variant="secondary">Open Access</Badge>
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
