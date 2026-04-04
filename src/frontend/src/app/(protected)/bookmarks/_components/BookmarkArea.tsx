"use client";

import { Bookmark } from "@/lib/api";
import { BookmarkList } from "./BookmarkList";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { bookmarksApi } from "@/lib/api/bookmarks-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";

interface BookmarkAreaProps {
  data?: Bookmark[];
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  refetch?: () => void;
  selectedScopedPaperIds?: string[];
  onToggleScopedPaper?: (paperId: string, checked: boolean) => void;
  onSetAllScopedPapers?: (paperIds: string[], checked: boolean) => void;
}

export function BookmarkArea({
  data,
  isLoading,
  isError,
  isEmpty,
  refetch,
  selectedScopedPaperIds,
  onToggleScopedPaper,
  onSetAllScopedPapers,
}: BookmarkAreaProps) {
  const router = useRouter();
  const handleRemoveBookmark = async (paperId: string) => {
    const bookmark = data?.find((b) => b.paperId === paperId);
    if (!bookmark) return;

    try {
      await bookmarksApi.delete(bookmark.id);
      toast.success("Bookmark removed successfully");
      refetch?.();
    } catch (error) {
      toast.error("Failed to remove bookmark");
      console.error("Error removing bookmark:", error);
    }
  };

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <TriangleAlert className="size-16 text-destructive" />
          </EmptyMedia>
          <EmptyTitle className="text-center">
            Oops! Something went wrong.
          </EmptyTitle>
        </EmptyHeader>
        <EmptyContent className="max-w-lg">
          <EmptyDescription className="text-center">
            Something went wrong while fetching your bookmarks. Please try again
            later.
          </EmptyDescription>
          <EmptyMedia className="gap-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mx-auto mt-4"
            >
              Back to previous page
            </Button>
            <Button
              onClick={() => refetch?.()}
              variant="default"
              className="mx-auto mt-4"
            >
              Refresh
            </Button>
          </EmptyMedia>
        </EmptyContent>
      </Empty>
    );
  }

  if (isEmpty && !isLoading) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyTitle className="text-center">
            Your bookmark list is empty.
          </EmptyTitle>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <BookmarkList
      isLoading={isLoading}
      data={data || []}
      onRemoveBookmark={handleRemoveBookmark}
      selectedScopedPaperIds={selectedScopedPaperIds}
      onToggleScopedPaper={onToggleScopedPaper}
      onSetAllScopedPapers={onSetAllScopedPapers}
    />
  );
}
