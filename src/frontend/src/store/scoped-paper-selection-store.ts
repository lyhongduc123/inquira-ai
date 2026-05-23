import { create } from "zustand";

import type { PaperMetadata } from "@/types/paper.type";

interface ScopedPaperSelectionState {
  selectedScopedPapers: PaperMetadata[];
  availablePapersById: Map<string, PaperMetadata>;
  setAvailablePapers: (papers: PaperMetadata[]) => void;
  mergeScopedPapers: (papers: PaperMetadata[]) => void;
  toggleScopedPaper: (paperId: string) => void;
  removeScopedPaper: (paperId: string) => void;
  clearScopedPapers: () => void;
}

export const useScopedPaperSelectionStore = create<ScopedPaperSelectionState>(
  (set, get) => ({
    selectedScopedPapers: [],
    availablePapersById: new Map<string, PaperMetadata>(),

    setAvailablePapers: (papers) =>
      set((state) => {
        const availablePapersById = new Map<string, PaperMetadata>();

        for (const paper of papers) {
          if (paper?.paperId) {
            availablePapersById.set(paper.paperId, paper);
          }
        }

        const selectedScopedPapers = state.selectedScopedPapers
          .map((paper) => {
            if (!paper?.paperId) return paper;
            return availablePapersById.get(paper.paperId) ?? paper;
          })
          .filter((paper): paper is PaperMetadata => Boolean(paper?.paperId));

        return {
          availablePapersById,
          selectedScopedPapers,
        };
      }),

    mergeScopedPapers: (papers) => {
      if (!papers || papers.length === 0) return;

      set((state) => {
        const mergedMap = new Map<string, PaperMetadata>();

        for (const paper of state.selectedScopedPapers) {
          if (paper?.paperId) {
            mergedMap.set(paper.paperId, paper);
          }
        }

        for (const paper of papers) {
          if (paper?.paperId) {
            mergedMap.set(paper.paperId, paper);
          }
        }

        return {
          selectedScopedPapers: Array.from(mergedMap.values()),
        };
      });
    },

    toggleScopedPaper: (paperId) => {
      const paper = get().availablePapersById.get(paperId);
      if (!paper) return;

      set((state) => {
        if (state.selectedScopedPapers.some((p) => p.paperId === paperId)) {
          return {
            selectedScopedPapers: state.selectedScopedPapers.filter(
              (p) => p.paperId !== paperId,
            ),
          };
        }

        return {
          selectedScopedPapers: [...state.selectedScopedPapers, paper],
        };
      });
    },

    removeScopedPaper: (paperId) =>
      set((state) => ({
        selectedScopedPapers: state.selectedScopedPapers.filter(
          (paper) => paper.paperId !== paperId,
        ),
      })),

    clearScopedPapers: () => set({ selectedScopedPapers: [] }),
  }),
);
