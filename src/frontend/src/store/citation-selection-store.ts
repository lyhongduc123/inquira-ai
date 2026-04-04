import { create } from "zustand";

interface CitationSelectionState {
  activePaperId: string | null;
  activeChunkId: string | null;
  setActiveCitation: (paperId: string, chunkId?: string | null) => void;
  clearActiveCitation: () => void;
}

export const useCitationSelectionStore = create<CitationSelectionState>(
  (set) => ({
    activePaperId: null,
    activeChunkId: null,
    setActiveCitation: (paperId, chunkId = null) =>
      set({ activePaperId: paperId, activeChunkId: chunkId }),
    clearActiveCitation: () =>
      set({ activePaperId: null, activeChunkId: null }),
  }),
);
