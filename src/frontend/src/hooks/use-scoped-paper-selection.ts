import { useEffect, useMemo } from "react";

import { useScopedPaperSelectionStore } from "@/store/scoped-paper-selection-store";
import type { PaperMetadata } from "@/types/paper.type";

interface UseScopedPaperSelectionResult {
  selectedScopedPapers: PaperMetadata[];
  selectedScopedPaperIds: string[];
  mergeScopedPapers: (papers: PaperMetadata[]) => void;
  toggleScopedPaper: (paperId: string) => void;
  removeScopedPaper: (paperId: string) => void;
  clearScopedPapers: () => void;
}

export function useScopedPaperSelection(
  availablePapersMap?: Map<string, PaperMetadata>,
): UseScopedPaperSelectionResult {
  const selectedScopedPapers = useScopedPaperSelectionStore(
    (state) => state.selectedScopedPapers,
  );
  const setAvailablePapers = useScopedPaperSelectionStore(
    (state) => state.setAvailablePapers,
  );
  const mergeScopedPapers = useScopedPaperSelectionStore(
    (state) => state.mergeScopedPapers,
  );
  const toggleScopedPaper = useScopedPaperSelectionStore(
    (state) => state.toggleScopedPaper,
  );
  const removeScopedPaper = useScopedPaperSelectionStore(
    (state) => state.removeScopedPaper,
  );
  const clearScopedPapers = useScopedPaperSelectionStore(
    (state) => state.clearScopedPapers,
  );

  useEffect(() => {
    if (!availablePapersMap) return;

    setAvailablePapers(Array.from(availablePapersMap.values()));
  }, [availablePapersMap, setAvailablePapers]);

  const selectedScopedPaperIds = useMemo(
    () => selectedScopedPapers.map((paper) => paper.paperId),
    [selectedScopedPapers],
  );

  return {
    selectedScopedPapers,
    selectedScopedPaperIds,
    mergeScopedPapers,
    toggleScopedPaper,
    removeScopedPaper,
    clearScopedPapers,
  };
}
