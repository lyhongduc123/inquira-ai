import { apiClient } from "./api-client";
import type {
  ConversationCreate,
  ConversationUpdate,
  Conversation,
  ConversationDelete
} from "@/types/conversation.type";
import type { PaginatedData } from "@/types/api.type";

const CONVERSATIONS_BASE = "/api/v1/conversations";

type RawConversation = Conversation & {
  conversationId?: string;
};

function normalizeConversation(raw: RawConversation): Conversation {
  return {
    ...raw,
    id: raw.id || raw.conversationId || "",
  };
}

export const conversationsApi = {
  /**
   * List all conversations for the current user
   */
  async list(params: {
    page?: number;
    page_size?: number;
    archived?: boolean;
  } = {}): Promise<PaginatedData<Conversation>> {
    const { page = 1, page_size = 20, archived } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    if (archived !== undefined) {
      queryParams.append("archived", archived.toString());
    }

    const response = await apiClient.get<PaginatedData<RawConversation>>(
      `${CONVERSATIONS_BASE}?${queryParams}`
    );

    return {
      ...response,
      items: (response.items || []).map(normalizeConversation),
    };
  },

  /**
   * Create a new conversation
   */
  async create(data: ConversationCreate = {}): Promise<Conversation> {
    const response = await apiClient.post<RawConversation>(
      CONVERSATIONS_BASE,
      data,
    );
    return normalizeConversation(response);
  },

  /**
   * Get a specific conversation by ID with all messages
   */
  async get(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get<RawConversation>(
      `${CONVERSATIONS_BASE}/${conversationId}`
    );
    return normalizeConversation(response);
  },

  /**
   * Update a conversation (rename or archive)
   */
  async update(
    conversationId: string,
    updates: ConversationUpdate
  ): Promise<Conversation> {
    const response = await apiClient.put<RawConversation>(
      `${CONVERSATIONS_BASE}/${conversationId}`,
      updates
    );
    return normalizeConversation(response);
  },

  /**
   * Delete a conversation and all its messages
   */
  async delete(conversationId: string): Promise<ConversationDelete> {
    return apiClient.delete<ConversationDelete>(
      `${CONVERSATIONS_BASE}/${conversationId}`
    );
  },

  /**
   * Generate a conversation title using heuristics or AI
   */
  async generateTitle(
    conversationId: string,
    message: string,
    maxLength: number = 50
  ): Promise<{ title: string }> {
    return apiClient.post<{ title: string }>(
      `${CONVERSATIONS_BASE}/${conversationId}/generate-title`,
      { message, max_length: maxLength }
    );
  },
};
