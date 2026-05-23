import { papersApi } from '@/lib/api/papers-api'
import { useQueryWithError } from '@/hooks/use-query-with-error'

interface PaperReferencesParams {
  offset?: number
  limit?: number
}

export function usePaperReferences(
  paperId: string,
  enabled: boolean = true,
  params: PaperReferencesParams = {}
) {
  const { offset = 0, limit = 20 } = params

  return useQueryWithError({
    queryKey: ['paper', paperId, 'references', offset, limit],
    queryFn: () => papersApi.getReferences({ paperId, offset, limit }),
    enabled: !!paperId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  }, 'Failed to load paper references')
}
