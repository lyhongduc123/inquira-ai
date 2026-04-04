"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MessageSquarePlus, Trash2 } from "lucide-react";
import { Bookmark, bookmarksApi } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PaperDetailContent,
  PaperDetailFooter,
} from "@/app/_components/PaperDetailContent";
import { Separator } from "@/components/ui/separator";
import { Box } from "@/components/layout/box";
import { useRouter } from "next/navigation";
import { saveChatLaunchPayload } from "@/lib/scoped-chat-selection";
import { Checkbox } from "@/components/ui/checkbox";

interface BookmarkListProps {
  isLoading?: boolean;
  data?: Bookmark[];
  onRemoveBookmark: (paperId: string) => void;
  selectedScopedPaperIds?: string[];
  onToggleScopedPaper?: (paperId: string, checked: boolean) => void;
  onSetAllScopedPapers?: (paperIds: string[], checked: boolean) => void;
}

export function BookmarkList({
  isLoading,
  data = [],
  onRemoveBookmark,
  selectedScopedPaperIds = [],
  onToggleScopedPaper,
  onSetAllScopedPapers,
}: BookmarkListProps) {
  const router = useRouter();
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectablePaperIds = data
    .map((bookmark) => bookmark.paper?.paperId)
    .filter((paperId): paperId is string => Boolean(paperId));

  const selectedCount = selectablePaperIds.filter((paperId) =>
    selectedScopedPaperIds.includes(paperId),
  ).length;

  const allSelected = selectablePaperIds.length > 0 && selectedCount === selectablePaperIds.length;
  const someSelected = selectedCount > 0 && selectedCount < selectablePaperIds.length;

  const handleAddToChat = (bookmark: Bookmark) => {
    if (!bookmark.paper) {
      toast.error("Paper metadata is unavailable for this bookmark");
      return;
    }

    const launchId = saveChatLaunchPayload({
      query: "",
      scopedPapers: [bookmark.paper],
      source: "bookmarks",
    });

    if (!launchId) {
      toast.error("Unable to open chat right now");
      return;
    }

    router.push(`/?launch=${encodeURIComponent(launchId)}`);
  };

  const handleViewPaper = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setEditedNotes(bookmark.notes || "");
    setIsSheetOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedBookmark) return;

    setIsSaving(true);
    try {
      await bookmarksApi.update(selectedBookmark.id, { notes: editedNotes });
      toast.success("Notes updated successfully");
      if (selectedBookmark) {
        setSelectedBookmark({ ...selectedBookmark, notes: editedNotes });
      }
    } catch (error) {
      toast.error("Failed to update notes");
      console.error("Error updating notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<Bookmark>[] = [
    {
      id: "scoped",
      header: () => (
        <Checkbox
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={(checked) => {
            onSetAllScopedPapers?.(selectablePaperIds, Boolean(checked));
          }}
          aria-label="Select all visible papers for scoped chat"
        />
      ),
      cell: ({ row }) => {
        const paperId = row.original.paper?.paperId;
        if (!paperId) return null;

        const checked = selectedScopedPaperIds.includes(paperId);

        return (
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => {
              onToggleScopedPaper?.(paperId, Boolean(value));
            }}
            aria-label={`Select ${row.original.paper?.title || "paper"} for scoped chat`}
            onClick={(e) => e.stopPropagation()}
          />
        );
      },
    },
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <div className="text-muted-foreground w-[5%] whitespace-nowrap">
          {row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "paper.title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium line-clamp-2 truncate">
            {row.original.paper?.title || "Untitled"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {row.original.paper?.authors
              ?.slice(0, 2)
              .map((a) => a.name)
              .join(", ")}
            {(row.original.paper?.authors?.length ?? 0) > 2 &&
              ` +${(row.original.paper?.authors?.length ?? 0) - 2} more`}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <div className="w-full line-clamp-2 truncate">
          <span className="text-sm text-muted-foreground">
            {row.original.notes || "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "paper.citationCount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Citations
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold">
          {row.original.paper?.citationCount ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "paper.year",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.paper?.year ?? "—"}</span>
      ),
    },
    {
      accessorKey: "paper.venue",
      header: "Venue",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <span className="text-sm line-clamp-1 truncate">
            {row.original.paper?.venue || "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "paper.isOpenAccess",
      header: "Access",
      cell: ({ row }) => (
        <Badge
          variant={row.original.paper?.isOpenAccess ? "default" : "secondary"}
        >
          {row.original.paper?.isOpenAccess ? "Open" : "Closed"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const bookmark = row.original;
        return (
          <HStack className="gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToChat(bookmark);
              }}
              aria-label="Add paper to chat"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveBookmark(bookmark.paperId);
              }}
              aria-label="Remove bookmark"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </HStack>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onRowDoubleClick={handleViewPaper}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col">
          {selectedBookmark?.paper && (
            <>
              {/* Header */}
              <SheetHeader className="border-b px-4 py-3 bg-background">
                <SheetTitle className="capitalize">Paper Details</SheetTitle>
              </SheetHeader>

              {/* Content - Reuse PaperDetailContent */}
              <div className="flex-1 overflow-y-auto p-4">
                <PaperDetailContent paper={selectedBookmark.paper} />

                <Separator className="my-6" />

                {/* Notes Section */}
                <VStack className="gap-3">
                  <Label htmlFor="notes" className="text-base font-semibold">
                    Your Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add your notes about this paper..."
                    className="min-h-[150px]"
                  />  
                  <HStack className="gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditedNotes(selectedBookmark.notes || "")
                      }
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={
                        isSaving || editedNotes === selectedBookmark.notes
                      }
                    >
                      {isSaving ? "Saving..." : "Save Notes"}
                    </Button>
                  </HStack>
                </VStack>
              </div>

              {/* Footer - Reuse PaperDetailFooter */}
              <Box className="border-t p-4 bg-background">
                <PaperDetailFooter
                  paperMetadata={selectedBookmark.paper}
                  onAddToChat={() => handleAddToChat(selectedBookmark)}
                />
              </Box>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
