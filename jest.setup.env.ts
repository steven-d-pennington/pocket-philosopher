import { TextDecoder, TextEncoder } from "util";

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ReadableStream, TransformStream, WritableStream } = require("stream/web");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MessageChannel, MessagePort } = require("worker_threads");

if (!globalThis.ReadableStream) {
  globalThis.ReadableStream = ReadableStream as typeof globalThis.ReadableStream;
}
if (!globalThis.TransformStream) {
  globalThis.TransformStream = TransformStream as typeof globalThis.TransformStream;
}
if (!globalThis.WritableStream) {
  globalThis.WritableStream = WritableStream as typeof globalThis.WritableStream;
}
if (!globalThis.MessageChannel) {
  globalThis.MessageChannel = MessageChannel as typeof globalThis.MessageChannel;
}
if (!globalThis.MessagePort) {
  globalThis.MessagePort = MessagePort as typeof globalThis.MessagePort;
}

// Align with Next.js edge primitives so NextResponse works in Jest.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const edgeFetch = require("next/dist/compiled/@edge-runtime/primitives/fetch");

if (!globalThis.Blob) {
  globalThis.Blob = edgeFetch.Blob as typeof globalThis.Blob;
}
if (!globalThis.File) {
  globalThis.File = edgeFetch.File as typeof globalThis.File;
}
if (!globalThis.FormData) {
  globalThis.FormData = edgeFetch.FormData as typeof globalThis.FormData;
}
if (!globalThis.Headers) {
  globalThis.Headers = edgeFetch.Headers as typeof globalThis.Headers;
}
if (!globalThis.Request) {
  globalThis.Request = edgeFetch.Request as typeof globalThis.Request;
}
if (!globalThis.Response) {
  globalThis.Response = edgeFetch.Response as typeof globalThis.Response;
}
if (!globalThis.fetch) {
  globalThis.fetch = edgeFetch.fetch as typeof globalThis.fetch;
}

process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.test";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key";
process.env.POSTHOG_API_KEY = process.env.POSTHOG_API_KEY ?? "test-posthog-key";
