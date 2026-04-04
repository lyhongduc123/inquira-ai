/**
 * Custom hook that wraps useQuery with error handling
 * React Query v5 removed onError from useQuery, so this hook provides
 * a way to handle query errors with toast notifications
 */

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

  // Handle errors with toast notification
  useEffect(() => {
    if (query.isError && query.error) {
      handleQueryError(query.error, errorCustomMessage)
    }
  }, [query.isError, query.error, errorCustomMessage])

  return query
}
