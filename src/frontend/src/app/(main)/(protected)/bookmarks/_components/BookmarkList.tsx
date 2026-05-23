"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDownIcon,
  Trash2,
} from "lucide-react";
import { Bookmark } from "@/lib/api";
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
import {
  PaperDetailContent,
  PaperDetailFooter,
} from "@/app/(main)/_components/PaperDetailContent";
import { Separator } from "@/components/ui/separator";
import { Box } from "@/components/layout/box";
import { useRouter } from "next/navigation";
import { saveChatLaunchPayload } from "@/lib/scoped-chat-selection";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateTime } from "@/lib/utils";
import { SortField, SortState } from "./BookmarkPageClient";
import { useUpdateBookmark } from "@/hooks/use-bookmarks";

interface BookmarkListProps {
  isLoading?: boolean;
  data?: Bookmark[];
  onRemoveBookmark: (paperId: string) => void;
  selectedScopedPaperIds?: string[];
  onToggleScopedPaper?: (paperId: string, checked: boolean) => void;
  onSetAllScopedPapers?: (paperIds: string[], checked: boolean) => void;

  sort?: SortState;
  filters?: { isOpenAccess?: boolean; hasNotes?: boolean };
  onSortChange?: (sort: SortField) => void;
  onFiltersChange?: (filters: {
    isOpenAccess?: boolean;
    hasNotes?: boolean;
  }) => void;
}

export function BookmarkList({
  data = [],
  onRemoveBookmark,
  selectedScopedPaperIds = [],
  onToggleScopedPaper,
  onSetAllScopedPapers,

  sort,
  onSortChange,
}: BookmarkListProps) {
  const router = useRouter();
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const updateBookmark = useUpdateBookmark();

  const selectablePaperIds = data
    .map((bookmark) => bookmark.paper?.paperId)
    .filter((paperId): paperId is string => Boolean(paperId));

  const selectedCount = selectablePaperIds.filter((paperId) =>
    selectedScopedPaperIds.includes(paperId),
  ).length;

  const allSelected =
    selectablePaperIds.length > 0 &&
    selectedCount === selectablePaperIds.length;
  const someSelected =
    selectedCount > 0 && selectedCount < selectablePaperIds.length;

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

    try {
      const updatedBookmark = await updateBookmark.mutateAsync({
        bookmarkId: selectedBookmark.id,
        data: { notes: editedNotes },
      });
      setSelectedBookmark({ ...selectedBookmark, notes: updatedBookmark.notes });
    } catch (error) {
      toast.error("Failed to update notes");
      console.error("Error updating notes:", error);
    }
  };

  const columns: ColumnDef<Bookmark>[] = [
    {
      id: "scoped",
      size: 40,
      minSize: 40,
      maxSize: 40,
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
      size: 40,
      header: "#",
      cell: ({ row }) => (
        <div className="text-muted-foreground whitespace-nowrap">
          {row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "paper.title",
      header: "Title",
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
    // {
    //   accessorKey: "paper.authors",
    //   header: "Authors",
    //   cell: ({ row }) => (
    //     <div className="max-w-sm">
    //       <span className="text-sm line-clamp-2 truncate">
    //         {row.original.paper?.authors
    //           ?.map((a) => a.name)
    //           .join(", ") || "—"}
    //       </span>
    //     </div>
    //   ),
    // },
    {
      accessorKey: "paper.citationCount",
      size: 80,
      header: () => {
        const isActive = sort?.field === "citations";
        const isAsc = sort?.order === "asc";
        return (
          <Button
            variant="clean"
            size="icon"
            onClick={() => {
              onSortChange?.("citations");
            }}
            className="w-fit cursor-pointer hover:text-special"
          >
            Citations
            {isActive ? (
              isAsc ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )
            ) : (
              <ArrowUpDownIcon className="size-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="font-semibold">
          {row.original.paper?.citationCount ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "paper.year",
      size: 50,
      header: () => {
        const isActive = sort?.field === "year";
        const isAsc = sort?.order === "asc";
        return (
          <Button
            variant="clean"
            size="icon"
            onClick={() => {
              onSortChange?.("year");
            }}
            className="w-fit cursor-pointer hover:text-special"
          >
            Year
            {isActive ? (
              isAsc ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )
            ) : (
              <ArrowUpDownIcon className="size-4" />
            )}
          </Button>
        );
      },
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
      size: 60,
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
      accessorKey: "saveDate",
      size: 100,
      header: "Saved Date",
      cell: ({ row }) => (
        <div>
          <span className="text-sm text-muted-foreground line-clamp-1 truncate">
            {formatDateTime(row.original.createdAt)}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      size: 52,
      minSize: 52,
      maxSize: 52,
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onRemoveBookmark(row.original.paperId);
          }}
          aria-label="Remove bookmark"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      ),
    },
  ];

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
                <SheetTitle>Paper</SheetTitle>
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
                        updateBookmark.isPending || editedNotes === selectedBookmark.notes
                      }
                    >
                      {updateBookmark.isPending ? "Saving..." : "Save Notes"}
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
