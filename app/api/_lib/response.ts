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

export function success<T>(data: T, init?: ResponseInit & { message?: string }) {
  const { message, ...responseInit } = init ?? {};
  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
    },
    responseInit,
  );
}

export function error(message: string, options?: { status?: number; details?: unknown }) {
  return NextResponse.json<ApiError>(
    {
      success: false,
      error: message,
      ...(options?.details ? { details: options.details } : {}),
    },
    {
      status: options?.status ?? 500,
    },
  );
}
