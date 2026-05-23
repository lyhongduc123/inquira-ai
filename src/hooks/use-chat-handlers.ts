import { useCallback } from "react";
import { SearchFilters } from "@/app/(main)/_components/FilterPanel";
import { transformFiltersForBackend } from "@/lib/filter-utils";
import { ChatSendMessagePayload } from "@/types/chat.type";
import { getCurrentPipelineMode } from "@/store/pipeline-store";

interface ChatHandlersParams {
  currentConversationId: string | null;
  sendMessage: (payload: ChatSendMessagePayload) => Promise<void>;
  resetConversation: () => void;
  clearMessages: () => void;
  searchFilters?: SearchFilters;
  selectedScopedPaperIds?: string[];
  // Deprecated - kept for backward compatibility
  useHybridPipeline?: boolean;
}

/**
 * Hook for creating chat message handlers without navigation logic.
 * Components using these handlers should handle navigation themselves.
 */
export function useChatHandlers({
  currentConversationId,
  sendMessage,
  resetConversation,
  clearMessages,
  searchFilters,
  selectedScopedPaperIds = [],
  useHybridPipeline,
}: ChatHandlersParams) {
  
  const handleNewConversation = useCallback(() => {
    resetConversation();
    clearMessages();
  }, [resetConversation, clearMessages]);
  
  const handleSend = useCallback(async (query: string) => {
    const transformedFilters = transformFiltersForBackend(searchFilters) || {};
    const persistedPipeline = getCurrentPipelineMode();
    const effectivePipeline: "research" | "agent" =
      selectedScopedPaperIds.length > 0 ? "research" : persistedPipeline;

    if (selectedScopedPaperIds.length > 0) {
      transformedFilters.paperIds = selectedScopedPaperIds;
    }
    
    await sendMessage({ 
      query, 
      conversationId: currentConversationId || undefined,
      filters: Object.keys(transformedFilters).length > 0 ? transformedFilters : undefined,
      paperIds: selectedScopedPaperIds.length > 0 ? selectedScopedPaperIds : undefined,
      pipeline: effectivePipeline,
      useHybridPipeline: useHybridPipeline,
    } as ChatSendMessagePayload);
  }, [sendMessage, currentConversationId, searchFilters, selectedScopedPaperIds, useHybridPipeline]);
  
  return {
    handleSend,
    handleNewConversation,
  };
}
