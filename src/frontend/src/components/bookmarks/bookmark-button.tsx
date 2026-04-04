"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useCheckBookmark, useCreateBookmark, useDeleteBookmark } from "@/hooks/use-bookmarks";
import { useAuthStore } from "@/store/auth-store";
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

interface BookmarkButtonProps {
  paperId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BookmarkButton({ paperId, variant = "ghost", size = "default" }: BookmarkButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const { data: checkData, isLoading: isChecking } = useCheckBookmark(paperId);
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState("");

  const isBookmarked = checkData?.isBookmarked || false;

  const handleClick = () => {
    if (!isAuthenticated) {
      // Could show a login prompt here
      return;
    }

    if (isBookmarked) {
      // Find and delete the bookmark (we'd need to track the bookmark ID)
      // For now, we'll just show this is bookmarked
      // In a full implementation, you'd need to store the bookmark ID when checking
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
      }
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  const isPending = createBookmark.isPending || deleteBookmark.isPending;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isChecking || isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isBookmarked ? (
          <>
            <BookmarkCheck className="h-4 w-4" />
            {size !== "icon" && <span className="ml-2">Bookmarked</span>}
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4" />
            {size !== "icon" && <span className="ml-2">Bookmark</span>}
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
            <Button onClick={handleCreateBookmark} disabled={createBookmark.isPending}>
              {createBookmark.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
