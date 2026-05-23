/**
 * Chat API - Streaming endpoints for chat interactions
 * Backend: app/chat/router.py
 */

const CHAT_BASE = "/api/v1/chat";

export interface ChatMessageRequest {
  query: string;
  conversation_id?: string | null;
  filter?: Record<string, unknown>;
  model?: string | null;
  stream?: boolean;
  pipeline?: "research" | "agent";
  use_hybrid_pipeline?: boolean; // Deprecated: use pipeline field
}

export interface PaperDetailChatRequest {
  query: string;
  conversation_id?: string | null;
  model?: string | null;
}

export interface FeedbackRequest {
  message_id: number;
  rating: number; // 1-5
  comment?: string | null;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

export const chatApi = {
  /**
   * Stream chat message response with citations (Direct POST)
   * Returns SSE stream with conversation, metadata, tokens, and done events
   */
  getStreamUrl(): string {
    return `${CHAT_BASE}/stream`;
  },

  /**
   * Submit a chat task for background processing
   * Returns immediately with task_id. Use for Agent/Long-running pipelines.
   */
  getSubmitUrl(): string {
    return `${CHAT_BASE}/agent`;
  },

  /**
   * Backward-compatible alias for event-driven submit URL.
   */
  getEventDrivenSubmitUrl(): string {
    return `${CHAT_BASE}/agent`;
  },

  /**
   * Submit agent chat message (Specifically for Agent pipeline)
   */
  getAgentSubmitUrl(): string {
    return `${CHAT_BASE}/agent`;
  },

  /**
   * Stream events from a task (Reconnectable)
   */
  getStreamEventsUrl(taskId: string, fromSequence: number = 0): string {
    return `${CHAT_BASE}/stream/${taskId}${fromSequence > 0 ? `?from_sequence=${fromSequence}` : ""}`;
  },

  /**
   * Backward-compatible alias for event-driven stream URL.
   */
  getEventDrivenStreamUrl(taskId: string, fromSequence: number = 0): string {
    return `${CHAT_BASE}/stream/${taskId}${fromSequence > 0 ? `?from_sequence=${fromSequence}` : ""}`;
  },

  /**
   * Get task status
   */
  getTaskStatusUrl(taskId: string): string {
    return `${CHAT_BASE}/tasks/${taskId}`;
  },
};
