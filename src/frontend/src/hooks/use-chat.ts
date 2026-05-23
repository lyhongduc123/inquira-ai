import { useState, useRef, useCallback } from "react";
import { Message } from "@/types/message.type";
import { streamEvent, streamTask, StreamEventPayload } from "@/lib/stream/stream";
import { useConversation } from "./use-conversation";
import { useConversationStore } from "@/store/conversation-store";
import { chatApi } from "@/lib/api/chat-api";
import { useProgressStore } from "@/store/progress-store";
import { ConversationEvent, ProgressEvent } from "@/lib/stream/event.types";
import { ChatSubmitResponse } from "@/types/task.type";
import { toast } from "sonner";
import {
  appendAssistantMessage,
  appendUserMessage,
  updateActiveAssistantMessage,
} from "./chat/chat-message-actions";
import {
  clearStoredAgentTask,
  storeAgentTask,
} from "./chat/agent-task-storage";
import { ABORT_REASON, isAbortError } from "./chat/chat-errors";
import { ChatStreamState } from "./chat/chat-types";
import { createStreamCallbacks } from "./chat/create-stream-callbacks";
import { useAgentTaskResume } from "./chat/use-agent-task-resume";

interface UseChatOptions {
  apiEndpoint?: string;
  onConversationCreated?: (conversationId: string) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: () => void;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    onConversationCreated,
    onProgress,
    onError: onErrorCallback,
  } = options;
  useConversation();

  const currentConversationId = useConversationStore(
    (state) => state.currentConversationId,
  );
  const isLoadingMessages = useConversationStore(
    (state) => state.isLoadingMessages,
  );
  const messages = useConversationStore((state) => state.messages);
  const latestMetadataEvent = useConversationStore(
    (state) => state.latestMetadataEvent,
  );
  const setMessages = useConversationStore((state) => state.setMessages);
  const setLatestMetadataEvent = useConversationStore(
    (state) => state.setLatestMetadataEvent,
  );
  const { startQuery, addProgress, completeQuery } = useProgressStore();

  const [streamState, setStreamState] = useState<ChatStreamState>({
    isStreaming: false,
    isReading: false,
    isError: false,
    lastFailedQuery: null,
    lastClientMessageId: null,
  });
  const [pendingInputMessage, setPendingInputMessage] = useState<string | null>(null);

  const accumulatedTextRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const activeAgentTaskIdRef = useRef<string | null>(null);
  const currentQueryIdRef = useRef<string | null>(null);
  const restoredAgentTaskIdRef = useRef<string | null>(null);

  const resetStreamState = useCallback(() => {
    setStreamState((prev) => ({
      ...prev,
      isError: false,
      lastFailedQuery: null,
      lastClientMessageId: null,
    }));
  }, []);

  const addAssistantMessage = useCallback(() => {
    appendAssistantMessage(setMessages);
  }, [setMessages]);

  const updateLastMessage = useCallback(
    (updates: Partial<Message>) => {
      updateActiveAssistantMessage(
        activeConversationIdRef.current,
        updates,
        setMessages,
      );
    },
    [setMessages],
  );

  const sendMessage = useCallback(
    async (payload: StreamEventPayload) => {
      const {
        query,
        conversationId,
        isRetry = false,
        clientMessageId,
        pipeline = "research",
        model,
        filters,
      } = payload;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort(ABORT_REASON);
      }
      activeAgentTaskIdRef.current = null;
      restoredAgentTaskIdRef.current = null;

      if (!isRetry) {
        resetStreamState();
      }

      if (pipeline !== "agent") {
        clearStoredAgentTask();
      }

      setLatestMetadataEvent(null);

      let finalConversationId = conversationId;
      const failureHandledRef = { current: false };
      const messageId =
        clientMessageId ||
        `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const abortActiveStream = () => {
        abortControllerRef.current?.abort(ABORT_REASON);
      };

      const markFailed = (error: unknown) => {
        if (isAbortError(error) || failureHandledRef.current) {
          return;
        }

        failureHandledRef.current = true;
        console.error("Streaming error:", error);

        if (
          useConversationStore.getState().currentConversationId ===
          activeConversationIdRef.current
        ) {
          updateLastMessage({
            text: "",
            done: true,
            isError: true,
            metadata: {
              ...(useConversationStore.getState().messages.at(-1)?.metadata || {}),
              error_message:
                error instanceof Error
                  ? error.message
                  : "Error: Failed to get response from server.",
            },
          });
        }

        if (currentQueryIdRef.current) {
          completeQuery(currentQueryIdRef.current);
        }

        onErrorCallback?.();
        setPendingInputMessage(query);
        toast.error("Something wrong happened, please try again");
        setStreamState({
          isStreaming: false,
          isReading: false,
          isError: true,
          lastFailedQuery: query,
          lastClientMessageId: messageId,
        });
      };

      const handleConversationEvent = (event: ConversationEvent) => {
        const newId = event.conversation_id;
        const newTitle = event.title;

        if (newId && newId !== finalConversationId) {
          finalConversationId = newId;
          activeConversationIdRef.current = newId;
          if (currentQueryIdRef.current) {
            startQuery(currentQueryIdRef.current, query, newId);
          }

          onConversationCreated?.(newId);
        }

        if (newTitle) {
          useConversationStore.getState().setCurrentConversationTitle(newTitle);
        }
      };

      const callbacks = createStreamCallbacks({
        query,
        messageId,
        accumulatedTextRef,
        getQueryId: () => currentQueryIdRef.current,
        setStreamState,
        setLatestMetadataEvent,
        updateLastMessage,
        addProgress,
        completeQuery,
        onProgress,
        onError: onErrorCallback,
        onConversation: handleConversationEvent,
        onDone: () => {
          clearStoredAgentTask(activeAgentTaskIdRef.current || undefined);
        },
        onStreamError: (error) => {
          clearStoredAgentTask(activeAgentTaskIdRef.current || undefined);
          console.error("Stream error:", error);
          updateLastMessage({
            text: "",
            done: true,
            isError: true,
            metadata: {
              ...(useConversationStore.getState().messages.at(-1)?.metadata || {}),
              error_message: error.message,
            },
          });
          setPendingInputMessage(query);
          toast.error("Something wrong happened, please try again");
        },
        failureHandledRef,
      });

      const runAgentFlow = async () => {
        const submitEndpoint = chatApi.getAgentSubmitUrl();
        const response = await fetch(submitEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            conversationId: finalConversationId || undefined,
            pipeline,
            filters,
            model,
            clientMessageId: messageId,
          }),
          credentials: "include",
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to submit agent task: ${response.status} ${errorText}`);
        }

        const submitData = (await response.json()) as
          | { data?: ChatSubmitResponse }
          | ChatSubmitResponse;
        const submitPayload = "data" in submitData && submitData.data
          ? submitData.data
          : (submitData as ChatSubmitResponse);

        const taskId = submitPayload.taskId;
        const submittedConversationId = submitPayload.conversationId;

        if (
          submittedConversationId &&
          submittedConversationId !== finalConversationId
        ) {
          finalConversationId = submittedConversationId;
          activeConversationIdRef.current = submittedConversationId;

          if (currentQueryIdRef.current) {
            startQuery(currentQueryIdRef.current, query, submittedConversationId);
          }

          onConversationCreated?.(submittedConversationId);
        }

        storeAgentTask({
          taskId,
          conversationId: finalConversationId || submittedConversationId,
          query,
          clientMessageId: messageId,
          createdAt: Date.now(),
        });
        activeAgentTaskIdRef.current = taskId;

        await streamTask(chatApi.getStreamEventsUrl(taskId), callbacks, {
          signal: abortControllerRef.current?.signal,
          heartbeatTimeout: 0,
        });
      };

      const runDirectFlow = async () => {
        await streamEvent(
          chatApi.getStreamUrl(),
          {
            query,
            conversationId: finalConversationId || undefined,
            pipeline: pipeline as "research",
            filters,
            paperIds: Array.isArray(filters?.paperIds)
              ? (filters.paperIds as string[])
              : undefined,
            model: model || undefined,
            clientMessageId: messageId,
          },
          callbacks,
          {
            signal: abortControllerRef.current?.signal,
            heartbeatTimeout: 0,
          },
        );
      };

      currentQueryIdRef.current = queryId;
      startQuery(queryId, query, conversationId);

      if (!isRetry) {
        appendUserMessage(query, queryId, messageId, setMessages);
      }

      activeConversationIdRef.current = finalConversationId || null;
      addAssistantMessage();

      setStreamState((prev) => ({ ...prev, isStreaming: true, isReading: false }));
      accumulatedTextRef.current = "";
      abortControllerRef.current = new AbortController();
      useConversationStore.getState().setAbortStream(abortActiveStream);

      try {
        if (pipeline === "agent") {
          await runAgentFlow();
        } else {
          await runDirectFlow();
        }
      } catch (error) {
        markFailed(error);
      } finally {
        setStreamState((prev) => ({ ...prev, isStreaming: false, isReading: false }));
        abortControllerRef.current = null;
        activeConversationIdRef.current = null;
        activeAgentTaskIdRef.current = null;
        currentQueryIdRef.current = null;
        useConversationStore.getState().setAbortStream(null);
      }
    },
    [
      onConversationCreated,
      onProgress,
      onErrorCallback,
      resetStreamState,
      addAssistantMessage,
      updateLastMessage,
      startQuery,
      addProgress,
      completeQuery,
      setLatestMetadataEvent,
      setMessages,
    ],
  );

  useAgentTaskResume({
    currentConversationId,
    isLoadingMessages,
    isStreaming: streamState.isStreaming,
    accumulatedTextRef,
    abortControllerRef,
    activeConversationIdRef,
    activeAgentTaskIdRef,
    currentQueryIdRef,
    restoredAgentTaskIdRef,
    setStreamState,
    setMessages,
    setLatestMetadataEvent,
    updateLastMessage,
    startQuery,
    addProgress,
    completeQuery,
    onProgress,
    onError: onErrorCallback,
  });

  const retry = useCallback(() => {
    if (streamState.lastFailedQuery && streamState.lastClientMessageId) {
      const currentMessages = useConversationStore.getState().messages;
      const lastMsg = currentMessages[currentMessages.length - 1];

      if (lastMsg && lastMsg.role === "assistant") {
        setMessages(currentMessages.slice(0, -1));
      }

      const conversationId =
        useConversationStore.getState().currentConversationId;

      sendMessage({
        query: streamState.lastFailedQuery,
        conversationId: conversationId || undefined,
        isRetry: true,
        clientMessageId: streamState.lastClientMessageId,
      });
    }
  }, [
    streamState.lastFailedQuery,
    streamState.lastClientMessageId,
    setMessages,
    sendMessage,
  ]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    clearStoredAgentTask();
    resetStreamState();
  }, [setMessages, resetStreamState]);

  const clearPendingInputMessage = useCallback(() => {
    setPendingInputMessage(null);
  }, []);

  const setMessagesDirectly = useCallback(
    (newMessages: Message[]) => {
      setMessages(newMessages);
    },
    [setMessages],
  );

  return {
    messages,
    latestMetadataEvent,
    isStreaming: streamState.isStreaming,
    isReading: streamState.isReading,
    isError: streamState.isError,
    sendMessage,
    retry,
    clearMessages,
    setMessages: setMessagesDirectly,
    pendingInputMessage,
    clearPendingInputMessage,
  };
}
