/**
 * User Settings API Client
 */

import { apiClient } from "./api-client";

export interface UserSettings {
  id: number;
  userId: number;
  language: string;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserSettingsRequest {
  language?: string;
  preferences?: Record<string, any>;
}

export const userSettingsApi = {
  /**
   * Get current user settings
   */
  async get(): Promise<UserSettings> {
    const response = await apiClient.get<UserSettings>("/api/v1/user/settings");
    return response;
  },

  /**
   * Update user settings
   */
  async update(data: UpdateUserSettingsRequest): Promise<UserSettings> {
    const response = await apiClient.patch<UserSettings>("/api/v1/user/settings", data);
    return response;
  },
};
