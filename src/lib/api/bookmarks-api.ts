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
  async list(skip: number = 0, limit: number = 50): Promise<BookmarkListResponse> {
    const response = await apiClient.get<BookmarkListResponse>(
      `/api/v1/bookmarks?skip=${skip}&limit=${limit}`
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
  async check(paperId: string): Promise<{ isBookmarked: boolean }> {
    const response = await apiClient.get<{ isBookmarked: boolean }>(
      `/api/v1/bookmarks/check/${paperId}`
    );
    return response;
  },
};
