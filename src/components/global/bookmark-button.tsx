"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import {
  useCheckBookmark,
  useCreateBookmark,
  useDeleteBookmark,
} from "@/hooks/use-bookmarks";
import { useAuthStore } from "@/store/auth-store";
import { useBookmarkStore } from "@/store/bookmark-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

interface BookmarkButtonProps {
  paperId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function BookmarkButton({
  paperId,
  variant,
  size = "default",
  showLabel = false,
  className,
}: BookmarkButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const { data: checkData, isLoading: isChecking } = useCheckBookmark(paperId);
  const cachedBookmarkId = useBookmarkStore((state) =>
    state.getBookmarkId(paperId),
  );
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState("");

  const bookmarkId = checkData?.bookmarkId ?? cachedBookmarkId;
  const isBookmarked = Boolean(
    checkData?.isBookmarked || cachedBookmarkId !== undefined,
  );

  const handleClick = () => {
    if (!isAuthenticated) {
      return;
    }

    if (isBookmarked) {
      if (bookmarkId) {
        deleteBookmark.mutate({ bookmarkId, paperId });
      }
    } else {
      setShowNotesDialog(true);
    }
  };

  const handleCreateBookmark = () => {
    createBookmark.mutate(
      { paperId, notes: notes || undefined },
      {
        onSuccess: () => {
          setShowNotesDialog(false);
          setNotes("");
        },
      },
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  const isPending = createBookmark.isPending || deleteBookmark.isPending;

  return (
    <>
      <Button
        variant={variant || isBookmarked ? "default" : "ghost"}
        size={size}
        onClick={handleClick}
        disabled={isChecking || isPending}
        className={cn("cursor-pointer", className)}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Bookmark
              className="h-4 w-4 transition-all"
              fill={isBookmarked ? "currentColor" : "none"}
            />
            {showLabel && (
              <span>
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </span>
            )}
          </>
        )}
      </Button>

      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bookmark</DialogTitle>
            <DialogDescription>
              Add optional notes to remember why you bookmarked this paper.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Why is this paper interesting?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBookmark}
              disabled={createBookmark.isPending}
            >
              {createBookmark.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
