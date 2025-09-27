import { NextResponse } from "next/server";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

function createHeaders(init?: HeadersInit, requestId?: string) {
  const headers = new Headers(init);
  if (requestId) {
    headers.set("X-Request-ID", requestId);
  }
  return headers;
}

export function success<T>(data: T, init?: ResponseInit & { message?: string; requestId?: string }) {
  const { message, requestId, headers, ...responseInit } = init ?? {};
  const responseHeaders = createHeaders(headers, requestId);

  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
    },
    {
      ...responseInit,
      headers: responseHeaders,
    },
  );
}

export function error(message: string, options?: { status?: number; details?: unknown; requestId?: string }) {
  const responseHeaders = createHeaders(undefined, options?.requestId);

  return NextResponse.json<ApiError>(
    {
      success: false,
      error: message,
      ...(options?.details ? { details: options.details } : {}),
    },
    {
      status: options?.status ?? 500,
      headers: responseHeaders,
    },
  );
}
