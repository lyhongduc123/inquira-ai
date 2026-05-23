/**
 * Bookmarks API Client
 */

import { PaperMetadata } from "@/types/paper.type";
import { apiClient } from "./api-client";

export interface Bookmark {
  id: number;
  paperId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paper?: PaperMetadata;
}

export interface CreateBookmarkRequest {
  paperId: string;
  notes?: string;
}

export interface UpdateBookmarkRequest {
  notes?: string;
}

export interface BookmarkListResponse {
  items: Bookmark[];
  total: number;
  skip: number;
  limit: number;
}

export interface BookmarkListParams {
  skip?: number;
  limit?: number;
  query?: string;
  year?: number;
  isOpenAccess?: boolean;
  hasNotes?: boolean;
  sortBy?: "id" | "citations" | "year";
  sortOrder?: "asc" | "desc";
}

export interface BookmarkCheckResponse {
  isBookmarked: boolean;
  bookmarkId: number | null;
}

export const bookmarksApi = {
  /**
   * Create a new bookmark
   */
  async create(data: CreateBookmarkRequest): Promise<Bookmark> {
    const response = await apiClient.post<Bookmark>("/api/v1/bookmarks", data);
    return response;
  },

  /**
   * List all bookmarks for the current user
   */
  async list(params: BookmarkListParams = {}): Promise<BookmarkListResponse> {
    const {
      skip = 0,
      limit = 50,
      query,
      year,
      isOpenAccess,
      hasNotes,
      sortBy,
      sortOrder,
    } = params;

    const searchParams = new URLSearchParams({
      skip: String(skip),
      limit: String(limit),
    });

    if (query?.trim()) {
      searchParams.set("q", query.trim());
    }

    if (typeof year === "number") {
      searchParams.set("year", String(year));
    }

    if (typeof isOpenAccess === "boolean") {
      searchParams.set("is_open_access", String(isOpenAccess));
    }

    if (typeof hasNotes === "boolean") {
      searchParams.set("has_notes", String(hasNotes));
    }

    if (sortBy) {
      searchParams.set("sort_by", sortBy);
    }

    if (sortOrder) {
      searchParams.set("sort_order", sortOrder);
    }

    const response = await apiClient.get<BookmarkListResponse>(
      `/api/v1/bookmarks?${searchParams.toString()}`
    );
    return response;
  },

  /**
   * Get a specific bookmark with paper details
   */
  async get(bookmarkId: number): Promise<Bookmark> {
    const response = await apiClient.get<Bookmark>(`/api/v1/bookmarks/${bookmarkId}`);
    return response;
  },

  /**
   * Update bookmark notes
   */
  async update(bookmarkId: number, data: UpdateBookmarkRequest): Promise<Bookmark> {
    const response = await apiClient.patch<Bookmark>(`/api/v1/bookmarks/${bookmarkId}`, data);
    return response;
  },

  /**
   * Delete a bookmark
   */
  async delete(bookmarkId: number): Promise<void> {
    await apiClient.delete(`/api/v1/bookmarks/${bookmarkId}`);
  },

  /**
   * Check if a paper is bookmarked
   */
  async check(paperId: string): Promise<BookmarkCheckResponse> {
    const response = await apiClient.get<BookmarkCheckResponse>(
      `/api/v1/bookmarks/check/${paperId}`
    );
    return response;
  },
};
