/**
 * Validation API Service
 * Handles validation-related API requests
 */

import { apiClient } from './api-client'
import type {
  ValidationRequest,
  ValidationInspection,
  ValidationHistoryResponse,
  ValidationDetail,
  ValidationStats,
} from '@/types/validation.type'

/**
 * Run validation on query and context
 */
export async function runValidation(
  request: ValidationRequest
): Promise<ValidationInspection> {
  return apiClient.request<ValidationInspection>('/api/v1/admin/validation/validate', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Get validation history with filters
 */
export async function getValidationHistory(params: {
  skip?: number
  limit?: number
  messageId?: number
  conversationId?: string
  modelName?: string
  queryText?: string
  hasHallucination?: boolean
}): Promise<ValidationHistoryResponse> {
  const searchParams = new URLSearchParams()
  if (params.skip !== undefined) searchParams.append('skip', params.skip.toString())
  if (params.limit !== undefined) searchParams.append('limit', params.limit.toString())
  if (params.messageId !== undefined) searchParams.append('message_id', params.messageId.toString())
  if (params.conversationId) searchParams.append('conversation_id', params.conversationId)
  if (params.modelName) searchParams.append('model_name', params.modelName)
  if (params.queryText) searchParams.append('query_text', params.queryText)
  if (params.hasHallucination !== undefined) {
    searchParams.append('has_hallucination', params.hasHallucination.toString())
  }

  return apiClient.request<ValidationHistoryResponse>(
    `/api/v1/admin/validation/history?${searchParams.toString()}`
  )
}

/**
 * Get detailed validation by ID
 */
export async function getValidationDetail(
  validationId: number
): Promise<ValidationDetail> {
  return apiClient.request<ValidationDetail>(
    `/api/v1/admin/validation/history/${validationId}`
  )
}

/**
 * Delete validation from history
 */
export async function deleteValidation(validationId: number): Promise<{ message: string }> {
  return apiClient.request<{ message: string }>(
    `/api/v1/admin/validation/history/${validationId}`,
    {
      method: 'DELETE',
    }
  )
}

/**
 * Get validation statistics
 */
export async function getValidationStats(params?: {
  messageId?: number
}): Promise<ValidationStats> {
  const searchParams = new URLSearchParams()
  if (params?.messageId !== undefined) searchParams.append('message_id', params.messageId.toString())

  return apiClient.request<ValidationStats>(
    `/api/v1/admin/validation/stats${searchParams.toString() ? '?' + searchParams.toString() : ''}`
  )
}
