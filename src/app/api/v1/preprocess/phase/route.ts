import { NextRequest, NextResponse } from "next/server";
import { handleProxy } from "@/lib/api/api-client.server";

/**
 * POST /api/v1/preprocess/phase/run - Run preprocessing phase
 */
export async function POST(request: NextRequest) {
  return handleProxy(request, "/api/v1/preprocess/phase/run");
}