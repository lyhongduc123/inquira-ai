/**
 * Event-Driven Chat Hook (v2)
 * 
 * Uses the new event-driven architecture with task submission and resumable streaming.
 * 
 * Architecture:
 * 1. Submit task → POST /api/chat/submit → Get task_id
 * 2. Stream events → GET /api/chat/stream/{task_id}?from_sequence=N
 * 3. Page reload → Resume from last sequence number
 * 
 * Benefits:
 * - Pipeline continues running even if user reloads page
 * - Reconnectable with sequence tracking
 * - Non-blocking API
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Message } from "@/types/message.type";
import { useConversation } from "./use-conversation";
import { useConversationStore } from "@/store/conversation-store";
import { useAuthStore } from "@/store/auth-store";
import { useProgressStore } from "@/store/progress-store";
import { ProgressEvent } from "@/lib/stream/event.types";
import { chatApi } from "@/lib/api/chat-api";
import { authApi } from "@/lib/api/auth-api";
import { toast } from "sonner";
import {
  getScopedCitationKey,
  mergeScopedCitationRefs,
} from "@/lib/scoped-citation-utils";
import type { ScopedCitationRef } from "@/lib/scoped-citation-utils";

interface UseEventDrivenChatOptions {
  onConversationCreated?: (conversationId: string) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: () => void;
}

interface StreamState {
  isStreaming: boolean;
  isError: boolean;
  lastFailedQuery: string | null;
  activeTaskId: string | null;
  lastSequence: number;
}

interface TaskSubmitPayload {
  query: string;
  conversationId?: string;
  filters?: Record<string, unknown>;
  pipeline?: "research" | "agent";
  clientMessageId?: string;
}

type RetryPayload = Omit<TaskSubmitPayload, "clientMessageId">;

const ACTIVE_TASK_KEY = "exegent_active_task";
const TASK_SEQUENCE_KEY = "exegent_task_sequence";

export function useEventDrivenChat(options: UseEventDrivenChatOptions = {}) {
  const {
    onConversationCreated,
    onProgress,
    onError: onErrorCallback,
  } = options;
  
  const { createConversation } = useConversation();
  const messages = useConversationStore((state) => state.messages);
  const setMessages = useConversationStore((state) => state.setMessages);
  const { startQuery, setStepCount, addProgress, completeQuery } = useProgressStore();

  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    isError: false,
    lastFailedQuery: null,
    activeTaskId: null,
    lastSequence: 0,
  });

  const accumulatedTextRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const currentQueryIdRef = useRef<string | null>(null);
  const lastRetryPayloadRef = useRef<RetryPayload | null>(null);
  const pendingAssistantChunkRef = useRef("");
  const chunkFlushFrameRef = useRef<number | null>(null);

  const ensureAccessToken = useCallback(async () => {
    if (!refreshInFlightRef.current) {
      refreshInFlightRef.current = authApi
        .refreshToken()
        .then(() => undefined)
        .finally(() => {
          refreshInFlightRef.current = null;
        });
    }

    await refreshInFlightRef.current;
  }, []);

  const fetchWithAuthRetry = useCallback(
    async (input: RequestInfo | URL, init: RequestInit): Promise<Response> => {
      const requestInit: RequestInit = {
        ...init,
        credentials: "include",
      };

      let response = await fetch(input, requestInit);
      if (response.status !== 401) {
        return response;
      }

      try {
        await ensureAccessToken();
      } catch (refreshError) {
        const { isAuthenticated, logout } = useAuthStore.getState();
        if (isAuthenticated) {
          await logout();
        }
        throw refreshError;
      }

      response = await fetch(input, requestInit);
      return response;
    },
    [ensureAccessToken],
  );

  const resetStreamState = useCallback(() => {
    setStreamState((prev) => ({
      ...prev,
      isError: false,
      lastFailedQuery: null,
    }));
  }, []);

  const addUserMessage = useCallback(
    (text: string, queryId: string, messageId: string) => {
      const currentMessages = useConversationStore.getState().messages;
      setMessages([
        ...currentMessages,
        {
          role: "user",
          text,
          metadata: { query_id: queryId, client_message_id: messageId },
        } as Message,
      ]);
    },
    [setMessages]
  );

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
        console.log("Ignoring update for old conversation");
        return;
      }

      const currentMessages = useConversationStore.getState().messages;
      const last = currentMessages[currentMessages.length - 1];

      if (!last || last.role !== "assistant") {
        return;
      }

      setMessages([...currentMessages.slice(0, -1), { ...last, ...updates }]);
    },
    [setMessages]
  );

  const flushAssistantChunks = useCallback(() => {
    if (!pendingAssistantChunkRef.current) {
      return;
    }

    accumulatedTextRef.current += pendingAssistantChunkRef.current;
    pendingAssistantChunkRef.current = "";
    updateLastMessage({ text: accumulatedTextRef.current });
  }, [updateLastMessage]);

  const scheduleChunkFlush = useCallback(() => {
    if (chunkFlushFrameRef.current !== null) {
      return;
    }

    chunkFlushFrameRef.current = window.requestAnimationFrame(() => {
      chunkFlushFrameRef.current = null;
      flushAssistantChunks();
    });
  }, [flushAssistantChunks]);

  const appendScopedQuoteRef = useCallback(
    (ref: ScopedCitationRef) => {
      const currentConvId =
        useConversationStore.getState().currentConversationId;

      if (currentConvId !== activeConversationIdRef.current) {
        return;
      }

      const currentMessages = useConversationStore.getState().messages;
      const last = currentMessages[currentMessages.length - 1];

      if (!last || last.role !== "assistant") {
        return;
      }

      const mergedRefs = mergeScopedCitationRefs(last.scopedQuoteRefs, ref);

      setMessages([
        ...currentMessages.slice(0, -1),
        {
          ...last,
          scopedQuoteRefs: mergedRefs,
        },
      ]);
    },
    [setMessages]
  );

  /**
   * Stream events from a task (with reconnection support)
   */
  const streamTaskEvents = useCallback(
    async (taskId: string, fromSequence: number = 0) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      abortControllerRef.current = new AbortController();
      
      // Store task for resume on page reload
      localStorage.setItem(ACTIVE_TASK_KEY, taskId);
      localStorage.setItem(TASK_SEQUENCE_KEY, fromSequence.toString());

      setStreamState((prev) => ({
        ...prev,
        isStreaming: true,
        activeTaskId: taskId,
        lastSequence: fromSequence,
      }));

      try {
        const url = chatApi.getEventDrivenStreamUrl(taskId, fromSequence);
        const response = await fetchWithAuthRetry(url, {
          signal: abortControllerRef.current.signal,
          headers: {
            Accept: "text/event-stream",
          },
        });

        if (!response.ok) {
          const rawErrorText = await response.text();
          let errorDetail = rawErrorText;

          try {
            const parsed = JSON.parse(rawErrorText) as Record<string, unknown>;
            errorDetail = String(
              parsed.detail
              || parsed.message
              || parsed.error
              || rawErrorText,
            );
          } catch {
            // keep raw text fallback
          }

          const message = errorDetail?.trim()
            ? errorDetail
            : `Unable to stream response (HTTP ${response.status})`;

          throw new Error(message);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let currentSequence = fromSequence;

        const handleParsedEvent = async (
          eventType: string,
          parsed: Record<string, unknown>,
        ) => {
          const sequenceValue = Number(parsed.sequence);
          currentSequence = Number.isFinite(sequenceValue)
            ? sequenceValue
            : currentSequence;

          // Update stored sequence
          localStorage.setItem(TASK_SEQUENCE_KEY, currentSequence.toString());
          setStreamState((prev) => ({
            ...prev,
            lastSequence: currentSequence,
          }));

          // Handle event types
          switch (eventType) {
            case "step": // Progress update
              if (String(parsed.type || "") === "step_count") {
                if (currentQueryIdRef.current) {
                  const totalStepsValue = Number(parsed.total_steps);
                  if (Number.isFinite(totalStepsValue) && totalStepsValue >= 0) {
                    setStepCount(currentQueryIdRef.current, totalStepsValue);
                  }
                }
                break;
              }

              if (currentQueryIdRef.current) {
                const progressType = String(
                  parsed.type || parsed.phase || "reasoning",
                );
                const metadata: Record<string, unknown> = {
                  ...(typeof parsed.metadata === "object" && parsed.metadata !== null
                    ? (parsed.metadata as Record<string, unknown>)
                    : {}),
                };

                if (typeof parsed.current_step === "number") {
                  metadata.current_step = parsed.current_step;
                }

                if (typeof parsed.total_steps === "number") {
                  metadata.total_steps = parsed.total_steps;
                }

                const progressEvent: ProgressEvent = {
                  type: progressType as ProgressEvent["type"],
                  content: String(parsed.content || parsed.message || ""),
                  metadata,
                };
                addProgress(currentQueryIdRef.current, progressEvent);
                onProgress?.(progressEvent);
              }
              break;

            case "metadata": // Paper metadata
              if (parsed.type === "papers_metadata" && Array.isArray(parsed.papers)) {
                updateLastMessage({
                  paperSnapshots: parsed.papers as Message["paperSnapshots"],
                });
              } else if (parsed.type === "quote_ref") {
                const paperId = String(parsed.paper_id || "").trim();
                const chunkId = String(parsed.chunk_id || "").trim();
                const marker = String(parsed.marker || "").trim();

                if (paperId && chunkId) {
                  const quoteRef: ScopedCitationRef = {
                    paperId,
                    chunkId,
                    marker:
                      marker
                      || `(cite:${paperId}|${chunkId}${parsed.char_start !== undefined && parsed.char_end !== undefined ? `|${parsed.char_start}|${parsed.char_end}` : ""})`,
                    quote:
                      typeof parsed.quote === "string"
                        ? parsed.quote
                        : null,
                    section:
                      typeof parsed.section === "string"
                        ? parsed.section
                        : null,
                    charStart:
                      typeof parsed.char_start === "number"
                        ? parsed.char_start
                        : null,
                    charEnd:
                      typeof parsed.char_end === "number"
                        ? parsed.char_end
                        : null,
                  };

                  const normalizedMarker = quoteRef.marker
                    || getScopedCitationKey(quoteRef);

                  appendScopedQuoteRef({
                    ...quoteRef,
                    marker: normalizedMarker,
                  });
                }
              }
              break;

            case "chunk": // Response text
              if (parsed.content) {
                pendingAssistantChunkRef.current += String(parsed.content);
                scheduleChunkFlush();
              }
              break;

            case "reasoning":
              break;

            case "ping":
              break;

            case "done": // Completion
              flushAssistantChunks();

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
              }

              localStorage.removeItem(ACTIVE_TASK_KEY);
              localStorage.removeItem(TASK_SEQUENCE_KEY);

              setStreamState((prev) => ({
                ...prev,
                isStreaming: false,
                activeTaskId: null,
              }));
              return true;

            case "error":
              throw new Error(String(parsed.message || "Pipeline failed"));

            default:
              console.warn("Unknown event type:", eventType, parsed);
          }

          return false;
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          buffer = buffer.replace(/\r\n/g, "\n");

          let separatorIdx = buffer.indexOf("\n\n");
          while (separatorIdx !== -1) {
            const rawEvent = buffer.slice(0, separatorIdx);
            buffer = buffer.slice(separatorIdx + 2);

            if (rawEvent.trim()) {
              let eventType = "";
              const dataLines: string[] = [];

              for (const rawLine of rawEvent.split("\n")) {
                const line = rawLine.trimEnd();

                if (line.startsWith("event:")) {
                  eventType = line.slice(6).trim();
                } else if (line.startsWith("data:")) {
                  let content = line.slice(5);
                  if (content.startsWith(" ")) {
                    content = content.slice(1);
                  }
                  dataLines.push(content);
                }
              }

              if (eventType && dataLines.length > 0) {
                const eventDataRaw = dataLines.join("\n");
                try {
                  let parsed: Record<string, unknown>;
                  try {
                    const parsedJson: unknown = JSON.parse(eventDataRaw);
                    parsed =
                      typeof parsedJson === "object" && parsedJson !== null
                        ? (parsedJson as Record<string, unknown>)
                        : { content: String(parsedJson) };
                  } catch {
                    parsed = { content: eventDataRaw };
                  }

                  const shouldStop = await handleParsedEvent(eventType, parsed);
                  if (shouldStop) {
                    return;
                  }
                } catch (parseError) {
                  console.error("Failed to parse event data:", parseError);
                }
              }
            }

            separatorIdx = buffer.indexOf("\n\n");
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Stream error:", error);
          const failedQuery = lastRetryPayloadRef.current?.query ?? null;
          flushAssistantChunks();

          const streamErrorMessage =
            error.message || "Error: Failed to get response from server.";

          updateLastMessage({
            text: streamErrorMessage,
            done: true,
            isError: true,
          });

          toast.error("Streaming failed", {
            description: streamErrorMessage,
          });

          if (currentQueryIdRef.current) {
            completeQuery(currentQueryIdRef.current);
          }

          onErrorCallback?.();
          setStreamState((prev) => ({
            ...prev,
            isStreaming: false,
            isError: true,
            lastFailedQuery: failedQuery,
          }));
        }
      } finally {
        if (chunkFlushFrameRef.current !== null) {
          window.cancelAnimationFrame(chunkFlushFrameRef.current);
          chunkFlushFrameRef.current = null;
        }
        abortControllerRef.current = null;
      }
    },
    [
      appendScopedQuoteRef,
      flushAssistantChunks,
      updateLastMessage,
      addProgress,
      completeQuery,
      fetchWithAuthRetry,
      onProgress,
      onErrorCallback,
      scheduleChunkFlush,
    ]
  );

  // Restore active task on mount (for page reload)
  useEffect(() => {
    const savedTaskId = localStorage.getItem(ACTIVE_TASK_KEY);
    const savedSequenceRaw = localStorage.getItem(TASK_SEQUENCE_KEY);

    if (!savedTaskId || !savedSequenceRaw || streamState.isStreaming) {
      return;
    }

    const parsedSequence = Number.parseInt(savedSequenceRaw, 10);
    const fromSequence = Number.isNaN(parsedSequence) ? 0 : parsedSequence + 1;

    void streamTaskEvents(savedTaskId, fromSequence);
  }, [streamState.isStreaming, streamTaskEvents]);

  /**
   * Submit a new chat message
   */
  const sendMessage = useCallback(
    async (payload: TaskSubmitPayload) => {
      const {
        query,
        conversationId,
        filters,
        pipeline = "research",
        clientMessageId,
      } = payload;

      lastRetryPayloadRef.current = {
        query,
        conversationId,
        filters,
        pipeline,
      };

      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort("replaced-by-new-request");
      }

      resetStreamState();

      // Generate IDs
      const messageId =
        clientMessageId ||
        `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const queryId = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Reset accumulated stream text for this request to avoid leaking text
      // from previous assistant responses.
      accumulatedTextRef.current = "";
      
      currentQueryIdRef.current = queryId;

      // Initialize progress tracking
      startQuery(queryId, query, conversationId);

      // Add user message
      addUserMessage(query, queryId, messageId);

      const { isAuthenticated } = useAuthStore.getState();
      let finalConversationId = conversationId;

      // Create conversation if needed
      if (!finalConversationId && isAuthenticated) {
        try {
          const newConversation = await createConversation(query);
          finalConversationId = newConversation.id;
          
          if (finalConversationId) {
            onConversationCreated?.(finalConversationId);
            startQuery(queryId, query, finalConversationId);
          }
        } catch (error) {
          console.error("Error creating conversation:", error);
          throw error;
        }
      }

      // Track active conversation
      activeConversationIdRef.current = finalConversationId || null;

      // Add assistant message placeholder
      addAssistantMessage();

      try {
        // Submit task to backend
        const response = await fetchWithAuthRetry(chatApi.getEventDrivenSubmitUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            conversation_id: finalConversationId,
            filters,
            pipeline,
            client_message_id: messageId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to submit task: ${response.statusText}`);
        }

        const result = await response.json();
        const taskId = result?.data?.taskId ?? result?.data?.task_id;

        if (!taskId) {
          throw new Error("Missing task id from submit response");
        }

        console.log(`Task ${taskId} submitted, starting stream...`);

        // Stream events from task
        await streamTaskEvents(taskId, 0);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to submit message.";
        console.error("Send message error:", error);
        updateLastMessage({
          text: `Error: ${errorMessage}`,
          done: true,
          isError: true,
        });

        toast.error("Message failed", {
          description: errorMessage,
        });

        if (currentQueryIdRef.current) {
          completeQuery(currentQueryIdRef.current);
        }

        onErrorCallback?.();
        setStreamState((prev) => ({
          ...prev,
          isStreaming: false,
          isError: true,
          lastFailedQuery: query,
        }));
      } finally {
        activeConversationIdRef.current = null;
        currentQueryIdRef.current = null;
      }
    },
    [
      resetStreamState,
      startQuery,
      addUserMessage,
      addAssistantMessage,
      createConversation,
      onConversationCreated,
      streamTaskEvents,
      fetchWithAuthRetry,
      updateLastMessage,
      completeQuery,
      onErrorCallback,
    ]
  );

  const retry = useCallback(() => {
    const retryPayload = lastRetryPayloadRef.current;

    if (retryPayload?.query || streamState.lastFailedQuery) {
      // Remove error assistant message
      const currentMessages = useConversationStore.getState().messages;
      const lastMsg = currentMessages[currentMessages.length - 1];

      if (lastMsg && lastMsg.role === "assistant") {
        setMessages(currentMessages.slice(0, -1));
      }

      const currentConversationId =
        useConversationStore.getState().currentConversationId;

      void sendMessage({
        query: retryPayload?.query || streamState.lastFailedQuery || "",
        conversationId:
          currentConversationId || retryPayload?.conversationId || undefined,
        filters: retryPayload?.filters,
        pipeline: retryPayload?.pipeline || "research",
      });
    }
  }, [streamState.lastFailedQuery, setMessages, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    resetStreamState();
    
    // Clear any stored task
    localStorage.removeItem(ACTIVE_TASK_KEY);
    localStorage.removeItem(TASK_SEQUENCE_KEY);
  }, [setMessages, resetStreamState]);

  const setMessagesDirectly = useCallback(
    (newMessages: Message[]) => {
      setMessages(newMessages);
    },
    [setMessages]
  );

  return {
    messages,
    isStreaming: streamState.isStreaming,
    isError: streamState.isError,
    activeTaskId: streamState.activeTaskId,
    sendMessage,
    retry,
    clearMessages,
    setMessages: setMessagesDirectly,
  };
}
