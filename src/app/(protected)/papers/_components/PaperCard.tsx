import { AccessLinkButton } from "@/app/_components/_shared/AccessLinkButton";
import { ActionButtonGroup } from "@/app/_components/_shared/ActionButtonGroup";
import { TypographyP } from "@/components/global/typography";
import { Box } from "@/components/layout/box";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AuthorMetadata } from "@/types/author.type";
import { PaperMetadata } from "@/types/paper.type";
import { BookOpen, Users } from "lucide-react";

interface PaperCardProps {
  paper: PaperMetadata;
  idx?: number;
}

export function PaperCard({ paper, idx }: PaperCardProps) {
    console.log("Rendering PaperCard for paper:", paper);
  const formatAuthors = (authorsArr: AuthorMetadata[]) => {
    if (!authorsArr?.length) return "";
    if (authorsArr.length <= 3) {
      return authorsArr.map((author) => author.name).join(", ");
    }
    const authorsArray = authorsArr.slice(0, 3).map((author) => author.name);
    const remainingCount = authorsArr.length - 3;
    const lastAuthor = authorsArr[authorsArr.length - 1].name;
    return `${authorsArray.join(
      ", ",
    )} … ${lastAuthor} (+${remainingCount} more)`;
  };

  return (
    <Card className="w-full group">
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0">
        <IndexBadge idx={idx} />
        <CardTitle className="flex-1 text-sm font-medium">
          <HStack className="items-center gap-1">
            <a
              href={paper.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 hover:underline line-clamp-1 pr-2"
            >
              {paper.title}
            </a>
            <Box className="absolute inset-3 flex items-center justify-end opacity-100 group-hover:opacity-0 transition-opacity duration-200 group-hover:pointer-events-none">
              <AccessLinkButton
                isIcon={true}
                pdfUrl={paper.pdfUrl || undefined}
                url={paper.url || undefined}
              />
            </Box>
          </HStack>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <VStack className="w-full gap-2">
          <VStack className="flex-1 w-full">
            {paper.authors && (
              <HStack className="flex-wrap items-center gap-3 text-sm text-accent">
                <HStack className="min-w-0 items-center gap-1">
                  <Users className="h-4 w-4 shrink-0 -translate-y-0.5" />
                  <TypographyP
                    variant="muted"
                    size="xs"
                    className="line-clamp-1"
                  >
                    {formatAuthors(paper.authors)}
                  </TypographyP>
                </HStack>
              </HStack>
            )}

            {/* Abstract/Snippet */}
            {paper.abstract && paper.abstract.length > 0 ? (
              <TypographyP
                variant="muted"
                size="xs"
                className="mt-1 line-clamp-3"
              >
                {paper.abstract}
              </TypographyP>
            ) : (
              <TypographyP variant="accent" size="xs" className="mt-1 italic">
                No abstract available.
              </TypographyP>
            )}
          </VStack>
          <HStack className="w-full justify-between">
            <HStack className="items-center gap-4 min-w-0">
              <InfoItem number={paper.year || "n.d."} className="shrink-0" />
              <InfoItem
                number={paper.citationCount}
                label="citations"
                className="shrink-0"
              />
              <InfoItem
                number={paper.influentialCitationCount || 0}
                label="influential citations"
                className="shrink-0"
              />
              <Box className=" min-w-0 max-w-full group-hover:max-w-[30%] transition-all duration-200 truncate">
                <InfoItem
                  icon={<BookOpen size={16} className="shrink-0" />}
                  label={paper.venue || "Unknown Venue"}
                />
              </Box>
            </HStack>
            <Box className="relative">
              <Box className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ActionButtonGroup paperMetadata={paper} />
              </Box>
            </Box>
          </HStack>
        </VStack>
      </CardContent>
    </Card>
  );
}

const IndexBadge = ({
  idx,
  isSelected,
}: {
  idx?: number;
  isSelected?: boolean;
}) => {
  if (idx === undefined) return null;
  return (
    <Badge
      className={
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }
    >
      {idx + 1}
    </Badge>
  );
};

interface InfoItemProps {
  icon?: React.ReactNode;
  label?: string;
  number?: number | string;
  className?: string;
}

const InfoItem = ({ icon, label, number, className }: InfoItemProps) => {
  return (
    <HStack className={cn("items-center gap-1 min-w-0", className)}>
      {icon}
      {number && (
        <TypographyP size="xs" className="font-semibold shrink-0">
          {number}
        </TypographyP>
      )}
      {label && (
        <TypographyP size="xs" className="text-muted-foreground truncate">
          {" " + label}
        </TypographyP>
      )}
    </HStack>
  );
};
