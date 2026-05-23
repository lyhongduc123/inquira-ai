import { useEffect } from 'react'
import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query'
import { handleQueryError } from '@/lib/react-query/react-query-utils'

/**
 * Custom useQuery hook with built-in error handling
 * Shows toast notifications when queries fail
 */
export function useQueryWithError<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  errorCustomMessage?: string,
): UseQueryResult<TData, TError> {
  const query = useQuery(options)
  
  useEffect(() => {
    if (query.isError && query.error) {
      handleQueryError(query.error, errorCustomMessage)
    }
  }, [query.isError, query.error, errorCustomMessage])

  return query
}
