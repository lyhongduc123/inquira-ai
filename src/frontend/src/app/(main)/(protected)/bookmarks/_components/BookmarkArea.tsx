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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Box } from "@/components/layout/box";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { SortField, SortState } from "./BookmarkPageClient";
import { useDeleteBookmark } from "@/hooks/use-bookmarks";

interface BookmarkAreaProps {
  data?: Bookmark[];
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  refetch?: () => void;
  selectedScopedPaperIds?: string[];
  onToggleScopedPaper?: (paperId: string, checked: boolean) => void;
  onSetAllScopedPapers?: (paperIds: string[], checked: boolean) => void;

  sort?: SortState;
  onSortChange?: (field: SortField) => void;
  filters?: { isOpenAccess?: boolean; hasNotes?: boolean };
  onFiltersChange?: (filters: { isOpenAccess?: boolean; hasNotes?: boolean }) => void;
}

export function BookmarkArea({
  data,
  isLoading,
  isError,
  refetch,
  selectedScopedPaperIds,
  onToggleScopedPaper,
  onSetAllScopedPapers,
  onSortChange,
  onFiltersChange,
  sort,
  filters
}: BookmarkAreaProps) {
  const router = useRouter();
  const deleteBookmark = useDeleteBookmark();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleRemoveBookmark = async (paperId: string) => {
    setPendingDeleteId(paperId);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    const bookmark = data?.find((b) => b.paperId === pendingDeleteId);
    if (!bookmark) return;

    try {
      await deleteBookmark.mutateAsync({
        bookmarkId: bookmark.id,
        paperId: bookmark.paperId,
      });
      refetch?.();
    } catch (error) {
      toast.error("Failed to remove bookmark");
      console.error("Error removing bookmark:", error);
    }
    setPendingDeleteId(null);
  }

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

  return (
    <Box>
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={() => setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The bookmark will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={"destructive"}
              onClick={confirmDelete}
              disabled={deleteBookmark.isPending}
              className="cursor-pointer"
            >
              {deleteBookmark.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <BookmarkList
        isLoading={isLoading}
        data={data || []}
        onRemoveBookmark={handleRemoveBookmark}
        selectedScopedPaperIds={selectedScopedPaperIds}
        onToggleScopedPaper={onToggleScopedPaper}
        onSetAllScopedPapers={onSetAllScopedPapers}
        sort={sort}
        onSortChange={onSortChange}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    </Box>
  );
}
