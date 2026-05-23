import { apiClient } from './api-client'

const MESSAGES_BASE = '/api/v1/messages'

export interface DeleteMessageOptions {
  softDelete?: boolean
  deleteAssistantReplyForUser?: boolean
}

export const messagesApi = {
  async delete(
    messageId: number,
    options: DeleteMessageOptions = {}
  ): Promise<{ message: string }> {
    const queryParams = new URLSearchParams()

    if (options.softDelete !== undefined) {
      queryParams.append('soft_delete', options.softDelete.toString())
    }
    if (options.deleteAssistantReplyForUser !== undefined) {
      queryParams.append(
        'delete_assistant_reply_for_user',
        options.deleteAssistantReplyForUser.toString()
      )
    }

    const suffix = queryParams.toString()
    return apiClient.delete<{ message: string }>(
      `${MESSAGES_BASE}/${messageId}${suffix ? `?${suffix}` : ''}`
    )
  },
}
