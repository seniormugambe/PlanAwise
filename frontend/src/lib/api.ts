const configuredApiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const currentOrigin =
  typeof window === "undefined" ? "" : window.location.origin.replace(/\/$/, "");

const apiBaseUrl = configuredApiBaseUrl === currentOrigin ? "" : configuredApiBaseUrl;

export const apiUrl = (path: string): string => `${apiBaseUrl}${path}`;

const AI_REQUEST_COOLDOWN_MS = 1200;
const USER_AI_TIMEOUT_MS = 45000;
const BACKGROUND_AI_TIMEOUT_MS = 25000;
const activeAiRequests = new Map<string, Promise<Response>>();
let aiRequestQueue = Promise.resolve();
let lastAiRequestAt = 0;

const isAiRequest = (input: RequestInfo | URL): boolean => {
  const url = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  return url.includes("/api/ai/") || url.includes("/api/automation/detect");
};

const createRequestKey = (input: RequestInfo | URL, init: RequestInit = {}): string => {
  const url = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;
  const method = (init.method || "GET").toUpperCase();
  const body = typeof init.body === "string" ? init.body : "";

  return `${method}:${url}:${body}`;
};

const normalizeHeaders = (headers?: HeadersInit): Record<string, string> => {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return { ...headers };
};

export const guardedFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> => {
  const method = (init.method || "GET").toUpperCase();

  if (!isAiRequest(input) || method === "GET") {
    return fetch(input, init);
  }

  const headers = normalizeHeaders(init.headers);
  const priority = headers["x-ai-priority"] || headers["X-AI-Priority"];
  delete headers["x-ai-priority"];
  delete headers["X-AI-Priority"];

  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  const key = createRequestKey(input, requestInit);
  const active = activeAiRequests.get(key);
  if (active) {
    return (await active).clone();
  }

  const runRequest = async () => {
    const waitMs = Math.max(0, AI_REQUEST_COOLDOWN_MS - (Date.now() - lastAiRequestAt));
    if (waitMs > 0) {
      await new Promise(resolve => globalThis.setTimeout(resolve, waitMs));
    }

    lastAiRequestAt = Date.now();
    const timeoutMs = priority === "user" ? USER_AI_TIMEOUT_MS : BACKGROUND_AI_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);
    const signal = requestInit.signal;

    if (signal) {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener("abort", () => controller.abort(), { once: true });
      }
    }

    try {
      return await fetch(input, {
        ...requestInit,
        signal: controller.signal,
      });
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  };

  const request = priority === "user"
    ? runRequest()
    : aiRequestQueue.then(runRequest, runRequest);

  if (priority !== "user") {
    aiRequestQueue = request.then(() => undefined, () => undefined);
  }

  request.then(
    () => activeAiRequests.delete(key),
    () => activeAiRequests.delete(key)
  );

  activeAiRequests.set(key, request);
  return (await request).clone();
};
