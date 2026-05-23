"use client";

import { BookmarkSearchBar } from "./BookmarkSearchBar";
import { BookmarkArea } from "./BookmarkArea";
import { useMemo, useState } from "react";
import { VStack } from "@/components/layout/vstack";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { ChatInput } from "@/app/(main)/_components/_shared/ChatInput";
import { HStack } from "@/components/layout/hstack";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { saveChatLaunchPayload } from "@/lib/scoped-chat-selection";
import { toast } from "sonner";
import { Box } from "@/components/layout/box";
import { Checkbox } from "@/components/ui/checkbox";
import pluralize from "pluralize";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BookmarkFiltersState {
  isOpenAccess?: boolean;
  hasNotes?: boolean;
}

export type SortField = "id" | "citations" | "year";
type SortOrder = "asc" | "desc";
export type SortState = {
  field?: SortField;
  order: SortOrder;
};

export function BookmarkPageClient() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BookmarkFiltersState>({});
  const [sort, setSort] = useState<SortState>({
    field: undefined,
    order: "desc",
  });
  const [selectedScopedPaperIds, setSelectedScopedPaperIds] = useState<
    string[]
  >([]);

  const listParams = useMemo(
    () => ({
      query: searchQuery.trim() || undefined,
      isOpenAccess: filters.isOpenAccess ? true : undefined,
      hasNotes: filters.hasNotes ? true : undefined,
      sortBy: sort.field,
      sortOrder: sort.field ? sort.order : undefined,
      skip: 0,
      limit: 50,
    }),
    [searchQuery, filters, sort],
  );

  const {
    data: bookmarks,
    isLoading,
    isError,
    refetch,
  } = useBookmarks(listParams);

  const visibleBookmarks = useMemo(() => bookmarks?.items || [], [bookmarks]);
  const visiblePaperIds = useMemo(
    () =>
      new Set(
        visibleBookmarks
          .map((bookmark) => bookmark.paper?.paperId)
          .filter((paperId): paperId is string => Boolean(paperId)),
      ),
    [visibleBookmarks],
  );
  const visibleSelectedScopedPaperIds = useMemo(
    () =>
      selectedScopedPaperIds.filter((paperId) => visiblePaperIds.has(paperId)),
    [selectedScopedPaperIds, visiblePaperIds],
  );
  const scopedPapers = useMemo(
    () =>
      visibleBookmarks
        .map((bookmark) => bookmark.paper)
        .filter((paper): paper is NonNullable<typeof paper> => Boolean(paper))
        .filter((paper) =>
          visibleSelectedScopedPaperIds.includes(paper.paperId),
        ),
    [visibleBookmarks, visibleSelectedScopedPaperIds],
  );

  const toggleScopedPaper = (paperId: string, checked: boolean) => {
    setSelectedScopedPaperIds((prev) => {
      if (checked) {
        if (prev.includes(paperId)) return prev;
        return [...prev, paperId];
      }
      return prev.filter((id) => id !== paperId);
    });
  };

  const setAllScopedPapers = (paperIds: string[], checked: boolean) => {
    setSelectedScopedPaperIds((prev) => {
      if (checked) {
        const merged = new Set([...prev, ...paperIds]);
        return Array.from(merged);
      }
      const removed = new Set(paperIds);
      return prev.filter((id) => !removed.has(id));
    });
  };

  const handleSendToMainChat = (query: string) => {
    if (scopedPapers.length === 0) {
      toast.error("Select at least one bookmarked paper to scope this chat");
      return;
    }

    const launchId = saveChatLaunchPayload({
      query,
      scopedPapers,
      source: "bookmarks",
    });

    if (!launchId) {
      toast.error("Unable to open chat right now");
      return;
    }

    router.push(`/?launch=${encodeURIComponent(launchId)}`);
  };

  const handleSortChange = (field: SortField) => {
    setSort((prev) => {
      if (prev.field !== field) {
        return { field, order: "desc" };
      }

      if (prev.order === "desc") {
        return { field, order: "asc" };
      }
      return { field: undefined, order: "desc" };
    });
  };

  const handleFiltersChange = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const scopeIndicator = (
    <HStack className="items-center gap-2 px-1 py-0.5">
      <Badge variant="default" className="text-xs">
        Selected ({scopedPapers.length})
      </Badge>
    </HStack>
  );

  return (
    <VStack className="relative h-full w-full max-w-7xl items-center">
      <VStack className="gap-4 w-full overflow-y-auto p-8 pb-42">
        <HStack className="items-center gap-2">
          <Box className="w-1/2">
            <BookmarkSearchBar value={searchQuery} onSearch={setSearchQuery} />
          </Box>

          <Label
            htmlFor="filter-open-access"
            className={cn(
              "text-sm items-center p-2 border rounded cursor-pointer",
              filters.isOpenAccess
                ? "border-primary bg-primary/10"
                : "hover:bg-muted",
            )}
          >
            <Checkbox
              id="filter-open-access"
              aria-label="Open Access"
              checked={filters.isOpenAccess || false}
              onCheckedChange={(checked) =>
                handleFiltersChange({
                  isOpenAccess: checked ? true : undefined,
                })
              }
            />
            Open Access
          </Label>
          <Label htmlFor="filter-has-notes"
            className={cn(
              "text-sm items-center p-2 border rounded cursor-pointer",
              filters.hasNotes
                ? "border-primary bg-primary/10"
                : "hover:bg-muted",
            )}>
            <Checkbox
              id="filter-has-notes"
              aria-label="Has Notes"
              checked={filters.hasNotes || false}
              onCheckedChange={(checked) =>
                handleFiltersChange({ hasNotes: checked ? true : undefined })
              }
            />
            Has Notes
          </Label>
        </HStack>
        <HStack className="w-1/2 items-center gap-2">
          <HStack className="items-center gap-2">
            <Badge variant="default" className="ml-auto ">
              {pluralize("result", bookmarks?.total || 0, true)}
            </Badge>
          </HStack>
        </HStack>
        <BookmarkArea
          data={visibleBookmarks}
          isLoading={isLoading}
          isError={isError}
          isEmpty={
            !visibleBookmarks.length &&
            !searchQuery &&
            !filters.isOpenAccess &&
            !filters.hasNotes
          }
          refetch={refetch}
          selectedScopedPaperIds={visibleSelectedScopedPaperIds}
          onToggleScopedPaper={toggleScopedPaper}
          onSetAllScopedPapers={setAllScopedPapers}
          sort={sort}
          filters={filters}
          onSortChange={handleSortChange}
          onFiltersChange={handleFiltersChange}
        />
      </VStack>
      <Box className="absolute bottom-0 left-0 right-0">
        <ChatInput
          onSend={handleSendToMainChat}
          placeholder="Ask from selected bookmarks in a new chat..."
          blockStart={scopeIndicator}
          isDisabled={isLoading}
          className="max-w-4xl px-8 pb-6 mx-auto"
        />
      </Box>
    </VStack>
  );
}
