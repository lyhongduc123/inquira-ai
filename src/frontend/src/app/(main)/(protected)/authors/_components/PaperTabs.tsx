import { VStack } from "@/components/layout/vstack";
import { PaperMetadata } from "@/types/paper.type";
import { AuthorPaperCard } from "./AuthorPaperCard";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/layout/hstack";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PaperSortBy = "year" | "citation";
type PaperSortOrder = "asc" | "desc";

interface PapersTabsProps {
  papers?: PaperMetadata[];
  totalPapers?: number;
  currentAuthorName?: string;
  isLoading?: boolean;
  isError?: boolean;
  isLoadingMore?: boolean;
  sortBy?: PaperSortBy;
  sortOrder?: PaperSortOrder;
  onSortByChange?: (value: PaperSortBy) => void;
  onSortOrderChange?: (value: PaperSortOrder) => void;

  onView?: (paper: PaperMetadata) => void;
  onLoadMore?: () => void;
}

export function PapersTabs({
  papers,
  totalPapers = 0,
  currentAuthorName,
  isLoading,
  isLoadingMore = false,
  sortBy = "year",
  sortOrder = "desc",
  onSortByChange,
  onSortOrderChange,
  onLoadMore,
  onView,
}: PapersTabsProps) {
  if (isLoading) {
    return <PapersTabsLoading />;
  }

  if (!papers || papers.length === 0) {
    return <PapersTabsEmpty />;
  }

  const hasMorePapers = papers.length < totalPapers;

  const handleOnView = (paper: PaperMetadata) =>  {
    onView?.(paper);
  }

  return (
    <VStack className="gap-4 min-w-0">
      <PaperSortControls
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByChange={onSortByChange}
        onSortOrderChange={onSortOrderChange}
      />
       

      {papers.map((paper, idx) => (
        <AuthorPaperCard
          key={paper.paperId || idx}
          idx={idx + 1}
          paperMetadata={paper}
          currentAuthorName={currentAuthorName}
          onView={handleOnView}
        />
      ))}
      {hasMorePapers && (
        <HStack className="flex items-center gap-4 w-full">
          <Separator className="flex-1" />

          <Button
            variant="outline"
            className="shrink-0 cursor-pointer gap-2"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            Load more ({papers.length} / {totalPapers})
          </Button>

          <Separator className="flex-1" />
        </HStack>
      )}
    </VStack>
  );
}

const PapersTabsLoading = () => {
  return (
    <VStack className="gap-4 min-w-0">
      {Array.from({ length: 5 }).map((_, idx) => (
        <AuthorPaperCard key={idx} isLoading />
      ))}
    </VStack>
  );
};

const PapersTabsEmpty = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle className="text-center">No publications found</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          This author has not been associated with any publications in our
          database.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
};


interface PaperSortControlsProps {
  sortBy: PaperSortBy;
  sortOrder: PaperSortOrder;
  onSortByChange?: (value: PaperSortBy) => void;
  onSortOrderChange?: (value: PaperSortOrder) => void;
}

export function PaperSortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: PaperSortControlsProps) {
  const handleSort = (field: PaperSortBy) => {
    if (sortBy === field) {
      onSortOrderChange?.(
        sortOrder === "asc" ? "desc" : "asc"
      );
      return;
    }

    onSortByChange?.(field);
    onSortOrderChange?.("desc");
  };

  const renderIcon = (field: PaperSortBy) => {
    if (sortBy !== field) return null;

    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <HStack className="flex-wrap items-center gap-2">
      <Button
        variant={sortBy === "year" ? "default" : "outline"}
        size="sm"
        onClick={() => handleSort("year")}
        className={cn("gap-1")}
      >
        Year
        {renderIcon("year")}
      </Button>

      <Button
        variant={sortBy === "citation" ? "default" : "outline"}
        size="sm"
        onClick={() => handleSort("citation")}
        className={cn("gap-1")}
      >
        Citations
        {renderIcon("citation")}
      </Button>
    </HStack>
  );
}