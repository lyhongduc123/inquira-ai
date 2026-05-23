import { useCallback, useRef } from "react";
import { conversationsApi } from "@/lib/api/conversations-api";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "@/types/message.type";
import { MessageProgressEventDTO } from "@/types/message.type";
import { useConversationStore } from "@/store/conversation-store";
import { ConversationDTO } from "@/types/conversation.type";
import { PaperMetadata } from "@/types/paper.type";
import { toast } from "sonner";
import { getErrorMessage, isNotFoundError } from "@/lib/react-query/error-utils";
import { conversationKeys } from "@/hooks/use-conversations";

function normalizeProgressEvent(raw: unknown): MessageProgressEventDTO {
  const src =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const metadata =
    src.metadata && typeof src.metadata === "object"
      ? { ...(src.metadata as Record<string, unknown>) }
      : null;

  if (metadata) {
    const totalPapers = metadata.total_papers ?? metadata.totalPapers;
    const ingestedCount = metadata.ingested_count ?? metadata.ingestedCount;
    const processedWithPymupdf =
      metadata.processed_with_pymupdf ?? metadata.processedWithPymupdf;

    if (typeof totalPapers === "number") {
      metadata.total_papers = totalPapers;
    }

    if (typeof ingestedCount === "number") {
      metadata.ingested_count = ingestedCount;
    }

    if (typeof processedWithPymupdf === "number") {
      metadata.processed_with_pymupdf = processedWithPymupdf;
    }
  }

  const pipelineType =
    (typeof src.pipeline_type === "string" && src.pipeline_type) ||
    (typeof src.pipelineType === "string" && src.pipelineType) ||
    (typeof metadata?.pipeline_type === "string" && metadata.pipeline_type) ||
    (typeof metadata?.pipelineType === "string" && metadata.pipelineType) ||
    null;

  return {
    type: String(src.type || "unknown"),
    content: typeof src.content === "string" ? src.content : "",
    metadata,
    pipeline_type: pipelineType,
    timestamp: typeof src.timestamp === "number" ? src.timestamp : Date.now(),
  };
}

export function useConversation() {
  const queryClient = useQueryClient();
  const currentConversationId = useConversationStore(
    (state) => state.currentConversationId,
  );
  const isLoadingMessages = useConversationStore(
    (state) => state.isLoadingMessages,
  );
  const setCurrentConversationId = useConversationStore(
    (state) => state.setCurrentConversationId,
  );
  const setMessages = useConversationStore((state) => state.setMessages);
  const setIsLoadingMessages = useConversationStore(
    (state) => state.setIsLoadingMessages,
  );
  const clearConversation = useConversationStore(
    (state) => state.clearConversation,
  );
  const incrementRefreshTrigger = useConversationStore(
    (state) => state.incrementRefreshTrigger,
  );
  const setNewConversationId = useConversationStore(
    (state) => state.setNewConversationId,
  );
  const setPendingConversationDraft = useConversationStore(
    (state) => state.setPendingConversationDraft,
  );
  const setRecentlyDeletedConversationId = useConversationStore(
    (state) => state.setRecentlyDeletedConversationId,
  );

  const latestCreateRequestRef = useRef<number>(0);
  const latestLoadRequestRef = useRef<number>(0);

  const createConversation = useCallback(
    async (title?: string): Promise<ConversationDTO> => {
      const requestId = ++latestCreateRequestRef.current;

      const normalizedTitle = (title || "New conversation").trim() || "New conversation";
      setPendingConversationDraft({
        id: `pending-${requestId}`,
        title: normalizedTitle,
      });

      try {
        const conversation = await conversationsApi.create({ title: normalizedTitle });
        if (!conversation.id) {
          throw new Error("Conversation creation returned no id");
        }

        // Only update state if this is still the latest request
        if (requestId === latestCreateRequestRef.current) {
          setCurrentConversationId(conversation.id);
          setNewConversationId(conversation.id);
          incrementRefreshTrigger();
        }

        return conversation;
      } finally {
        if (requestId === latestCreateRequestRef.current) {
          setPendingConversationDraft(null);
        }
      }
    },
    [
      setCurrentConversationId,
      setNewConversationId,
      incrementRefreshTrigger,
      setPendingConversationDraft,
    ],
  );

  const loadConversation = useCallback(
    async (conversationId: string): Promise<Message[]> => {
      const requestId = ++latestLoadRequestRef.current;

      setIsLoadingMessages(true);
      setCurrentConversationId(conversationId);

      try {
        const conversation = await conversationsApi.get(conversationId);
        queryClient.setQueryData(
          conversationKeys.detail(conversationId),
          conversation,
        );

        if (!conversation) {
          throw new Error(`Conversation ${conversationId} not found in cache or API response`);
        }

        if (requestId !== latestLoadRequestRef.current) {
          return [];
        }

        const loadedMessages: Message[] = conversation.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          text: msg.content,
          done: true,
          paperSnapshots: [...(msg.paperSnapshots || [])] as PaperMetadata[],
          progressEvents: Array.isArray(msg.progressEvents)
            ? msg.progressEvents.map(normalizeProgressEvent)
            : undefined,
          scopedQuoteRefs: msg.scopedQuoteRefs || undefined,
        }));

        // messages loaded

        setMessages(loadedMessages);
        return loadedMessages;
      } catch (error) {
        console.error("Failed to load conversation messages:", error);

        const isRecentlyDeleted =
          useConversationStore.getState().recentlyDeletedConversationId ===
          conversationId;

        if (requestId === latestLoadRequestRef.current && !isRecentlyDeleted) {
          const description = isNotFoundError(error)
            ? "This conversation is unavailable or was deleted."
            : getErrorMessage(error);

          toast.error("Failed to load conversation", {
            description,
          });
        }

        if (requestId === latestLoadRequestRef.current) {
          setMessages([]);
        }
        return [];
      } finally {
        if (requestId === latestLoadRequestRef.current) {
          setIsLoadingMessages(false);
        }
      }
    },
    [
      setCurrentConversationId,
      setIsLoadingMessages,
      setMessages,
      queryClient,
    ],
  );

  const resetConversation = useCallback(() => {
    latestLoadRequestRef.current += 1;
    clearConversation();
    incrementRefreshTrigger();
  }, [incrementRefreshTrigger, clearConversation]);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (conversationId === currentConversationId) {
        setRecentlyDeletedConversationId(conversationId);
        resetConversation();
        return true;
      }
      return false;
    },
    [currentConversationId, resetConversation, setRecentlyDeletedConversationId],
  );

  const updateConversationTitle = useCallback(
    async (conversationId: string, title: string): Promise<boolean> => {
      try {
        await conversationsApi.update(conversationId, { title });
        incrementRefreshTrigger();
        return true;
      } catch (error) {
        console.error("Failed to update conversation title:", error);
        return false;
      }
    },
    [incrementRefreshTrigger],
  );

  return {
    currentConversationId,
    isLoadingMessages,
    loadConversation,
    resetConversation,
    deleteConversation,
    createConversation,
    updateConversationTitle,
  };
}
