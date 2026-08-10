const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  response: { status: number; data: unknown };

  constructor(status: number, data: unknown) {
    super(`Request failed with status code ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.response = { status, data };
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

let onUnauthorized: (() => void) | undefined;

export const setupApiInterceptors = (logout: () => void) => {
  onUnauthorized = logout;
};

type RequestOptions = {
  params?: Record<string, unknown>;
};

function buildUrl(path: string, params?: Record<string, unknown>): string {
  let url = `${BASE_URL}${path}`;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  if (query) {
    url += `?${query}`;
  }

  return url;
}

async function request(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
  // biome-ignore lint/suspicious/noExplicitAny: matches the untyped response shape callers relied on with axios
): Promise<any> {
  const response = await fetch(buildUrl(path, options?.params), {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    onUnauthorized?.();
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return { data };
}

export const api = {
  get: (path: string, options?: RequestOptions) =>
    request("GET", path, undefined, options),
  post: (path: string, body?: unknown, options?: RequestOptions) =>
    request("POST", path, body, options),
  put: (path: string, body?: unknown, options?: RequestOptions) =>
    request("PUT", path, body, options),
  patch: (path: string, body?: unknown, options?: RequestOptions) =>
    request("PATCH", path, body, options),
  delete: (path: string, options?: RequestOptions) =>
    request("DELETE", path, undefined, options),
};
