import {
  TypographyH2,
  TypographyH4,
  TypographyP,
} from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AuthorDetailWithPapers } from "@/types/author.type";
import {
  CheckCircle2,
  ExternalLink,
  HomeIcon,
  Loader2,
  AlertTriangle,
  UniversityIcon,
  CheckCircleIcon,
} from "lucide-react";

interface AuthorInfoSectionProps {
  author?: AuthorDetailWithPapers;
  isLoading?: boolean;
}

export function AuthorInfoSection({
  author,
  isLoading,
}: AuthorInfoSectionProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-2 shadow-lg transition-all hover:shadow-xl">
        <CardContent className="p-6">
          <HStack className="gap-6 items-start">
            <Skeleton className="size-20 shrink-0 rounded-full" />
            <VStack className="gap-4 flex-1 w-full">
              <Skeleton className="h-6 w-1/3 rounded-md" />
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </VStack>
          </HStack>
        </CardContent>
      </Card>
    );
  }

  const status = author?.enrichmentStatus?.status;
  const hasTerminalStatus = status === "completed" || status === "failed";
  const isEnriching = status === "enriching";
  const isFirstProcessing =
    !hasTerminalStatus &&
    author?.isProcessed === false &&
    author?.isEnriched === false;
  const shouldShowProcessing = Boolean(isEnriching || isFirstProcessing);

  const displayName = author?.displayName || author?.name;
  const initials = (displayName || "Unknown Author")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const uniqueFields = [
    ...new Map(
      author?.topics?.map((item) => [item.field.id, item.field.displayName]),
    ).values(),
  ];

  const sortedInstitutions = [...(author?.authorInstitutions || [])].sort(
    (a, b) => {
      const dateA = a.endDate
        ? new Date(a.endDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const dateB = b.endDate
        ? new Date(b.endDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    },
  );

  const primaryInstitution = sortedInstitutions[0];
  const fieldsToShow = uniqueFields.slice(0, 8);

  return (
    <Card className="overflow-hidden border-2 shadow-lg transition-all hover:shadow-xl">
      <CardContent className="px-6">
        <HStack className="gap-6 items-start">
          <div className="relative">
            <Avatar className="size-20 ring-4 ring-primary/10 shadow-md">
              <AvatarFallback className="text-xl font-bold bg-linear-to-br from-blue-500 to-yellow-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <VStack className="gap-4 flex-1">
            <HStack className="gap-6 justify-between items-start flex-wrap">
              <VStack className="gap-2 flex-1 min-w-[260px]">
                <HStack className="gap-3 flex-wrap">
                  <TypographyH2 className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                    {displayName || "Unknown author"}
                  </TypographyH2>
                  {author?.verified && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="gap-1.5 px-3 py-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {author.orcid && <p>ORCID: {author.orcid}</p>}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </HStack>
                {primaryInstitution ? (
                  <HStack className="gap-2 items-center flex-wrap">
                    <UniversityIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <TypographyP size="sm" variant="muted">
                      {primaryInstitution.name}
                    </TypographyP>
                  </HStack>
                ) : (
                  <TypographyP size="sm" variant="muted">
                    Institution not available
                  </TypographyP>
                )}
              </VStack>
              <VStack className="gap-2 items-end min-w-[190px]">
                {author?.isEnriched && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge variant="active" className="text-sm">
                        Processed
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="text-sm text-card-foreground gap-2">
                      <TypographyH4 className="text-sm text-primary-foreground mb-2">
                        Author processed
                      </TypographyH4>
                      We use combined datas from{" "}
                      <span className="text-primary-foreground font-semibold">
                        Semantic Scholar
                      </span>{" "}
                      and{" "}
                      <span className="text-primary-foreground font-semibold">
                        Openalex
                      </span>{" "}
                      to build the author profile. The author data is refreshed{" "}
                      <span className="underline">every 30 days</span> when a
                      user visits the author page.
                    </HoverCardContent>
                  </HoverCard>
                )}
                {shouldShowProcessing && (
                  <Badge variant="warning" className="text-sm gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Processing author data...
                  </Badge>
                )}
                {author?.isProcessed && !shouldShowProcessing && (
                  <Badge
                    variant="outline"
                    className="text-sm border-green-300 text-green-700"
                  >
                    Processing Complete
                  </Badge>
                )}

                <ConflictBadge isConflict={author?.isConflict} />
              </VStack>
            </HStack>

            {fieldsToShow.length > 0 ? (
              <HStack className="gap-2 flex-wrap">
                <TypographyP
                  size="xs"
                  variant="muted"
                  className="font-semibold"
                >
                  Research Fields:
                </TypographyP>
                {fieldsToShow.map((field, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs px-2 py-0.5"
                  >
                    {field}
                  </Badge>
                ))}
              </HStack>
            ) : (
              <TypographyP size="xs" variant="muted">
                Research fields are not available yet.
              </TypographyP>
            )}
            <HStack className="gap-2 items-start min-w-[190px]">
              <AuthorLink
                href={author?.homepageUrl || ""}
                text="Homepage"
                icon={<HomeIcon className="size-3.5" />}
              />
              <AuthorLink
                href={author?.url || ""}
                text="Semantic Scholar"
                icon={<ExternalLink className="size-3.5" />}
              />
              <AuthorLink
                href={
                  "https://scholar.google.com/scholar?q=author:" +
                  encodeURIComponent(author?.name || "")
                }
                text="Google Scholar"
                icon={<ExternalLink className="size-3.5" />}
              />
            </HStack>
          </VStack>
        </HStack>
      </CardContent>
    </Card>
  );
}

const AuthorLink = ({
  href,
  text,
  icon,
}: {
  href: string;
  text: string;
  icon?: React.ReactNode;
}) => {
  if (!href) return null;
  return (
    <Button variant="outline" size="sm" className="gap-2" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {icon}
        <span>{text}</span>
      </a>
    </Button>
  );
};

const ConflictBadge = ({ isConflict }: { isConflict?: boolean }) => {
  if (!isConflict)
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge variant={"default"} className="text-sm gap-1">
            <CheckCircleIcon className="size-4" />
            No conflicts
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="text-sm text-card-foreground">
          <TypographyH4 className="text-sm text-primary-foreground mb-2">
            No data conflict detected
          </TypographyH4>
          We have not detected any conflicting information for this author
          between both sources. But we still recommend reviewing the data for
          yourself on{" "}
          <span className="text-primary-foreground font-semibold">
            Google Scholar
          </span>
        </HoverCardContent>
      </HoverCard>
    );
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge variant={"destructive"} className="text-sm gap-1">
          <AlertTriangle className="size-4" />
          Data Conflict
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="bg-destructive text-sm text-card-foreground">
        <TypographyH4 className="text-sm text-destructive mb-2">
          Data conflict detected
        </TypographyH4>
        We have detected conflicting information for this author based on
        citations, publications,... Please review the data about the author by
        yourself.
      </HoverCardContent>
    </HoverCard>
  );
};
