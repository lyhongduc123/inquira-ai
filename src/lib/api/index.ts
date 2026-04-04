/**
 * Centralized API exports
 * All API calls should go through these modules for consistent auth handling
 */

export { apiClient } from "./api-client";
export { authApi } from "./auth-api";
export { conversationsApi } from "./conversations-api";
export { papersApi } from "./papers-api";
export { chatApi } from "./chat-api";
export { bookmarksApi } from "./bookmarks-api";
export { userSettingsApi } from "./user-settings-api";

// Re-export types
export type { ChatMessageRequest, PaperDetailChatRequest, FeedbackRequest } from "./chat-api";
export type { Bookmark, CreateBookmarkRequest, UpdateBookmarkRequest, BookmarkListResponse } from "./bookmarks-api";
export type { UserSettings, UpdateUserSettingsRequest } from "./user-settings-api";
