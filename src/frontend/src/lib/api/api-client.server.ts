import { API_BASE_URL } from "@/core";
import { NextRequest, NextResponse } from "next/server";

export async function handleProxy(
  request: NextRequest,
  path: string,
  options?: {
    query?: URLSearchParams;
    body?: Body;
    method?: string;
  },
) {
  try {
    // Instrumentation: log entry and timing in non-production to diagnose delayed fetches
    const isProd = process.env.NODE_ENV === 'production';
    const entryTs = Date.now();
    if (!isProd) {
      console.log(`[proxy] enter ${path}`, new Date(entryTs).toISOString(), 'method=', request.method);
    }
    const cookies = request.headers.get("cookie");
    const authHeader = request.headers.get("authorization");
    const contentType = request.headers.get("content-type");

    const headers: HeadersInit = {
      ...(cookies && { Cookie: cookies }),
      ...(authHeader && { Authorization: authHeader }),
      ...(contentType && { "Content-Type": contentType }),

      Connection: "close",
    };

    const method = options?.method || request.method;

    const body =
      options?.body ??
      (method !== "GET" && method !== "HEAD"
        ? await request.text()
        : undefined);

    const query = options?.query ?? request.nextUrl.searchParams;

    const url = `${API_BASE_URL}${path}?${query}`;

    // In dev, instrument timing and guard with an AbortController to detect hangs
    let res: Response;
    if (!isProd) {
      const beforeFetch = Date.now();
      console.log(`[proxy] before fetch ${path}`, new Date(beforeFetch).toISOString(), 'target=', url);
      const controller = new AbortController();
      const timeoutMs = 60000; // 60s
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        res = await fetch(url, {
          method,
          headers,
          body: body && typeof body !== "string" ? JSON.stringify(body) : body,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      const afterFetch = Date.now();
      console.log(`[proxy] after fetch ${path}`, new Date(afterFetch).toISOString(), 'duration_ms=', afterFetch - beforeFetch);
    } else {
      res = await fetch(url, {
        method,
        headers,
        body: body && typeof body !== "string" ? JSON.stringify(body) : body,
      });
    }

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    let data: unknown = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[PROXY TIMEOUT]", path, err);
      return NextResponse.json(
        { error: "Request timed out while proxying to the backend" },
        { status: 504 },
      );
    }

    console.error("[PROXY ERROR]", path, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
