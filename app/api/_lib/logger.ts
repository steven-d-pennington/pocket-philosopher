import type { RequestLogger } from "@/lib/logging/logger";
import { createRequestLogger } from "@/lib/logging/logger";

import { error, success } from "@/app/api/_lib/response";

export function createApiRequestLogger(request: Request, route: string): RequestLogger {
  return createRequestLogger({ request, route });
}

export function withUserContext(logger: RequestLogger, userId?: string | null): RequestLogger {
  return userId ? logger.withUser(userId) : logger;
}

export function respondWithSuccess<T>(
  logger: RequestLogger,
  data: T,
  init?: ResponseInit & { message?: string },
) {
  return success(data, { ...init, requestId: logger.requestId });
}

export function respondWithError(
  logger: RequestLogger,
  message: string,
  options?: { status?: number; details?: unknown },
) {
  return error(message, { ...options, requestId: logger.requestId });
}
