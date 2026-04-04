import { apiClient } from "./api-client";
import type {
  PaperDetail,
  ChunkResponse,
  PaginatedCitationsResponse,
  PaginatedReferencesResponse,
  PaperUpdateRequest,
} from "@/types/paper.type";
import { type PaginatedData, type DeleteResponse, HttpStatus, ApiError } from "@/types/api.type";
import { Conversation } from "@/types/conversation.type";


const PAPERS_BASE = "/api/v1/papers";

export const papersApi = {
  /**
   * List all papers with pagination and filters
   */
  async list(params: {
    page?: number;
    pageSize?: number;
    processedOnly?: boolean;
    source?: string;
  } = {}): Promise<PaginatedData<PaperDetail>> {
    const {
      page = 1,
      pageSize = 20,
      processedOnly = false,
      source,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      processed_only: processedOnly.toString(),
    });

    if (source) {
      queryParams.append("source", source);
    }

    return await apiClient.get<PaginatedData<PaperDetail>>(
      `${PAPERS_BASE}?${queryParams}`
    );
  },

  /**
   * Get a specific paper by paper_id
   */
  async get(paperId: string): Promise<PaperDetail | null> {
    try {
      return await apiClient.get<PaperDetail>(`${PAPERS_BASE}/${paperId}`);
    } catch (error) {
      if (error instanceof ApiError && error.isStatus(HttpStatus.NOT_FOUND)) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Update a paper's metadata
   */
  async update(
    paperId: string,
    updateData: PaperUpdateRequest
  ): Promise<PaperDetail> {
    return await apiClient.patch<PaperDetail>(
      `${PAPERS_BASE}/${paperId}`,
      updateData
    );
  },

  /**
   * Delete a paper and all its chunks
   */
  async delete(paperId: string): Promise<DeleteResponse> {
    return await apiClient.delete<DeleteResponse>(`${PAPERS_BASE}/${paperId}`);
  },

  /**
   * Get papers that cite this paper (from Semantic Scholar API)
   */
  async getCitations(params: {
    paperId: string;
    offset?: number;
    limit?: number;
    fields?: string;
  }): Promise<PaginatedCitationsResponse> {
    const { paperId, offset = 0, limit = 100, fields } = params;

    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    if (fields) {
      queryParams.append("fields", fields);
    }

    return await apiClient.get<PaginatedCitationsResponse>(
      `${PAPERS_BASE}/${paperId}/citations?${queryParams}`
    );
  },

  /**
   * Get papers referenced by this paper (from Semantic Scholar API)
   */
  async getReferences(params: {
    paperId: string;
    offset?: number;
    limit?: number;
    fields?: string;
  }): Promise<PaginatedReferencesResponse> {
    const { paperId, offset = 0, limit = 100, fields } = params;

    const queryParams = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    if (fields) {
      queryParams.append("fields", fields);
    }

    return await apiClient.get<PaginatedReferencesResponse>(
      `${PAPERS_BASE}/${paperId}/references?${queryParams}`
    );
  },

  /**
   * Get chunks for a specific paper
   */
  async getChunks(paperId: string): Promise<ChunkResponse[]> {
    return await apiClient.get<ChunkResponse[]>(`${PAPERS_BASE}/${paperId}/chunks`);
  },

  /**
   * Get conversations for a specific paper
   */
  async getConversations(params: {
    paperId: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedData<Conversation>> {
    const { paperId, page = 1, page_size = 20 } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    return await apiClient.get<PaginatedData<Conversation>>(
      `${PAPERS_BASE}/${paperId}/conversations?${queryParams}`
    );
  },
};
