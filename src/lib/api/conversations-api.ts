import { apiClient } from "./api-client";
import type {
  ConversationCreateDTO,
  ConversationUpdateDTO,
  ConversationDTO,
  ConversationDeleteDTO
} from "@/types/conversation.type";
import type { PaginatedData } from "@/types/api.type";

const CONVERSATIONS_BASE = "/api/v1/conversations";

type RawConversation = ConversationDTO & {
  conversationId?: string;
};

function normalizeConversation(raw: RawConversation): ConversationDTO {
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
    query?: string;
    search_messages?: boolean;
  } = {}): Promise<PaginatedData<ConversationDTO>> {
    const {
      page = 1,
      page_size = 20,
      archived,
      query,
      search_messages,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    if (archived !== undefined) {
      queryParams.append("archived", archived.toString());
    }
    if (query?.trim()) {
      queryParams.append("query", query.trim());
    }
    if (search_messages !== undefined) {
      queryParams.append("search_messages", search_messages.toString());
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
  async create(data: ConversationCreateDTO = {}): Promise<ConversationDTO> {
    const response = await apiClient.post<RawConversation>(
      CONVERSATIONS_BASE,
      data,
    );
    return normalizeConversation(response);
  },

  /**
   * Get a specific conversation by ID with all messages
   */
  async get(conversationId: string): Promise<ConversationDTO> {
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
    updates: ConversationUpdateDTO
  ): Promise<ConversationDTO> {
    const response = await apiClient.put<RawConversation>(
      `${CONVERSATIONS_BASE}/${conversationId}`,
      updates
    );
    return normalizeConversation(response);
  },

  /**
   * Delete a conversation and all its messages
   */
  async delete(conversationId: string): Promise<ConversationDeleteDTO> {
    return apiClient.delete<ConversationDeleteDTO>(
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
