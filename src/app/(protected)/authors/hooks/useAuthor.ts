import { authorApi, type AuthorListParams } from '@/lib/api/author-api'
import { defaultRetry, defaultRetryDelay } from '@/lib/react-query/react-query-utils'
import { useQueryWithError } from '@/hooks/use-query-with-error'

/**
 * Fetch a single author by ID
 */
export function useAuthor(authorId: string, enabled: boolean = true) {
  return useQueryWithError({
    queryKey: ['author', authorId],
    queryFn: () => authorApi.getDetails(authorId),
    enabled: !!authorId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to load author')
}

/**
 * Fetch author details with papers, co-authors, and metrics
 */
export function useAuthorDetails(authorId: string, enabled: boolean = true) {
  return useQueryWithError({
    queryKey: ['author', authorId, 'details'],
    queryFn: () => authorApi.getDetails(authorId),
    enabled: !!authorId && enabled,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false

      const status = data.enrichmentStatus?.status
      const hasTerminalStatus = status === 'completed' || status === 'failed'
      const isEnriching = status === 'enriching'
      const isFirstProcessing =
        !hasTerminalStatus &&
        data.isProcessed === false &&
        data.isEnriched === false

      return isEnriching || isFirstProcessing ? 3000 : false
    },
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to load author details')
}

/**
 * Fetch paginated list of authors
 */
export function useAuthors(params: AuthorListParams = {}) {
  return useQueryWithError({
    queryKey: ['authors', params],
    queryFn: () => authorApi.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to load authors')
}

/**
 * Fetch author statistics
 */
export function useAuthorStats() {
  return useQueryWithError({
    queryKey: ['authors', 'stats'],
    queryFn: () => authorApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to load author statistics')
}
