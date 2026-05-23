import { papersApi } from '@/lib/api/papers-api'
import { defaultRetry, defaultRetryDelay } from '@/lib/react-query/react-query-utils'
import { useQueryWithError } from '@/hooks/use-query-with-error'

interface PaperCitationsParams {
  offset?: number
  limit?: number
}

export function usePaperCitations(
  paperId: string,
  enabled: boolean = true,
  params: PaperCitationsParams = {}
) {
  const { offset = 0, limit = 20 } = params

  return useQueryWithError({
    queryKey: ['paper', paperId, 'citations', offset, limit],
    queryFn: () => papersApi.getCitations({ paperId, offset, limit }),
    enabled: !!paperId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  }, 'Failed to load paper citations')
}
