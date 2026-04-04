import { TypographyP } from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";
import { Button } from "@/components/ui/button";
import { CitationStyleDialog } from "./CitationStyleDialog";
import {
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import { PaperMetadata } from "@/types/paper.type";
import { Quote, Bookmark, } from "lucide-react";
import { useState } from "react";
import { AccessLinkButton } from "./AccessLinkButton";
import { Box } from "@/components/layout/box";
import { useBookmark, useToggleBookmark } from "@/hooks/use-bookmarks";

export const ActionButtonGroup = ({
  paperMetadata,
}: {
  paperMetadata: PaperMetadata;
}) => {
  const delayDuration = 500; // ms
  const { pdfUrl, url, citationStyles, paperId } = paperMetadata;
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const { isBookmarked, toggle, isPending } = useToggleBookmark(paperMetadata.paperId);
  

  const onCitationClick = () => {
    setIsCitationModalOpen(true);
  };

  const onBookmarkClick = async () => {
    if (!isPending) toggle();
  };


  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <HStack className="gap-2">
        <Tooltip delayDuration={delayDuration}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onCitationClick}>
              <Quote className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <TypographyP size="sm" variant={"primary"}>
              Cite
            </TypographyP>
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={delayDuration}>
          <TooltipTrigger asChild>
            <Button 
              variant={isBookmarked ? "default" : "ghost"} 
              size="sm" 
              onClick={onBookmarkClick}
              disabled={isPending}
            >
              <Bookmark 
                className="h-4 w-4 transition-all" 
                fill={isBookmarked ? "currentColor" : "none"} 
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <TypographyP size="sm" variant={"primary"}>
              {isBookmarked ? "Remove Bookmark" : "Bookmark"}
            </TypographyP>
          </TooltipContent>
        </Tooltip>
        <AccessLinkButton pdfUrl={pdfUrl || undefined} url={url || undefined} isOpenAccess={paperMetadata.isOpenAccess} />
        {/* <Tooltip delayDuration={delayDuration}>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={onDetailsClick}>
              <Info className="h-4 w-4" />
              Details
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <TypographyP size="sm" variant={"primary"}>
              View Details
            </TypographyP>
          </TooltipContent>
        </Tooltip> */}
      </HStack>
      <CitationStyleDialog
        open={isCitationModalOpen}
        onOpenChange={setIsCitationModalOpen}
        citationStyles={citationStyles || undefined}
      />
    </Box>
  );
};

