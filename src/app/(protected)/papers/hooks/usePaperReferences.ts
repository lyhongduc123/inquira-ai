import { papersApi } from '@/lib/api/papers-api'
import { useQueryWithError } from '@/hooks/use-query-with-error'

export function usePaperReferences(paperId: string, enabled: boolean = true) {
  return useQueryWithError({
    queryKey: ['paper', paperId, 'references'],
    queryFn: () => papersApi.getReferences({ paperId, limit: 100 }),
    enabled: !!paperId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  }, 'Failed to load paper references')
}
