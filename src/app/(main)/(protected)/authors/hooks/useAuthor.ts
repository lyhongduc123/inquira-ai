import { authorApi, type AuthorListParams } from '@/lib/api/author-api'
import { defaultRetry, defaultRetryDelay } from '@/lib/react-query/react-query-utils'
import { useQueryWithError } from '@/hooks/use-query-with-error'
import { useQuery } from '@tanstack/react-query'

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
 * Fetch paginated papers for an author
 */
export function useAuthorPapers(
  authorId: string,
  offset: number = 0,
  limit: number = 20,
  enabled: boolean = true,
  sort = "year",
  descending = true,
) {
  return useQuery({
    queryKey: ['author', authorId, 'papers', offset, limit, sort, descending],
    queryFn: () => authorApi.getAuthorPapers(authorId, offset, limit, sort, descending ? 'desc' : 'asc'),
    enabled: !!authorId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  })
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
