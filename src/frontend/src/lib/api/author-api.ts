/**
 * Author API Client
 */

import { apiClient } from "./api-client";
import type { AuthorDetailDTO, AuthorDetailWithPapersDTO } from "@/types/author.type";
import {
  type PaginatedData,
  HttpStatus,
  ApiError,
} from "@/types/api.type";

const AUTHORS_BASE = "/api/v1/authors";

export interface AuthorListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  verified?: boolean;
}

export interface AuthorStats {
  totalAuthors: number;
  verifiedAuthors: number;
  totalPapers: number;
  totalCitations: number;
}

export const authorApi = {
  /**
   * List all authors with pagination and filters
   */
  async list(
    params: AuthorListParams = {},
  ): Promise<PaginatedData<AuthorDetailDTO>> {
    const { page = 1, pageSize = 20, search, verified } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) {
      queryParams.append("search", search);
    }

    if (verified !== undefined) {
      queryParams.append("verified", verified.toString());
    }

    const response = await apiClient.get<PaginatedData<AuthorDetailDTO>>(
      `${AUTHORS_BASE}?${queryParams}`,
    );
    return response;
  },

  /**
   * Get a specific author by author_id
   */
  async get(authorId: string): Promise<AuthorDetailDTO | null> {
    try {
      const response = await apiClient.get<AuthorDetailDTO>(
        `${AUTHORS_BASE}/${authorId}`,
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.isStatus(HttpStatus.NOT_FOUND)) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get author details with papers, co-authors, and metrics
   */
  async getDetails(authorId: string): Promise<AuthorDetailWithPapersDTO | null> {
    try {
      const response = await apiClient.get<AuthorDetailWithPapersDTO>(
        `${AUTHORS_BASE}/${authorId}/details`,
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.isStatus(HttpStatus.NOT_FOUND)) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get paginated papers for an author
   */
  async getAuthorPapers(
    authorId: string,
    offset: number = 0,
    limit: number = 20,
    sortBy: string = "year",
    sortOrder: string = "desc",
  ): Promise<PaginatedData<any> | null> {
    try {
      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      const response = await apiClient.get<PaginatedData<any>>(
        `${AUTHORS_BASE}/${authorId}/papers?${queryParams}`,
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.isStatus(HttpStatus.NOT_FOUND)) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get author statistics
   */
  async getStats(): Promise<AuthorStats> {
    return await apiClient.get<AuthorStats>(`${AUTHORS_BASE}/stats`);
  },
};
