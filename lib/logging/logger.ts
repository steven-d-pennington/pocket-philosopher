import { randomUUID } from "node:crypto";

import { serverAnalytics } from "@/lib/analytics/server";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LoggerMetadata = Record<string, unknown>;

interface LoggerContext {
  requestId: string;
  route?: string;
  method?: string;
  userId?: string;
}

interface LoggerState {
  context: LoggerContext;
  metadata: LoggerMetadata;
}

interface LogOptions {
  level: LogLevel;
  message: string;
  meta?: LoggerMetadata;
  error?: unknown;
  state: LoggerState;
}

export interface RequestLogger {
  readonly requestId: string;
  debug(message: string, meta?: LoggerMetadata): void;
  info(message: string, meta?: LoggerMetadata): void;
  warn(message: string, meta?: LoggerMetadata): void;
  error(message: string, error?: unknown, meta?: LoggerMetadata): void;
  child(options: LoggerChildOptions): RequestLogger;
  withUser(userId: string): RequestLogger;
}

export interface CreateRequestLoggerOptions {
  request?: Request;
  route?: string;
  requestId?: string;
  method?: string;
  metadata?: LoggerMetadata;
}

export interface LoggerChildOptions {
  route?: string;
  method?: string;
  userId?: string;
  metadata?: LoggerMetadata;
}

const consoleMap: Record<LogLevel, (message?: unknown, ...optional: unknown[]) => void> = {
  debug: console.debug.bind(console),
  info: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

function normalizeError(error: unknown) {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  if (typeof error === "object") {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return { message: String(error) };
    }
  }
  return { message: String(error) };
}

function stripUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== null),
  );
}

function emitAnalytics(level: LogLevel, message: string, state: LoggerState, meta?: LoggerMetadata) {
  if (!serverAnalytics.isEnabled) return;
  if (level === "debug") return;

  const event = level === "error" ? "api_error" : "api_log";

  serverAnalytics.capture({
    event,
    distinctId: state.context.userId ?? state.context.requestId,
    properties: {
      level,
      message,
      request_id: state.context.requestId,
      route: state.context.route,
      method: state.context.method,
      user_id: state.context.userId,
      has_meta: Boolean(meta && Object.keys(meta).length > 0),
    },
  });
}

function log({ level, message, meta, error, state }: LogOptions) {
  const consoleFn = consoleMap[level];
  const normalizedError = normalizeError(error);
  const entry = stripUndefined({
    level,
    message,
    timestamp: new Date().toISOString(),
    requestId: state.context.requestId,
    route: state.context.route,
    method: state.context.method,
    userId: state.context.userId,
    metadata: meta && Object.keys(meta).length > 0 ? { ...state.metadata, ...meta } : state.metadata,
    error: normalizedError,
  });

  consoleFn(JSON.stringify(entry));
  emitAnalytics(level, message, state, meta);
}

function createLogger(state: LoggerState): RequestLogger {
  return {
    requestId: state.context.requestId,
    debug(message, meta) {
      log({ level: "debug", message, meta, state });
    },
    info(message, meta) {
      log({ level: "info", message, meta, state });
    },
    warn(message, meta) {
      log({ level: "warn", message, meta, state });
    },
    error(message, error, meta) {
      log({ level: "error", message, meta, error, state });
    },
    child(options) {
      const nextContext: LoggerContext = {
        requestId: state.context.requestId,
        route: options.route ?? state.context.route,
        method: options.method ?? state.context.method,
        userId: options.userId ?? state.context.userId,
      };

      const nextMetadata = { ...state.metadata, ...(options.metadata ?? {}) };

      return createLogger({
        context: nextContext,
        metadata: nextMetadata,
      });
    },
    withUser(userId: string) {
      return createLogger({
        context: { ...state.context, userId },
        metadata: state.metadata,
      });
    },
  };
}

export function createRequestLogger(options: CreateRequestLoggerOptions = {}): RequestLogger {
  const rawRequestId = options.request?.headers.get("x-request-id") ?? options.requestId;
  const requestId = rawRequestId && rawRequestId.length > 0 ? rawRequestId : randomUUID();
  const method = options.request?.method ?? options.method;
  const inferredRoute = (() => {
    if (options.route) return options.route;
    if (!options.request) return undefined;
    try {
      return new URL(options.request.url).pathname;
    } catch {
      return undefined;
    }
  })();

  const state: LoggerState = {
    context: {
      requestId,
      method,
      route: inferredRoute,
    },
    metadata: options.metadata ?? {},
  };

  return createLogger(state);
}


