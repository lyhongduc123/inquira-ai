import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasCheckedAuth,
    showContent: !isLoading && isAuthenticated,
  };
}