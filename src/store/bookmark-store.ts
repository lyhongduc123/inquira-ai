/**
 * Bookmark Store - Client-side bookmark state management
 * Tracks bookmarked paper IDs for quick visualization
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookmarkStore {
  bookmarks: Record<string, number>;

  addBookmark: (paperId: string, bookmarkId: number) => void;
  removeBookmark: (paperId: string) => void;
  isBookmarked: (paperId: string) => boolean;
  getBookmarkId: (paperId: string) => number | undefined;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: {},

      addBookmark: (paperId, bookmarkId) =>
        set((state) => ({
          bookmarks: { ...state.bookmarks, [paperId]: bookmarkId },
        })),

      removeBookmark: (paperId) =>
        set((state) => {
          const newBookmarks = { ...state.bookmarks };
          delete newBookmarks[paperId];
          return { bookmarks: newBookmarks };
        }),

      isBookmarked: (paperId) => !!get().bookmarks[paperId],

      getBookmarkId: (paperId) => get().bookmarks[paperId],
    }),
    {
      name: "bookmark-storage",
    },
  ),
);
