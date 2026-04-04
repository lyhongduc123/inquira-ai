"use client";

import { BookmarkSearchBar } from "./BookmarkSearchBar";
import { BookmarkArea } from "./BookmarkArea";
import { Bookmark } from "@/lib/api";
import { useMemo, useState } from "react";
import { VStack } from "@/components/layout/vstack";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { ChatInput } from "@/app/_components/_shared/ChatInput";
import { HStack } from "@/components/layout/hstack";
import { TypographyP } from "@/components/global/typography";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { saveChatLaunchPayload } from "@/lib/scoped-chat-selection";
import { toast } from "sonner";
import { Box } from "@/components/layout/box";

export function BookmarkPageClient() {
  const { data: bookmarks, isLoading, isError, refetch } = useBookmarks();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScopedPaperIds, setSelectedScopedPaperIds] = useState<string[]>([]);

  const filteredBookmarks = useMemo(() => {
    if (!bookmarks?.items) return [];
    if (!searchQuery.trim()) return bookmarks.items;

    const query = searchQuery.toLowerCase();
    return bookmarks.items.filter((bookmark: Bookmark) => {
      const paper = bookmark.paper;
      if (!paper) return false;

      if (paper.title?.toLowerCase().includes(query)) return true;
      if (
        paper.authors?.some((author) =>
          author.name?.toLowerCase().includes(query),
        )
      )
        return true;

      if (paper.venue?.toLowerCase().includes(query)) return true;
      if (bookmark.notes?.toLowerCase().includes(query)) return true;

      return false;
    });
  }, [bookmarks, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const visiblePaperIds = useMemo(
    () =>
      new Set(
        filteredBookmarks
          .map((bookmark) => bookmark.paper?.paperId)
          .filter((paperId): paperId is string => Boolean(paperId)),
      ),
    [filteredBookmarks],
  );

  const visibleSelectedScopedPaperIds = useMemo(
    () => selectedScopedPaperIds.filter((paperId) => visiblePaperIds.has(paperId)),
    [selectedScopedPaperIds, visiblePaperIds],
  );

  const scopedPapers = useMemo(
    () =>
      filteredBookmarks
        .map((bookmark) => bookmark.paper)
        .filter((paper): paper is NonNullable<typeof paper> => Boolean(paper))
        .filter((paper) => visibleSelectedScopedPaperIds.includes(paper.paperId)),
      [filteredBookmarks, visibleSelectedScopedPaperIds],
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

  const scopeIndicator = (
    <HStack className="items-center gap-2 px-1 py-0.5">
      <Badge variant="default" className="text-xs">
        Selected ({scopedPapers.length})
      </Badge>
      {searchQuery.trim() && (
        <TypographyP size="xs" variant="muted" className="truncate max-w-[280px]">
          Filter: {searchQuery.trim()}
        </TypographyP>
      )}
    </HStack>
  );

  return (
    <VStack className="relative h-full w-full max-w-7xl p-8 pb-28 gap-4 items-center">
      <BookmarkSearchBar onSearch={handleSearch} />
      <BookmarkArea
        data={filteredBookmarks}
        isLoading={isLoading}
        isError={isError}
        isEmpty={!filteredBookmarks.length && !searchQuery}
        refetch={refetch}
        selectedScopedPaperIds={visibleSelectedScopedPaperIds}
        onToggleScopedPaper={toggleScopedPaper}
        onSetAllScopedPapers={setAllScopedPapers}
      />
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
