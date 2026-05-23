import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { StreamCallbacks } from "@/lib/stream/stream";
import {
  ConversationEvent,
  MetadataEvent,
  ProgressEvent,
} from "@/lib/stream/event.types";
import { useProgressStore } from "@/store/progress-store";
import { Message } from "@/types/message.type";
import { ChatStreamState } from "./chat-types";
import { isAbortError } from "./chat-errors";

interface CreateStreamCallbacksParams {
  query: string;
  messageId?: string;
  accumulatedTextRef: MutableRefObject<string>;
  getQueryId: () => string | null;
  setStreamState: Dispatch<SetStateAction<ChatStreamState>>;
  setLatestMetadataEvent: (event: MetadataEvent | null) => void;
  updateLastMessage: (updates: Partial<Message>) => void;
  addProgress: (queryId: string, event: ProgressEvent) => void;
  completeQuery: (queryId: string) => void;
  onProgress?: (event: ProgressEvent) => void;
  onError?: () => void;
  onConversation?: (event: ConversationEvent) => void;
  onDone?: () => void;
  onStreamError?: (error: Error) => void;
  failureHandledRef?: MutableRefObject<boolean>;
}

export function createStreamCallbacks({
  query,
  messageId,
  accumulatedTextRef,
  getQueryId,
  setStreamState,
  setLatestMetadataEvent,
  updateLastMessage,
  addProgress,
  completeQuery,
  onProgress,
  onError,
  onConversation,
  onDone,
  onStreamError,
  failureHandledRef,
}: CreateStreamCallbacksParams): StreamCallbacks {
  let hasHandledFailure = false;

  return {
    onConversation,
    onMetadata: (event: MetadataEvent) => {
      setStreamState((prev) => ({ ...prev, isReading: false }));
      setLatestMetadataEvent(event);

      if (Array.isArray(event.content)) {
        updateLastMessage({ paperSnapshots: event.content });
      }
    },
    onProgress: (event: ProgressEvent) => {
      setStreamState((prev) => ({
        ...prev,
        isReading: event.type === "reasoning",
      }));

      const queryId = getQueryId();
      if (queryId) {
        addProgress(queryId, event);
      }

      onProgress?.(event);
    },
    onReasoning: () => {
      setStreamState((prev) => ({ ...prev, isReading: true }));
    },
    onChunk: (chunk: string) => {
      setStreamState((prev) => ({ ...prev, isReading: false }));
      accumulatedTextRef.current += chunk;
      updateLastMessage({ text: accumulatedTextRef.current });
    },
    onDone: () => {
      setStreamState((prev) => ({ ...prev, isReading: false }));
      onDone?.();

      const queryId = getQueryId();
      if (queryId) {
        const queryProgress = useProgressStore
          .getState()
          .getQueryProgress(queryId);
        updateLastMessage({
          text: accumulatedTextRef.current,
          done: true,
          progressEvents:
            queryProgress && queryProgress.steps.length > 0
              ? queryProgress.steps
              : undefined,
        });
        completeQuery(queryId);
        return;
      }

      updateLastMessage({
        text: accumulatedTextRef.current,
        done: true,
      });
    },
    onError: (error: Error) => {
      if (isAbortError(error) || hasHandledFailure || failureHandledRef?.current) {
        return;
      }

      hasHandledFailure = true;
      if (failureHandledRef) {
        failureHandledRef.current = true;
      }
      onStreamError?.(error);

      const queryId = getQueryId();
      if (queryId) {
        completeQuery(queryId);
      }

      onError?.();

      setStreamState({
        isStreaming: false,
        isReading: false,
        isError: true,
        lastFailedQuery: query,
        lastClientMessageId: messageId ?? null,
      });
    },
  };
}
