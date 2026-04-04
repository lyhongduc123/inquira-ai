/**
 * React hooks for user settings
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userSettingsApi, type UpdateUserSettingsRequest } from "@/lib/api";
import { defaultRetry, defaultRetryDelay, handleMutationError, handleMutationSuccess } from "@/lib/react-query/react-query-utils";
import { useQueryWithError } from "./use-query-with-error";

export function useUserSettings() {
  return useQueryWithError({
    queryKey: ["user-settings"],
    queryFn: () => userSettingsApi.get(),
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to load user settings');
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserSettingsRequest) => userSettingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      handleMutationSuccess("Settings updated successfully");
    },
    onError: (error) => {
      handleMutationError(error, "update settings");
    },
  });
}
