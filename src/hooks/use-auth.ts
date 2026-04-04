import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    showContent: !isLoading && isAuthenticated,
  };
}
