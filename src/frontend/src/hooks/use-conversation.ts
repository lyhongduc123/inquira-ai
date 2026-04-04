import { useCallback, useRef } from "react";
import { conversationsApi } from "@/lib/api/conversations-api";
import { Message } from "@/types/message.type";
import { useConversationStore } from "@/store/conversation-store";
import { Conversation } from "@/types/conversation.type";
import { PaperMetadata } from "@/types/paper.type";
import { toast } from "sonner";
import { getErrorMessage, isNotFoundError } from "@/lib/react-query/error-utils";

export function useConversation() {
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

  const latestCreateRequestRef = useRef<number>(0);
  const latestLoadRequestRef = useRef<number>(0);

  const createConversation = useCallback(
    async (title?: string): Promise<Conversation> => {
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

      if (conversationId === currentConversationId) {
        return [];
      }

      const { abortStream } = useConversationStore.getState();
      if (abortStream) {
        abortStream();
      }

      setIsLoadingMessages(true);
      setCurrentConversationId(conversationId);

      try {
        const conversation = await conversationsApi.get(conversationId);
        if (requestId !== latestLoadRequestRef.current) {
          return [];
        }

        const loadedMessages: Message[] = conversation.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          text: msg.content,
          done: true,
          paperSnapshots: [...(msg.paperSnapshots || [])] as PaperMetadata[],
          progressEvents: msg.progressEvents || undefined,
          scopedQuoteRefs: msg.scopedQuoteRefs || undefined,
        }));

        setMessages(loadedMessages);
        return loadedMessages;
      } catch (error) {
        console.error("Failed to load conversation messages:", error);

        if (requestId === latestLoadRequestRef.current) {
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
      currentConversationId,
      setCurrentConversationId,
      setIsLoadingMessages,
      setMessages,
    ],
  );

  const resetConversation = useCallback(() => {
    latestLoadRequestRef.current += 1;
    clearConversation();
    incrementRefreshTrigger();
    setNewConversationId(null);
    setPendingConversationDraft(null);
  }, [clearConversation, incrementRefreshTrigger, setNewConversationId, setPendingConversationDraft]);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (conversationId === currentConversationId) {
        resetConversation();
        return true;
      }
      return false;
    },
    [currentConversationId, resetConversation],
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
