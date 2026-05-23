/**
 * React hooks for bookmarks
 */

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarksApi, type CreateBookmarkRequest, type UpdateBookmarkRequest } from "@/lib/api";
import type { BookmarkCheckResponse, BookmarkListParams } from "@/lib/api/bookmarks-api";
import { defaultRetry, defaultRetryDelay, handleMutationError, handleMutationSuccess } from "@/lib/react-query/react-query-utils";
import { useQueryWithError } from "./use-query-with-error";
import { useAuthStore } from "@/store/auth-store";
import { useBookmarkStore } from "@/store/bookmark-store";

type DeleteBookmarkInput = number | { bookmarkId: number; paperId?: string };

function bookmarkCheckKey(paperId: string) {
  return ["bookmark-check", paperId] as const;
}

function normalizeDeleteInput(input: DeleteBookmarkInput) {
  return typeof input === "number" ? { bookmarkId: input } : input;
}

export function useBookmarks(params: BookmarkListParams = {}) {
  const {
    skip = 0,
    limit = 50,
    query,
    year,
    isOpenAccess,
    hasNotes,
    sortBy,
    sortOrder,
  } = params;

  const normalizedQuery = query?.trim() || undefined;
  const addBookmarks = useBookmarkStore((state) => state.addBookmarks);

  const bookmarksQuery = useQueryWithError({
    queryKey: ["bookmarks", skip, limit, normalizedQuery, year, isOpenAccess, hasNotes, sortBy, sortOrder],
    queryFn: () =>
      bookmarksApi.list({
        skip,
        limit,
        query: normalizedQuery,
        year,
        isOpenAccess,
        hasNotes,
        sortBy,
        sortOrder,
      }),
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
    staleTime: 0,
    refetchOnMount: "always",
  }, 'Failed to load bookmarks');

  useEffect(() => {
    const items = bookmarksQuery.data?.items;
    if (!items?.length) return;

    addBookmarks(
      items.map((bookmark) => ({
        paperId: bookmark.paperId,
        bookmarkId: bookmark.id,
      })),
    );
  }, [addBookmarks, bookmarksQuery.data?.items]);

  return bookmarksQuery;
}

export function useBookmark(bookmarkId: number) {
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const bookmarkQuery = useQueryWithError({
    queryKey: ["bookmark", bookmarkId],
    queryFn: () => bookmarksApi.get(bookmarkId),
    enabled: !!bookmarkId,
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to load bookmark');

  useEffect(() => {
    if (bookmarkQuery.data) {
      addBookmark(bookmarkQuery.data.paperId, bookmarkQuery.data.id);
    }
  }, [addBookmark, bookmarkQuery.data]);

  return bookmarkQuery;
}

export function useCheckBookmark(paperId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cachedBookmarkId = useBookmarkStore((state) => state.getBookmarkId(paperId));
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  const checkQuery = useQueryWithError({
    queryKey: bookmarkCheckKey(paperId),
    queryFn: () => bookmarksApi.check(paperId),
    enabled: !!paperId && isAuthenticated && cachedBookmarkId === undefined,
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to check bookmark status');

  useEffect(() => {
    const status = checkQuery.data;
    if (!status) return;

    if (status.isBookmarked && status.bookmarkId !== null) {
      addBookmark(paperId, status.bookmarkId);
    } else {
      removeBookmark(paperId);
    }
  }, [addBookmark, checkQuery.data, paperId, removeBookmark]);

  return checkQuery;
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  return useMutation({
    mutationFn: (data: CreateBookmarkRequest) => bookmarksApi.create(data),
    onMutate: (variables) => {
      addBookmark(variables.paperId, -1);
    },
    onSuccess: (bookmark) => {
      addBookmark(bookmark.paperId, bookmark.id);
      queryClient.setQueryData<BookmarkCheckResponse>(
        bookmarkCheckKey(bookmark.paperId),
        { isBookmarked: true, bookmarkId: bookmark.id },
      );
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      handleMutationSuccess("Bookmark added successfully");
    },
    onError: (error, variables) => {
      removeBookmark(variables.paperId);
      handleMutationError(error, "add bookmark");
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookmarkId, data }: { bookmarkId: number; data: UpdateBookmarkRequest }) =>
      bookmarksApi.update(bookmarkId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmark", variables.bookmarkId] });
      handleMutationSuccess("Bookmark updated successfully");
    },
    onError: (error) => {
      handleMutationError(error, "update bookmark");
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const removeBookmarkById = useBookmarkStore((state) => state.removeBookmarkById);

  return useMutation({
    mutationFn: (input: DeleteBookmarkInput) => {
      const { bookmarkId } = normalizeDeleteInput(input);
      return bookmarksApi.delete(bookmarkId);
    },
    onMutate: (input) => {
      const { bookmarkId, paperId } = normalizeDeleteInput(input);
      if (paperId) {
        removeBookmark(paperId);
      } else {
        removeBookmarkById(bookmarkId);
      }
    },
    onSuccess: (_, input) => {
      const { paperId } = normalizeDeleteInput(input);
      if (paperId) {
        queryClient.setQueryData<BookmarkCheckResponse>(
          bookmarkCheckKey(paperId),
          { isBookmarked: false, bookmarkId: null },
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ["bookmark-check"] });
      }
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      handleMutationSuccess("Bookmark removed successfully");
    },
    onError: (error, input) => {
      const { bookmarkId, paperId } = normalizeDeleteInput(input);
      if (paperId) {
        useBookmarkStore.getState().addBookmark(paperId, bookmarkId);
      }
      queryClient.invalidateQueries({ queryKey: ["bookmark-check"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      handleMutationError(error, "remove bookmark");
    },
  });
}

export function useToggleBookmark(paperId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: bookmarkStatus, isLoading: isChecking } = useCheckBookmark(paperId);
  const isBookmarkedInStore = useBookmarkStore((state) => state.isBookmarked(paperId));
  const storedBookmarkId = useBookmarkStore((state) => state.getBookmarkId(paperId));
  const createMutation = useCreateBookmark();
  const deleteMutation = useDeleteBookmark();

  const toggle = () => {
    if (!isAuthenticated) return;

    const isBookmarked = Boolean(bookmarkStatus?.isBookmarked || isBookmarkedInStore);
    const bookmarkId = bookmarkStatus?.bookmarkId ?? storedBookmarkId;

    if (isBookmarked) {
      if (!bookmarkId) return;
      deleteMutation.mutate({ bookmarkId, paperId });
    } else {
      createMutation.mutate({ paperId });
    }
  };

  const isPending = isChecking || createMutation.isPending || deleteMutation.isPending;

  return {
    isBookmarked: Boolean(bookmarkStatus?.isBookmarked || isBookmarkedInStore),
    bookmarkId: bookmarkStatus?.bookmarkId ?? storedBookmarkId ?? null,
    toggle,
    isPending,
  };
}
