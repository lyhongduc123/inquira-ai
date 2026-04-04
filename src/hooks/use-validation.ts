/**
 * Validation Hooks
 * React hooks for managing validation state and operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  runValidation,
  getValidationHistory,
  getValidationDetail,
  deleteValidation,
  getValidationStats,
} from '@/lib/api/validation-api'
import { useQueryWithError } from './use-query-with-error'
import type {
  ValidationRequest,
  ValidationInspection,
  ValidationHistoryResponse,
  ValidationStats,
} from '@/types/validation.type'

/**
 * Hook to run validation
 */
export function useValidation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ValidationRequest) => runValidation(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation-history'] })
      queryClient.invalidateQueries({ queryKey: ['validation-stats'] })
      toast.success('Validation completed successfully')
    },
    onError: (error: Error) => {
      toast.error(`Validation failed: ${error.message}`)
    },
  })
}

/**
 * Hook to fetch validation history
 */
export function useValidationHistory(params: {
  skip?: number
  limit?: number
  messageId?: number
  conversationId?: string
  modelName?: string
  queryText?: string
  hasHallucination?: boolean
}) {
  return useQueryWithError({
    queryKey: ['validation-history', params],
    queryFn: () => getValidationHistory(params),
    staleTime: 30_000, // 30 seconds
  }, 'Failed to load validation history')
}

/**
 * Hook to fetch validation detail
 */
export function useValidationDetail(validationId: number | null) {
  return useQueryWithError({
    queryKey: ['validation-detail', validationId],
    queryFn: () => {
      if (!validationId) throw new Error('Validation ID is required')
      return getValidationDetail(validationId)
    },
    enabled: !!validationId,
  }, 'Failed to load validation detail')
}

/**
 * Hook to delete validation
 */
export function useDeleteValidation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (validationId: number) => deleteValidation(validationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation-history'] })
      queryClient.invalidateQueries({ queryKey: ['validation-stats'] })
      toast.success('Validation deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete validation: ${error.message}`)
    },
  })
}

/**
 * Hook to fetch validation statistics
 */
export function useValidationStats(params?: {
  messageId?: number
}) {
  return useQueryWithError({
    queryKey: ['validation-stats', params],
    queryFn: () => getValidationStats(params),
    staleTime: 60_000, // 1 minute
  }, 'Failed to load validation statistics')
}
