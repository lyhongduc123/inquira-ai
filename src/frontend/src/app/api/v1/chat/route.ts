import { NextRequest } from 'next/server';
import { handleProxy } from '@/lib/api/api-client.server';

export async function POST(request: NextRequest) {
  return handleProxy(request, '/api/v1/chat/agent');
}
