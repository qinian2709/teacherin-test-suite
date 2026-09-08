import { loadEnv } from '../../config/env';

export interface ApiResponse<T = unknown> {
  status: number;
  ok: boolean;
  data: T;
}

const env = loadEnv();

export async function request<T = unknown>(
  path: string,
  opts: { method?: string; token?: string; body?: unknown; baseURL?: string } = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', token = env.apiToken, body, baseURL = env.apiBaseURL } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseURL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown = text;
  try {
    data = JSON.parse(text);
  } catch {
    // 非 JSON 响应，保留原文
  }
  return { status: res.status, ok: res.ok, data: data as T };
}
