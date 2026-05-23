import { NextRequest } from 'next/server'
import { handleProxy } from '@/lib/api/api-client.server'

/**
 * DELETE /api/v1/messages/[id] - Delete a message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params
    return handleProxy(request, `/api/v1/messages/${id}`, {
      method: 'DELETE',
    });
}
