import { papersApi } from '@/lib/api/papers-api'
import { defaultRetry, defaultRetryDelay } from '@/lib/react-query/react-query-utils'
import { useQueryWithError } from '@/hooks/use-query-with-error'

export function usePaperDetail(paperId: string) {
  return useQueryWithError({
    queryKey: ['paper', paperId],
    queryFn: () => papersApi.get(paperId),
    enabled: !!paperId,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to load paper details')
}
