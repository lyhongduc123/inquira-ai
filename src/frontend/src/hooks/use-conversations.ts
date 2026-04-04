import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationsApi } from "@/lib/api/conversations-api";
import {
  ConversationListResponse,
  Conversation,
} from "@/types/conversation.type";
import { useQueryWithError } from "./use-query-with-error";

export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
  list: (page: number, pageSize: number, archived?: boolean) =>
    [...conversationKeys.lists(), { page, pageSize, archived }] as const,
  details: () => [...conversationKeys.all, "detail"] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
};

interface UseConversationsOptions {
  page?: number;
  pageSize?: number;
  archived?: boolean;
  enabled?: boolean;
}

export function useConversations(options: UseConversationsOptions = {}) {
  const { page = 1, pageSize = 20, archived = false, enabled = true } = options;

  const queryClient = useQueryClient();

  const conversationsQuery = useQueryWithError({
    queryKey: conversationKeys.list(page, pageSize, archived),
    queryFn: () =>
      conversationsApi.list({ page, page_size: pageSize, archived }),
    enabled,
    staleTime: Infinity, // Never mark as stale - only refetch on explicit invalidation
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component remounts
  }, 'Failed to load conversations');

  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: string) =>
      conversationsApi.delete(conversationId),
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });
      const previousData = queryClient.getQueryData(
        conversationKeys.list(page, pageSize, archived)
      );
      queryClient.setQueryData(
        conversationKeys.list(page, pageSize, archived),
        (old: ConversationListResponse | undefined) => {
          if (!old || !old.items) return old;
          return {
            ...old,
            items: old.items.filter((c) => c.id !== conversationId),
            total: old.total - 1,
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _conversationId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          conversationKeys.list(page, pageSize, archived),
          context.previousData
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });

  const addConversationOptimistically = (conversation: Conversation) => {
    queryClient.setQueryData(
      conversationKeys.list(page, pageSize, archived),
      (old: ConversationListResponse | undefined) => {
        if (!old || !old.items) return old;
        const exists = old.items.some(
          (c: Conversation) => c.id === conversation.id,
        );
        if (exists) return old;
        return {
          ...old,
          items: [conversation, ...old.items],
          total: old.total + 1,
        };
      },
    );
  };

  const invalidateConversations = () => {
    queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
  };

  return {
    conversations: conversationsQuery.data?.items ?? [],
    total: conversationsQuery.data?.total ?? 0,
    isLoading: conversationsQuery.isLoading,
    isError: conversationsQuery.isError,
    error: conversationsQuery.error,
    refetch: conversationsQuery.refetch,
    deleteConversation: deleteConversationMutation.mutate,
    isDeleting: deleteConversationMutation.isPending,
    addConversationOptimistically,
    invalidateConversations,
  };
}
