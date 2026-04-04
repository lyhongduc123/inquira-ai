import { PaperMetadata } from "@/types/paper.type";
import { create } from "zustand";

export type SidebarContentType = "paper" | "reference" | null;
export type SidebarContent = PaperMetadata | null;

interface DetailSidebarState {
  isOpen: boolean;
  contentType: SidebarContentType;
  content: SidebarContent;
  open: (contentType: SidebarContentType, content: SidebarContent) => void;
  close: () => void;
}

/**
 * Generic store for managing the detail sidebar
 * Can display different types of content (papers, references, etc.)
 */
export const useDetailSidebarStore = create<DetailSidebarState>((set) => ({
  isOpen: false,
  contentType: null,
  content: null,
  open: (contentType, content) => set({ isOpen: true, contentType, content }),
  close: () => set({ isOpen: false, contentType: null, content: null }),
}));

export const usePaperDetailSidebarStore = useDetailSidebarStore;
