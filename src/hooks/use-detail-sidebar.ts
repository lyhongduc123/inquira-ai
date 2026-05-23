import { useDetailSidebarStore } from "@/store/paper-detail-sidebar-store";
import { useCitationSelectionStore } from "@/store/citation-selection-store";
import { useSidebarManager } from "@/components/ui/sidebar";
import type { PaperMetadata } from "@/types/paper.type";

/**
 * Hook for managing the detail sidebar
 * Provides convenient methods for opening different content types
 */
export function useDetailSidebar() {
  const manager = useSidebarManager();
  const rightSidebar = manager.use("right");
  const {
    open,
    close,
    isOpen,
    contentType,
    content,
  } = useDetailSidebarStore();
  const clearActiveCitation = useCitationSelectionStore(
    (state) => state.clearActiveCitation,
  );

  const openPaper = (paper: PaperMetadata) => {
    const isSamePaperOpen =
      isOpen && contentType === "paper" && content?.paperId === paper.paperId;

    if (isSamePaperOpen) {
      close();
      rightSidebar?.setOpen(false);
      return;
    }

    open("paper", paper);
    rightSidebar?.setOpen(true);
  };

  const closeSidebar = () => {
    close();
    rightSidebar?.setOpen(false);
    clearActiveCitation();
  }

  return {
    isOpen,
    contentType,
    content,
    open,
    openPaper,
    closeSidebar
  };
}
