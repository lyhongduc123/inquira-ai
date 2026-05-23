import { Dispatch, MutableRefObject, SetStateAction, useEffect } from "react";
import { streamTask } from "@/lib/stream/stream";
import { MetadataEvent, ProgressEvent } from "@/lib/stream/event.types";
import { chatApi } from "@/lib/api/chat-api";
import { Message } from "@/types/message.type";
import { useConversationStore } from "@/store/conversation-store";
import {
  clearStoredAgentTask,
  readStoredAgentTask,
} from "./agent-task-storage";
import { ABORT_REASON } from "./chat-errors";
import { ChatStreamState } from "./chat-types";
import { createStreamCallbacks } from "./create-stream-callbacks";
import { ensureAssistantPlaceholder } from "./chat-message-actions";

interface UseAgentTaskResumeParams {
  currentConversationId: string | null;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  accumulatedTextRef: MutableRefObject<string>;
  abortControllerRef: MutableRefObject<AbortController | null>;
  activeConversationIdRef: MutableRefObject<string | null>;
  activeAgentTaskIdRef: MutableRefObject<string | null>;
  currentQueryIdRef: MutableRefObject<string | null>;
  restoredAgentTaskIdRef: MutableRefObject<string | null>;
  setStreamState: Dispatch<SetStateAction<ChatStreamState>>;
  setMessages: (messages: Message[]) => void;
  setLatestMetadataEvent: (event: MetadataEvent | null) => void;
  updateLastMessage: (updates: Partial<Message>) => void;
  startQuery: (
    queryId: string,
    query: string,
    conversationId?: string | null,
  ) => void;
  addProgress: (queryId: string, event: ProgressEvent) => void;
  completeQuery: (queryId: string) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: () => void;
}

export function useAgentTaskResume({
  currentConversationId,
  isLoadingMessages,
  isStreaming,
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
  onError,
}: UseAgentTaskResumeParams) {
  useEffect(() => {
    const storedTask = readStoredAgentTask();
    if (!storedTask) {
      return;
    }

    if (
      isLoadingMessages ||
      isStreaming ||
      restoredAgentTaskIdRef.current === storedTask.taskId ||
      currentConversationId !== storedTask.conversationId
    ) {
      return;
    }

    restoredAgentTaskIdRef.current = storedTask.taskId;

    const queryId = `query-resume-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const abortActiveStream = () => {
      abortControllerRef.current?.abort(ABORT_REASON);
    };

    const currentMessages = useConversationStore.getState().messages;
    const hasStoredUserMessage = currentMessages.some(
      (message) =>
        message.role === "user" &&
        (message.metadata?.client_message_id === storedTask.clientMessageId ||
          message.text === storedTask.query),
    );
    const messagesWithUser = hasStoredUserMessage
      ? currentMessages
      : [
          ...currentMessages,
          {
            role: "user",
            text: storedTask.query,
            metadata: {
              query_id: queryId,
              client_message_id: storedTask.clientMessageId,
            },
          } as Message,
        ];
    const lastMessageWithUser = messagesWithUser[messagesWithUser.length - 1];

    if (lastMessageWithUser?.role === "assistant" && lastMessageWithUser.done) {
      clearStoredAgentTask(storedTask.taskId);
      restoredAgentTaskIdRef.current = null;
      return;
    }

    ensureAssistantPlaceholder(messagesWithUser, setMessages);

    accumulatedTextRef.current = "";
    currentQueryIdRef.current = queryId;
    activeConversationIdRef.current = storedTask.conversationId;
    activeAgentTaskIdRef.current = storedTask.taskId;
    abortControllerRef.current = new AbortController();
    useConversationStore.getState().setAbortStream(abortActiveStream);
    startQuery(queryId, storedTask.query, storedTask.conversationId);
    setStreamState((prev) => ({
      ...prev,
      isStreaming: true,
      isReading: false,
      isError: false,
      lastFailedQuery: null,
      lastClientMessageId: null,
    }));

    const callbacks = createStreamCallbacks({
      query: storedTask.query,
      messageId: storedTask.clientMessageId,
      accumulatedTextRef,
      getQueryId: () => queryId,
      setStreamState,
      setLatestMetadataEvent,
      updateLastMessage,
      addProgress,
      completeQuery,
      onProgress,
      onError,
      onConversation: (event) => {
        if (event.title) {
          useConversationStore.getState().setCurrentConversationTitle(event.title);
        }
      },
      onDone: () => {
        clearStoredAgentTask(storedTask.taskId);
      },
      onStreamError: (error) => {
        clearStoredAgentTask(storedTask.taskId);
        console.error("Agent stream resume error:", error);
        updateLastMessage({
          text: accumulatedTextRef.current,
          done: false,
          isError: true,
          metadata: {
            ...(useConversationStore.getState().messages.at(-1)?.metadata || {}),
            error_message: error.message,
          },
        });
      },
    });

    void streamTask(chatApi.getStreamEventsUrl(storedTask.taskId), callbacks, {
      signal: abortControllerRef.current.signal,
      heartbeatTimeout: 0,
    }).finally(() => {
      setStreamState((prev) => ({
        ...prev,
        isStreaming: false,
        isReading: false,
      }));
      abortControllerRef.current = null;
      activeConversationIdRef.current = null;
      activeAgentTaskIdRef.current = null;
      currentQueryIdRef.current = null;
      useConversationStore.getState().setAbortStream(null);
    });
  }, [
    abortControllerRef,
    accumulatedTextRef,
    activeAgentTaskIdRef,
    activeConversationIdRef,
    addProgress,
    completeQuery,
    currentConversationId,
    currentQueryIdRef,
    isLoadingMessages,
    isStreaming,
    onError,
    onProgress,
    restoredAgentTaskIdRef,
    setLatestMetadataEvent,
    setMessages,
    setStreamState,
    startQuery,
    updateLastMessage,
  ]);
}
