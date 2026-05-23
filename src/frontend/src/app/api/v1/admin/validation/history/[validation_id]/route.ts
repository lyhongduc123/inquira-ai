import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

/**
 * GET /api/v1/admin/validation/history/[validation_id] - Get validation details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ validation_id: string }> }
) {
  const { validation_id } = await params;
  return handleProxy(request, `/api/v1/admin/validation/history/${validation_id}`);
}

/**
 * DELETE /api/v1/admin/validation/history/[validation_id] - Delete validation record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ validation_id: string }> }
) {
  const { validation_id } = await params;
  return handleProxy(request, `/api/v1/admin/validation/history/${validation_id}`);
}
