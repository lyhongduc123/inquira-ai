import {
  TypographyH4,
  TypographyP,
} from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { C_BULLET } from "@/core";
import type { PaperMetadata } from "@/types/paper.type";
import { BookOpenIcon } from "lucide-react";
import { ActionButtonGroup } from "./_shared/ActionButtonGroup";
import { Separator } from "@/components/ui/separator";
import { InfoItem } from "./_shared/InfoItem";

interface CitationCardProps {
  isVisible: boolean;
  idx?: number;
  paperDetail?: PaperMetadata;
  handleClick?: () => void;
}

export function CitationCard({
  isVisible,
  idx,
  paperDetail,
  handleClick,
}: CitationCardProps) {
  if (!isVisible || !paperDetail) return null;

  const authors = paperDetail?.authors ?? [];

  return (
    <VStack className="gap-2">
      <VStack className="gap-1 items-start">
        <HStack className="gap-1 items-center">
          {/* {idx !== undefined && (
          <IndexBadge idx={idx} />
        )} */}

          <TypographyH4
            className="leading-tight line-clamp-2 cursor-pointer"
            onClick={handleClick}
          >
            {paperDetail.title}
          </TypographyH4>
        </HStack>
        <HStack className="gap-1 items-center min-w-0 text-black dark:text-white">
          <InfoItem number={Number(paperDetail.year)} />
          <span className="text-muted-foreground">{C_BULLET}</span>
          <InfoItem
            number={paperDetail.citationCount}
            label={"citations"}
          />
          <span className="text-muted-foreground">{C_BULLET}</span>
          {authors.length > 0 && (
            <TypographyP className="text-xs line-clamp-1">
              {authors[0].name}
              <span className="text-muted-foreground">
                {authors.length > 1 ? `, et al.` : ""}
              </span>
            </TypographyP>
          )}
        </HStack>
        <HStack className="gap-1 items-center min-w-0">
          <TypographyP className="text-xs text-muted-foreground line-clamp-1">
            <BookOpenIcon className="size-4 inline-block mr-1" />
            {paperDetail.venue}
          </TypographyP>
        </HStack>
      </VStack>
      <Separator />
      <HStack className="gap-1 items-center justify-between">
        {paperDetail.externalIds?.DOI && (
          <a
            href={`https://doi.org/${paperDetail.externalIds?.DOI}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <TypographyP className="text-xs text-muted-foreground underline">
              DOI: {paperDetail.externalIds?.DOI}
            </TypographyP>
          </a>
        )}
        <ActionButtonGroup paperMetadata={paperDetail} />
      </HStack>
    </VStack>
  );
}
