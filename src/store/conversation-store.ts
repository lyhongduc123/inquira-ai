import { create } from "zustand";
import { Message } from "@/types/message.type";
import { MetadataEvent } from "@/lib/stream/event.types";

interface ConversationState {
  currentConversationId: string | null;
  currentConversationTitle?: string;
  messages: Message[];
  isLoadingMessages: boolean;

  refreshTrigger: number;
  newConversationId: string | null; // Track newly created conversation for animation
  pendingConversationDraft: { id: string; title: string } | null;
  abortStream: (() => void) | null;
  latestMetadataEvent: MetadataEvent | null;

  // Actions
  setCurrentConversationId: (id: string | null) => void;
  setCurrentConversationTitle: (title: string | undefined) => void;
  setCurrentConversation: (
    conversationId: string | null,
    title?: string,
  ) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoadingMessages: (isLoading: boolean) => void;
  incrementRefreshTrigger: () => void;
  setNewConversationId: (id: string | null) => void;
  setPendingConversationDraft: (
    draft: { id: string; title: string } | null,
  ) => void;
  setAbortStream: (callback: (() => void) | null) => void;
  setLatestMetadataEvent: (event: MetadataEvent | null) => void;
  clearConversation: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  // Initial state
  currentConversationId: null,
  currentConversationTitle: undefined,
  messages: [],
  isLoadingMessages: false,
  isSidebarOpen: true,
  refreshTrigger: 0,
  newConversationId: null,
  pendingConversationDraft: null,
  abortStream: null,
  latestMetadataEvent: null,

  // Actions
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  setCurrentConversationTitle: (title) =>
    set({ currentConversationTitle: title }),
  setCurrentConversation: (conversationId, title) => {
    set({
      currentConversationId: conversationId,
      currentConversationTitle: title,
    });
  },
  setMessages: (messages) => set({ messages }),

  setIsLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),

  incrementRefreshTrigger: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

  setNewConversationId: (id) => set({ newConversationId: id }),

  setPendingConversationDraft: (draft) =>
    set({ pendingConversationDraft: draft }),

  setAbortStream: (callback) => set({ abortStream: callback }),

  setLatestMetadataEvent: (event) => set({ latestMetadataEvent: event }),

  clearConversation: () =>
    set((state) => {
      if (state.abortStream) {
        state.abortStream();
      }
      return {
        currentConversationId: null,
        currentConversationTitle: undefined,
        messages: [],
        isLoadingMessages: false,
        abortStream: null,
        latestMetadataEvent: null,
      };
    }),
}));
