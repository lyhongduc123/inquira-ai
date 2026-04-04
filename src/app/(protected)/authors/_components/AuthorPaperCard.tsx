import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PaperMetadata } from "@/types/paper.type";
import { AuthorMetadata } from "@/types/author.type";
import { TypographyP } from "@/components/global/typography";
import { BookOpen, Users, Quote, Zap } from "lucide-react";
import { Box } from "@/components/layout/box";
import { cn } from "@/lib/utils";
import { AccessLinkButton } from "./../../../_components/_shared/AccessLinkButton";
import { ActionButtonGroup } from "./../../../_components/_shared/ActionButtonGroup";
import { IndexBadge } from "./../../../_components/_shared/IndexBadge";
import { InfoItem } from "./../../../_components/_shared/InfoItem";

interface AuthorPaperCardProps {
  idx?: number;
  paperMetadata?: PaperMetadata;
  isViewing?: boolean;
  isSelected?: boolean;
  onSelect?: (paperId: string) => void;
  onView?: (paper: PaperMetadata) => void;

  currentAuthorName?: string;
  isLoading?: boolean;
}

export function AuthorPaperCard({
  idx,
  paperMetadata,
  isViewing,
  isSelected,
  onSelect,
  currentAuthorName,
  onView,
  isLoading,
}: AuthorPaperCardProps) {
  if (!paperMetadata) {
    return null;
  }

  if (isLoading) {
    return <PaperCardSkeleton />;
  }
  const {
    title,
    url,
    authors,
    year,
    venue,
    abstract,
    citationCount,
    influentialCitationCount,
    pdfUrl,
    journal,
  } = paperMetadata;
  const displayText = abstract;

  const formatAuthors = (authorsArr: AuthorMetadata[]) => {
    if (!authorsArr?.length) return null;

    const renderName = (name: string, index: number, hasComma: boolean = true) => {
      const isMatch =
        currentAuthorName &&
        name.toLowerCase() === currentAuthorName.toLowerCase();
      return (
        <span key={`${name}-${index}`} className={cn(isMatch && "font-bold text-secondary")}>
          {name}{hasComma && ", "}
        </span>
      );
    };

    if (authorsArr.length <= 4) {
      return (
        <>{authorsArr.map((a, i) => renderName(a.name, i, i < authorsArr.length - 1))}</>
      );
    }

    const matchIndex = currentAuthorName 
      ? authorsArr.findIndex(a => a.name.toLowerCase() === currentAuthorName.toLowerCase())
      : -1;

    const lastIdx = authorsArr.length - 1;

    if (matchIndex <= 2 || matchIndex === lastIdx || matchIndex === -1) {
      return (
        <>
          {authorsArr.slice(0, 3).map((a, i) => renderName(a.name, i))}
          <span>… </span>
          {renderName(authorsArr[lastIdx].name, lastIdx, false)}
          <span> (+{authorsArr.length - 4} more)</span>
        </>
      );
    }
    // Case: First1, First2 ... Target ... Last (+X more)
    return (
      <>
        {authorsArr.slice(0, 2).map((a, i) => renderName(a.name, i))}
        <span>… </span>
        {renderName(authorsArr[matchIndex].name, matchIndex)}
        <span>… </span>
        {renderName(authorsArr[lastIdx].name, lastIdx, false)}
        <span> (+{authorsArr.length - 4} more)</span>
      </>
    );
  };

  const citationLevel = () => {
    if (citationCount === undefined || citationCount === 0) return null;
    if (citationCount > 500) return "HIGHLY CITED";
    if (citationCount > 100) return "MODERATELY CITED";
    return null;
  };

  const influentialLevel = () => {
    if (!influentialCitationCount) return null;
    if (influentialCitationCount > 50) return "HIGHLY INFLUENTIAL";
    if (influentialCitationCount > 10) return "MODERATELY INFLUENTIAL";
    return null;
  };

  const onCardView = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    console.log("PaperCard clicked. Current selection:", selection?.toString());

    if (selection && selection.toString().length > 0) {
      return;
    }
    console.log("PaperCard clicked:", paperMetadata);
    e.stopPropagation();
    onView?.(paperMetadata);
  };

  return (
    <Card
      className={cn(
        "group relative gap-2 p-3 transition hover:bg-card/40 hover:border-primary cursor-pointer min-w-0",
        isViewing && "bg-card/40 border-primary",
        isSelected && "ring-2 ring-primary ring-offset-2",
      )}
      onClick={onCardView}
    >
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 min-w-0">
        <CardTitle className="flex-1 text-sm font-medium min-w-0">
          <HStack className="items-center gap-1 min-w-0">
            <a
              href={url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 group-hover:underline line-clamp-1 pr-2 min-w-0 max-w-[90%]"
            >
              {title}
            </a>
            <Box className="absolute inset-3 flex items-center justify-end opacity-100 group-hover:opacity-0 transition-opacity duration-200 group-hover:pointer-events-none">
              <AccessLinkButton
                isIcon={true}
                pdfUrl={pdfUrl || undefined}
                url={url || undefined}
              />
            </Box>
          </HStack>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <VStack className="w-full gap-2">
          <VStack className="flex-1 w-full">
            {authors && (
              <HStack className="flex-wrap items-center gap-3 text-sm text-accent">
                <HStack className="min-w-0 items-center gap-1">
                  <Users className="h-4 w-4 shrink-0 -translate-y-0.5" />
                  <TypographyP
                    size="xs"
                    className="line-clamp-1"
                  >
                    {formatAuthors(authors)}
                  </TypographyP>
                </HStack>
              </HStack>
            )}

            {/* Abstract/Snippet */}
            {/* {displayText ? (
              <TypographyP
                variant="muted"
                size="xs"
                className="mt-1 line-clamp-2"
              >
                <span className="font-semibold text-accent">ABSTRACT: </span>
                {displayText}
              </TypographyP>
            ) : (
              <TypographyP variant="accent" size="xs" className="mt-1 italic">
                No abstract available.
              </TypographyP>
            )} */}
          </VStack>
          {/* Citation Levels */}
          {/* <Box className="min-h-4">
            {(citationLevel() || influentialLevel()) && (
              <HStack className="gap-2 min-h-4">
                <SignalBadge
                  text={citationLevel() || ""}
                  icon={<Quote size={16} />}
                  variant={
                    citationLevel() === "HIGHLY CITED" ? "default" : "positive"
                  }
                />
                <SignalBadge
                  text={influentialLevel() || ""}
                  icon={<Zap size={16} />}
                  variant={
                    influentialLevel() === "HIGHLY INFLUENTIAL"
                      ? "default"
                      : "positive"
                  }
                />
              </HStack>
            )}
          </Box> */}
          <Box className="@container w-full mt-2">
            <HStack className="w-full justify-between items-center gap-2 min-w-0">
              <HStack className="items-center gap-2 @sm:gap-4 min-w-0 flex-1">
                <InfoItem number={year || "n.d."} className="shrink-0" />
                <InfoItem
                  number={citationCount}
                  label="citations"
                  className="shrink-0"
                  labelClassName="hidden @xs:block"
                />
                <InfoItem
                  number={influentialCitationCount}
                  label="influential citations"
                  className="shrink-0"
                  labelClassName="hidden @sm:block"
                />
                <Box className="hidden @md:block min-w-0 flex-1 group-hover:max-w-[40%] transition-all duration-200">
                  <InfoItem
                    icon={<BookOpen size={16} className="shrink-0" />}
                    label={venue || "Unknown Venue"}
                    className="w-full min-w-0"
                  />
                </Box>
              </HStack>
              <Box
                className={cn(
                  "shrink-0 flex justify-end overflow-hidden transition-all duration-300 ease-out",
                  "max-w-0 opacity-0 group-hover:max-w-fit group-hover:opacity-100 group-hover:ml-2",
                )}
              >
                <Box className="w-max">
                  <ActionButtonGroup paperMetadata={paperMetadata} />
                </Box>
              </Box>
            </HStack>
          </Box>
        </VStack>
      </CardContent>
    </Card>
  );
}

interface SignalBadgeProps {
  text?: string;
  icon?: React.ReactNode;
  variant?: "default" | "positive" | "medium" | "negative";
  hidden?: boolean;
}

const SignalBadge = ({
  text,
  icon,
  variant = "default",
  hidden,
}: SignalBadgeProps) => {
  const variantClasses =
    variant === "positive"
      ? "bg-primary/20 text-primary"
      : variant === "medium"
        ? "bg-warning/20 text-warning"
        : variant === "negative"
          ? "bg-destructive/20 text-destructive"
          : "bg-secondary/20 text-secondary";

  if (!text || hidden) return null;
  return (
    <Badge className={`flex items-center gap-1 ${variantClasses}`}>
      {icon}
      <TypographyP size="xs" className="font-semibold">
        {text}
      </TypographyP>
    </Badge>
  );
};

const PaperCardSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 min-w-0">
        <div className="h-4 w-16 rounded bg-muted" />
        <CardTitle className="flex-1 text-sm font-medium min-w-0">
          <div className="h-4 w-full rounded bg-muted" />
        </CardTitle>
      </CardHeader>
    </Card>
  );
};
