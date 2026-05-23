import { create } from "zustand";
import { User } from "@/types/auth.type";
import { authApi } from "@/lib/api/auth-api";
import { queryClient } from "@/lib/react-query/query-client";
import { useConversationStore } from "@/store/conversation-store";
import { useBookmarkStore } from "@/store/bookmark-store";

const USER_CACHE_KEY = "auth:user";

export function getCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user: User | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

// Read cache synchronously at module load — this runs before any component renders
const _cachedUser = getCachedUser();

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;

  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Seed from localStorage cache so the first render is never "guest" for a logged-in user
  user: _cachedUser,
  isAuthenticated: !!_cachedUser,
  isLoading: true, // Will be overridden synchronously by AuthInitializer
  hasCheckedAuth: false,

  setUser: (user) => {
    setCachedUser(user);
    set({ user, isAuthenticated: !!user });
  },
  setIsLoading: (isLoading) => set({ isLoading }),

  login: async () => {
    try {
      set({ isLoading: true });
      const user = await authApi.getMe();
      setCachedUser(user);
      set({ user, isAuthenticated: true, isLoading: false, hasCheckedAuth: true });
    } catch (error) {
      setCachedUser(null);
      set({ user: null, isAuthenticated: false, isLoading: false, hasCheckedAuth: true });
      throw error;
    }
  },

  logout: async () => {
    try {
      if (get().isAuthenticated) await authApi.logout();
    } catch (error) {
      console.debug("Logout error (ignored):", error);
    } finally {
      setCachedUser(null);
      useConversationStore.getState().clearConversation();
      useBookmarkStore.getState().clearBookmarks();
      queryClient.clear();
      set({ user: null, isAuthenticated: false, isLoading: false, hasCheckedAuth: true });
    }
  },

  refreshAuth: async () => {
    try {
      await authApi.refreshToken();
      const user = await authApi.getMe();
      setCachedUser(user);
      set({ user, isAuthenticated: true, isLoading: false, hasCheckedAuth: true });
    } catch (error) {
      setCachedUser(null);
      set({ user: null, isAuthenticated: false, isLoading: false, hasCheckedAuth: true });
      throw error;
    }
  },

  checkAuth: async () => {
    // Only fetch if we haven't checked yet
    if (get().hasCheckedAuth) return;

    // Only show loading spinner if we have no cached user to display
    const hasCachedUser = !!get().user;
    if (!hasCachedUser) {
      set({ isLoading: true });
    }

    try {
      const user = await authApi.getMe(false);
      setCachedUser(user);
      set({ user, isAuthenticated: true, isLoading: false, hasCheckedAuth: true });
    } catch {
      setCachedUser(null);
      set({ user: null, isAuthenticated: false, isLoading: false, hasCheckedAuth: true });
    }
  },
}));
