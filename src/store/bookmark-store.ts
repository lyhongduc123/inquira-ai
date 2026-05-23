import { create } from "zustand";

interface BookmarkStore {
  bookmarksByPaperId: Record<string, number>;
  addBookmark: (paperId: string, bookmarkId: number) => void;
  addBookmarks: (bookmarks: Array<{ paperId: string; bookmarkId: number }>) => void;
  removeBookmark: (paperId: string) => void;
  removeBookmarkById: (bookmarkId: number) => void;
  clearBookmarks: () => void;
  isBookmarked: (paperId: string) => boolean;
  getBookmarkId: (paperId: string) => number | undefined;
}

export const useBookmarkStore = create<BookmarkStore>()((set, get) => ({
  bookmarksByPaperId: {},

  addBookmark: (paperId, bookmarkId) =>
    set((state) => ({
      bookmarksByPaperId: {
        ...state.bookmarksByPaperId,
        [paperId]: bookmarkId,
      },
    })),

  addBookmarks: (bookmarks) =>
    set((state) => {
      const next = { ...state.bookmarksByPaperId };
      for (const bookmark of bookmarks) {
        next[bookmark.paperId] = bookmark.bookmarkId;
      }
      return { bookmarksByPaperId: next };
    }),

  removeBookmark: (paperId) =>
    set((state) => {
      const next = { ...state.bookmarksByPaperId };
      delete next[paperId];
      return { bookmarksByPaperId: next };
    }),

  removeBookmarkById: (bookmarkId) =>
    set((state) => {
      const next = { ...state.bookmarksByPaperId };
      for (const [paperId, storedBookmarkId] of Object.entries(next)) {
        if (storedBookmarkId === bookmarkId) {
          delete next[paperId];
          break;
        }
      }
      return { bookmarksByPaperId: next };
    }),

  clearBookmarks: () => set({ bookmarksByPaperId: {} }),

  isBookmarked: (paperId) => get().bookmarksByPaperId[paperId] !== undefined,

  getBookmarkId: (paperId) => get().bookmarksByPaperId[paperId],
}));
