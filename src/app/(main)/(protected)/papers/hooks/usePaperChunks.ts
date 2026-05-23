import { papersApi } from '@/lib/api/papers-api'
import { useQueryWithError } from '@/hooks/use-query-with-error'

export function usePaperChunks(paperId: string) {
  return useQueryWithError({
    queryKey: ['paper-chunks', paperId],
    queryFn: () => papersApi.getChunks(paperId),
    enabled: !!paperId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  }, 'Failed to load paper chunks')
}
