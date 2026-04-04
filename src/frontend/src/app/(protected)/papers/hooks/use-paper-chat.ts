import { useState, useRef, useCallback } from "react";
import { Message } from "@/types/message.type";
import { streamEvent } from "@/lib/stream/stream";
import { MetadataEvent, ProgressEvent } from "@/lib/stream/event.types";

interface UsePaperChatOptions {
  paperId: string;
  onConversationCreated?: (conversationId: string) => void;
  onError?: () => void;
}

interface ConversationEvent {
  conversation_id: string;
  conversation_type: string;
  primary_paper_id: string;
}

interface StreamState {
  isStreaming: boolean;
  isError: boolean;
  lastFailedQuery: string | null;
}

/**
 * Hook for managing paper-specific chat conversations
 * Uses the /api/v1/chat/stream/paper/{paper_id} endpoint
 */
export function usePaperChat(options: UsePaperChatOptions) {
  const { paperId, onConversationCreated, onError: onErrorCallback } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    isError: false,
    lastFailedQuery: null,
  });

  const accumulatedTextRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetStreamState = useCallback(() => {
    setStreamState((prev) => ({
      ...prev,
      isError: false,
      lastFailedQuery: null,
    }));
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { role: "user", text } as Message]);
  }, []);

  const addAssistantMessage = useCallback(() => {
    setMessages((prev) => [...prev, { role: "assistant", text: "" } as Message]);
  }, []);

  const updateLastMessage = useCallback((updates: Partial<Message>) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, ...updates }];
    });
  }, []);

  const sendMessage = useCallback(
    async (query: string, model?: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      resetStreamState();

      // Add user message
      addUserMessage(query);
      addAssistantMessage();

      setStreamState((prev) => ({ ...prev, isStreaming: true }));
      accumulatedTextRef.current = "";
      abortControllerRef.current = new AbortController();

      try {
        await streamEvent(
          `/api/v1/chat/stream/paper/${paperId}`,
          {
            query,
            conversationId: conversationId || undefined,
            model,
          },
          {
            onUnknownEvent: (eventType: string, data: unknown) => {
              // Handle conversation event from backend
              if (eventType === "conversation") {
                const convEvent = data as ConversationEvent;
                if (convEvent.conversation_id && !conversationId) {
                  setConversationId(convEvent.conversation_id);
                  onConversationCreated?.(convEvent.conversation_id);
                }
              } else if (eventType === "paper") {
                // Paper metadata event - could be used for displaying paper info
                console.log("Paper metadata:", data);
              } else if (eventType === "thought") {
                // Thought/progress events
                console.log("Thought:", data);
              }
            },
            onMetadata: (event: MetadataEvent) => {
              if (event.content && event.content.length > 0) {
                updateLastMessage({ paperSnapshots: event.content });
              }
            },
            onProgress: (event: ProgressEvent) => {
              console.log("Progress event:", event.type, event.content);
            },
            onChunk: (chunk) => {
              accumulatedTextRef.current += chunk;
              updateLastMessage({ text: accumulatedTextRef.current });
            },
            onDone: () => {
              updateLastMessage({
                text: accumulatedTextRef.current,
                done: true,
              });
            },
            onError: (error) => {
              console.error("Stream error:", error);
              updateLastMessage({
                text:
                  error.message || "Error: Failed to get response from server.",
                done: true,
                isError: true,
              });

              onErrorCallback?.();
              setStreamState({
                isStreaming: false,
                isError: true,
                lastFailedQuery: query,
              });
            },
          },
          {
            signal: abortControllerRef.current.signal,
            heartbeatTimeout: 0,
          },
        );
      } catch (error) {
        console.error("Streaming error:", error);
        updateLastMessage({
          text: "Error: Failed to get response from server.",
          done: true,
          isError: true,
        });

        onErrorCallback?.();
        setStreamState({
          isStreaming: false,
          isError: true,
          lastFailedQuery: query,
        });
      } finally {
        setStreamState((prev) => ({ ...prev, isStreaming: false }));
        abortControllerRef.current = null;
      }
    },
    [
      paperId,
      conversationId,
      onConversationCreated,
      onErrorCallback,
      resetStreamState,
      addUserMessage,
      addAssistantMessage,
      updateLastMessage,
    ],
  );

  const retry = useCallback(() => {
    if (streamState.lastFailedQuery) {
      // Remove only the error assistant message (last message)
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        // Only remove if last message is an assistant error message
        if (lastMsg && lastMsg.role === "assistant") {
          return prev.slice(0, -1);
        }
        return prev;
      });

      // Resend the message
      sendMessage(streamState.lastFailedQuery);
    }
  }, [streamState.lastFailedQuery, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    resetStreamState();
  }, [resetStreamState]);

  return {
    messages,
    isStreaming: streamState.isStreaming,
    isError: streamState.isError,
    sendMessage,
    retry,
    clearMessages,
    conversationId,
  };
}
