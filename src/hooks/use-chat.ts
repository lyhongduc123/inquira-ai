import { useState, useRef, useCallback } from "react";
import { Message } from "@/types/message.type";
import { streamEvent, streamTask, StreamEventPayload } from "@/lib/stream/stream";
import { useConversation } from "./use-conversation";
import { useConversationStore } from "@/store/conversation-store";
import { useAuthStore } from "@/store/auth-store";
import { chatApi } from "@/lib/api/chat-api";
import { useProgressStore } from "@/store/progress-store";
import { MetadataEvent, ProgressEvent, StreamEvent, ConversationEvent } from "@/lib/stream/event.types";
import { ChatSubmitResponse } from "@/types/task.type";

interface UseChatOptions {
  apiEndpoint?: string;
  onConversationCreated?: (conversationId: string) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: () => void;
}

interface ChatStreamState {
  isStreaming: boolean;
  isAnalyzing: boolean;
  isError: boolean;
  lastFailedQuery: string | null;
  lastClientMessageId: string | null;
}

const ABORT_REASON = "stream_cancelled";

function isAbortError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (error instanceof Error) {
    return (
      error.name === "AbortError" ||
      error.message.toLowerCase().includes("aborted") ||
      error.message.toLowerCase().includes("stream_cancelled")
    );
  }

  return false;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    apiEndpoint = "/api/v1/chat/stream",
    onConversationCreated,
    onProgress,
    onError: onErrorCallback,
  } = options;
  const { createConversation } = useConversation();

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
    isAnalyzing: false,
    isError: false,
    lastFailedQuery: null,
    lastClientMessageId: null,
  });

  const accumulatedTextRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const currentQueryIdRef = useRef<string | null>(null);

  const resetStreamState = useCallback(() => {
    setStreamState((prev) => ({
      ...prev,
      isError: false,
      lastFailedQuery: null,
      lastClientMessageId: null,
    }));
  }, []);

  const addAssistantMessage = useCallback(() => {
    const currentMessages = useConversationStore.getState().messages;
    setMessages([
      ...currentMessages,
      { role: "assistant", text: "" } as Message,
    ]);
  }, [setMessages]);

  const updateLastMessage = useCallback(
    (updates: Partial<Message>) => {
      const currentConvId =
        useConversationStore.getState().currentConversationId;
      if (currentConvId !== activeConversationIdRef.current) {
        return;
      }

      const currentMessages = useConversationStore.getState().messages;
      const last = currentMessages[currentMessages.length - 1];
      setMessages([...currentMessages.slice(0, -1), { ...last, ...updates }]);
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
        useHybridPipeline,
        model,
        filters,
      } = payload;
      let finalConversationId = conversationId;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(ABORT_REASON);
      }

      if (!isRetry) {
        resetStreamState();
      }

      setLatestMetadataEvent(null);

      const messageId =
        clientMessageId ||
        `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      currentQueryIdRef.current = queryId;

      startQuery(queryId, query, conversationId);

      if (!isRetry) {
        const currentMessages = useConversationStore.getState().messages;
        setMessages([
          ...currentMessages,
          {
            role: "user",
            text: query,
            metadata: { query_id: queryId, client_message_id: messageId },
          } as Message,
        ]);
      }

      activeConversationIdRef.current = finalConversationId || null;

      addAssistantMessage();

      setStreamState((prev) => ({ ...prev, isStreaming: true, isAnalyzing: true }));
      accumulatedTextRef.current = "";
      abortControllerRef.current = new AbortController();
      useConversationStore.getState().setAbortStream(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort(ABORT_REASON);
        }
      });

      // Determine the correct flow: Agent uses task queue, Research/Scoped uses direct stream
      const isEventDriven = pipeline === "agent";

      const commonCallbacks = {
        onConversation: (event: ConversationEvent) => {
          const newId = event.conversation_id;
          const newTitle = event.title;

          if (newId && newId !== finalConversationId) {
            finalConversationId = newId;
            activeConversationIdRef.current = newId;
            if (currentQueryIdRef.current) {
              startQuery(currentQueryIdRef.current, query, newId);
            }
            
            // Update URL immediately via replaceState to avoid re-mounts
            onConversationCreated?.(newId);
          }

          if (newTitle) {
            useConversationStore.getState().setCurrentConversationTitle(newTitle);
          }
        },
        onMetadata: (event: MetadataEvent) => {
          setStreamState((prev) => ({ ...prev, isAnalyzing: false }));
          setLatestMetadataEvent(event);

          if (Array.isArray(event.content)) {
            updateLastMessage({ paperSnapshots: event.content });
          }
        },
        onProgress: (event: ProgressEvent) => {
          setStreamState((prev) => ({ ...prev, isAnalyzing: false }));
          if (currentQueryIdRef.current) {
            addProgress(currentQueryIdRef.current, event);
          }
          onProgress?.(event);
        },
        onChunk: (chunk: string) => {
          setStreamState((prev) => ({ ...prev, isAnalyzing: false }));
          accumulatedTextRef.current += chunk;
          updateLastMessage({ text: accumulatedTextRef.current });
        },
        onDone: () => {
          setStreamState((prev) => ({ ...prev, isAnalyzing: false }));
          
          if (currentQueryIdRef.current) {
            const queryProgress = useProgressStore
              .getState()
              .getQueryProgress(currentQueryIdRef.current);
            if (queryProgress && queryProgress.steps.length > 0) {
              updateLastMessage({
                text: accumulatedTextRef.current,
                done: true,
                progressEvents: queryProgress.steps,
              });
            } else {
              updateLastMessage({
                text: accumulatedTextRef.current,
                done: true,
              });
            }
            completeQuery(currentQueryIdRef.current);
          } else {
            updateLastMessage({
              text: accumulatedTextRef.current,
              done: true,
            });
          }
        },
        onError: (error: Error) => {
          if (isAbortError(error)) {
            return;
          }

          console.error("Stream error:", error);
          
          updateLastMessage({
            text: error.message || "Error: Failed to get response from server.",
            done: true,
            isError: true,
          });

          if (currentQueryIdRef.current) {
            completeQuery(currentQueryIdRef.current);
          }

          onErrorCallback?.();
          setStreamState({
            isStreaming: false,
            isAnalyzing: false,
            isError: true,
            lastFailedQuery: query,
            lastClientMessageId: messageId,
          });
        },
      };

      try {
        if (isEventDriven) {
          // flow: POST /agent -> task ID -> streamTask (GET)
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
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to submit agent task: ${response.status} ${errorText}`);
          }

          const submitData = (await response.json()) as { data: ChatSubmitResponse };
          const taskId = submitData.data.taskId;

          // Step 2: Stream events for the task
          const streamUrl = chatApi.getStreamEventsUrl(taskId);
          await streamTask(streamUrl, commonCallbacks, {
            signal: abortControllerRef.current.signal,
            heartbeatTimeout: 0,
          });
        } else {
          // Direct Stream flow (Research/Scoped): POST /stream -> streamEvent (POST)
          const streamUrl = chatApi.getStreamUrl();
          await streamEvent(
            streamUrl,
            {
              query,
              conversationId: finalConversationId || undefined,
              pipeline: pipeline as "research",
              filters: filters as any,
              model: model || undefined,
              clientMessageId: messageId,
            },
            commonCallbacks,
            {
              signal: abortControllerRef.current.signal,
              heartbeatTimeout: 0,
            }
          );
        }
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        console.error("Streaming error:", error);
        
        if (
          useConversationStore.getState().currentConversationId ===
          activeConversationIdRef.current
        ) {
          updateLastMessage({
            text: error instanceof Error ? error.message : "Error: Failed to get response from server.",
            done: true,
            isError: true,
          });
        }

        if (currentQueryIdRef.current) {
          completeQuery(currentQueryIdRef.current);
        }

        onErrorCallback?.();
        setStreamState({
          isStreaming: false,
          isAnalyzing: false,
          isError: true,
          lastFailedQuery: query,
          lastClientMessageId: messageId,
        });
      } finally {
        setStreamState((prev) => ({ ...prev, isStreaming: false, isAnalyzing: false }));
        abortControllerRef.current = null;
        activeConversationIdRef.current = null;
        currentQueryIdRef.current = null;
        useConversationStore.getState().setAbortStream(null);
      }
    },
    [
      apiEndpoint,
      onConversationCreated,
      onProgress,
      onErrorCallback,
      resetStreamState,
      addAssistantMessage,
      updateLastMessage,
      createConversation,
      startQuery,
      addProgress,
      completeQuery,
      setLatestMetadataEvent,
    ],
  );

  const retry = useCallback(() => {
    if (streamState.lastFailedQuery && streamState.lastClientMessageId) {
      // Remove only the error assistant message (last message)
      const currentMessages = useConversationStore.getState().messages;
      const lastMsg = currentMessages[currentMessages.length - 1];

      // Only remove if last message is an assistant error message
      if (lastMsg && lastMsg.role === "assistant") {
        setMessages(currentMessages.slice(0, -1));
      }

      // Get current conversation ID
      const conversationId =
        useConversationStore.getState().currentConversationId;

      // Resend the message with the existing conversation ID and client message ID
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
    resetStreamState();
  }, [setMessages, resetStreamState]);

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
    isAnalyzing: streamState.isAnalyzing,
    isError: streamState.isError,
    sendMessage,
    retry,
    clearMessages,
    setMessages: setMessagesDirectly,
  };
}
