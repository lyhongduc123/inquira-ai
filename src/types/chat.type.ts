import { StreamEventPayload } from "@/lib/stream/stream";

/**
 * Chat send-message payload for UI and context layers.
 * Extends stream payload compatibility for current pipelines.
 */
export type ChatSendMessagePayload =
  | StreamEventPayload
  | {
      query: string;
      conversationId?: string;
      filters?: Record<string, unknown>;
      paperIds?: string[];
      pipeline?: "research" | "agent";
      clientMessageId?: string;
    };
