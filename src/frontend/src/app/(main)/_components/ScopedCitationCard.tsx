import { BookOpenIcon, Quote } from "lucide-react"

import { TypographyH4, TypographyP } from "@/components/global/typography"
import { HStack } from "@/components/layout/hstack"
import { VStack } from "@/components/layout/vstack"
import { Separator } from "@/components/ui/separator"
import { C_BULLET } from "@/core"
import type { PaperMetadata } from "@/types/paper.type"
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils"

import { ActionButtonGroup } from "./_shared/ActionButtonGroup"
import { InfoItem } from "./_shared/InfoItem"

interface ScopedCitationCardProps {
  isVisible: boolean
  idx?: number
  paperDetail?: PaperMetadata
  scopedRef?: ScopedCitationRef
  handleClick?: () => void
}

export function ScopedCitationCard({
  isVisible,
  idx,
  paperDetail,
  scopedRef,
  handleClick,
}: ScopedCitationCardProps) {
  if (!isVisible || !paperDetail) return null

  const authors = paperDetail.authors ?? []

  return (
    <VStack className="gap-2">
      <VStack className="gap-1 items-start">
        <TypographyH4
          className="leading-tight line-clamp-2 cursor-pointer"
          onClick={handleClick}
        >
          {paperDetail.title}
        </TypographyH4>

        <HStack className="gap-1 items-center min-w-0 text-black dark:text-white">
          <InfoItem number={Number(paperDetail.year)} />
          <span className="text-muted-foreground">{C_BULLET}</span>
          <InfoItem number={paperDetail.citationCount} label="citations" />
          {/* {scopedRef?.chunkId && (
            <>
              <span className="text-muted-foreground">{C_BULLET}</span>
              <TypographyP className="text-xs text-muted-foreground">
                chunk {scopedRef.chunkId}
              </TypographyP>
            </>
          )} */}
        </HStack>

        {authors.length > 0 && (
          <TypographyP className="text-xs line-clamp-1">
            {authors[0].name}
            <span className="text-muted-foreground">
              {authors.length > 1 ? ", et al." : ""}
            </span>
          </TypographyP>
        )}

        <TypographyP className="text-xs text-muted-foreground line-clamp-1">
          <BookOpenIcon className="size-4 inline-block mr-1" />
          {paperDetail.venue}
        </TypographyP>
      </VStack>

      {scopedRef?.quote && (
        <>
          <Separator />
          <VStack className="items-start gap-1 rounded-md bg-muted/40 p-2">
            <HStack className="items-center gap-1 text-muted-foreground">
              <Quote className="size-3.5" />
              <TypographyP className="text-xs font-medium">
                {scopedRef.section}
              </TypographyP>
            </HStack>
            <TypographyP className="text-xs leading-relaxed line-clamp-4">
              {scopedRef.quote}
            </TypographyP>
          </VStack>
        </>
      )}

      <Separator />

      <HStack className="gap-1 items-center justify-between">
        {paperDetail.externalIds?.doi && (
          <a
            href={`https://doi.org/${paperDetail.externalIds?.doi}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <TypographyP className="text-xs text-muted-foreground underline">
              DOI: {paperDetail.externalIds?.doi}
            </TypographyP>
          </a>
        )}
        <ActionButtonGroup paperMetadata={paperDetail} />
      </HStack>
    </VStack>
  )
}