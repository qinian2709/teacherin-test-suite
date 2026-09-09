import { accounts, env, formatAuthorizationHeader } from '../../config/index.js';
import { createLogger } from '../utils/logger.js';
import { browserHeaders } from './browser-headers.js';
import type { HttpResult } from './types.js';

const log = createLogger('http');

export interface ApiClientOptions {
  baseURL?: string;
  token?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
}

/**
 * 轻量 fetch 封装，供 auth 登录、数据准备/清理等非 Playwright 场景使用。
 * Playwright 用例内推荐用 @shared/fixtures 提供的 request fixture。
 */
export class ApiClient {
  private readonly baseURL: string;
  private token: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeout: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = (options.baseURL ?? env.apiBaseURL).replace(/\/$/, '');
    this.token = options.token ?? accounts.token;
    this.defaultHeaders = options.headers ?? {};
    this.timeout = options.timeout ?? 15_000;
  }

  setToken(token: string): void {
    this.token = token;
  }

  private buildUrl(path: string, query?: RequestOptions['query']): string {
    const url = new URL(`${this.baseURL}${path.startsWith('/') ? path : `/${path}`}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private buildHeaders(opts: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...browserHeaders(),
      ...this.defaultHeaders,
      ...opts.headers,
    };
    const token = opts.token === null ? '' : (opts.token ?? this.token);
    if (token) headers.Authorization = formatAuthorizationHeader(token);
    return headers;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    opts: RequestOptions = {},
  ): Promise<HttpResult<T>> {
    const url = this.buildUrl(path, opts.query);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const res = await fetch(url, {
        method,
        headers: this.buildHeaders(opts),
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      });
      const text = await res.text();
      let data: unknown = text;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      log.debug(`${method} ${path} -> http=${res.status}`);
      return { status: res.status, ok: res.ok, data: data as T };
    } finally {
      clearTimeout(timer);
    }
  }

  get<T = unknown>(path: string, opts: RequestOptions = {}): Promise<HttpResult<T>> {
    return this.request<T>('GET', path, opts);
  }

  post<T = unknown>(
    path: string,
    body?: unknown,
    opts: RequestOptions = {},
  ): Promise<HttpResult<T>> {
    return this.request<T>('POST', path, { ...opts, body });
  }

  put<T = unknown>(
    path: string,
    body?: unknown,
    opts: RequestOptions = {},
  ): Promise<HttpResult<T>> {
    return this.request<T>('PUT', path, { ...opts, body });
  }

  delete<T = unknown>(path: string, opts: RequestOptions = {}): Promise<HttpResult<T>> {
    return this.request<T>('DELETE', path, opts);
  }

  async expectOk<T = unknown>(
    method: string,
    path: string,
    opts: RequestOptions = {},
  ): Promise<T> {
    const resp = await this.request<T>(method, path, opts);
    if (!resp.ok) {
      throw new Error(`接口失败 ${method} ${path}：HTTP ${resp.status}`);
    }
    return resp.data;
  }
}

/** 兼容旧领域封装：返回 {status, ok, data}。 */
export async function request<T = unknown>(
  path: string,
  opts: { method?: string; token?: string; body?: unknown; baseURL?: string } = {},
): Promise<HttpResult<T>> {
  const client = new ApiClient({
    baseURL: opts.baseURL,
    token: opts.token,
  });
  return client.request<T>(opts.method ?? 'GET', path, { body: opts.body, token: opts.token });
}
