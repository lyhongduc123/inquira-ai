import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth.type";
import { authApi } from "@/lib/api/auth-api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasCheckedAuth: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setIsLoading: (isLoading) => set({ isLoading }),

      login: async () => {
        try {
          set({ isLoading: true });
          const user = await authApi.getMe();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            hasCheckedAuth: true,
          });
        } catch (error) {
          console.error("Login failed:", error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedAuth: true,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Only call logout endpoint if authenticated
          const { isAuthenticated } = get();
          if (isAuthenticated) {
            await authApi.logout();
          }
        } catch (error) {
          // Silently handle logout errors - we're clearing state anyway
          console.debug("Logout error (ignored):", error);
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false, hasCheckedAuth: true });
        }
      },

      refreshAuth: async () => {
        try {
          await authApi.refreshToken();
          const user = await authApi.getMe();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            hasCheckedAuth: true,
          });
        } catch (error) {
          console.error("Token refresh failed:", error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedAuth: true,
          });
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const user = await authApi.getMe(false);
          set({ user, isAuthenticated: true, isLoading: false, hasCheckedAuth: true });
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false, user: null, hasCheckedAuth: true });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: () => ({}),
    }
  )
);
