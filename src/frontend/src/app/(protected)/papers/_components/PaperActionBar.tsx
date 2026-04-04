import {
  BookmarkIcon,
  ExternalLinkIcon,
  EyeIcon,
  MessageSquarePlusIcon,
  QuoteIcon,
} from "lucide-react";

import { HStack } from "@/components/layout/hstack";
import { Button } from "@/components/ui/button";
import type { PaperDetail } from "@/types/paper.type";
import { Skeleton } from "@/components/ui/skeleton";
import { CitationStyleDialog } from "@/app/_components/_shared/CitationStyleDialog";
import { useState } from "react";

interface PaperActionBarProps {
  paper: PaperDetail;
  isBookmarked: boolean;
  onFulltext: () => void;
  onPeek: () => void;
  onBookmark: () => void;
  onAddToChat?: () => void;
  onCite?: () => void;
}

export function PaperActionBar({
  paper,
  isBookmarked,
  onFulltext,
  onPeek,
  onBookmark,
  onAddToChat,
  onCite,
}: PaperActionBarProps) {
  const [isCitationDialogOpen, setIsCitationDialogOpen] = useState(false);

  const handleOnCite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCitationDialogOpen(true);
    onCite?.();
  };
  return (
    <HStack className="gap-2 flex-wrap">
      {/* Fulltext Button */} 
      {paper.pdfUrl && (
        <Button onClick={onFulltext} variant="default" size="sm">
          <ExternalLinkIcon />
          View PDF
        </Button>
      )}

      {/* Peek Button */}
      {/* {paper.pdfUrl && (
        <Button onClick={onPeek} variant="outline" size="sm">
          <EyeIcon />
          Peek
        </Button>
      )} */}

      {/* Bookmark Button */}
      <Button
        onClick={onBookmark}
        variant={isBookmarked ? "default" : "outline"}
        size="sm"
      >
        <BookmarkIcon className={isBookmarked ? "fill-current" : ""} />
        {isBookmarked ? "Bookmarked" : "Bookmark"}
      </Button>

      {onAddToChat && (
        <Button onClick={onAddToChat} variant="ghost" size="sm">
          <MessageSquarePlusIcon />
          Add to Chat
        </Button>
      )}

      {/* Cite Button */}
      <Button onClick={handleOnCite} variant="ghost" size="sm">
        <QuoteIcon />
        Cite
      </Button>
      <CitationStyleDialog
        citationStyles={paper.citationStyles || undefined}
        open={isCitationDialogOpen}
        onOpenChange={setIsCitationDialogOpen}
      />
    </HStack>
  );
}

export function PaperActionBarSkeleton() {
  return (
    <HStack className="gap-2 flex-wrap">
      <Skeleton className="h-8 w-24 rounded-md" />
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-8 w-28 rounded-md" />
      <Skeleton className="h-8 w-24 rounded-md" />
    </HStack>
  );
}
