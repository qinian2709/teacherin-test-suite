import { test, type TestInfo } from '@playwright/test';
import { API_MAX_RESPONSE_MS } from '../../config/api.js';
import type { ApiHelper, CallOptions } from '../fixtures/api-helper.js';
import { assertApiResponseDuration } from '../http/duration.js';
import { attachApiCallLog } from './report.js';

/** @deprecated 请直接用 `@config` 的 `API_MAX_RESPONSE_MS`。 */
export const MAX_API_RESPONSE_MS = API_MAX_RESPONSE_MS;

export interface ApiLogOptions {
  testInfo: TestInfo;
  apiBaseURL: string;
  logName: string;
  assertions?: string[];
  maxDurationMs?: number;
}

export function buildApiRequestUrl(
  apiBaseURL: string,
  path: string,
  query?: CallOptions['query'],
): string {
  const url = new URL(
    `${apiBaseURL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`,
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function resolveMaxDurationMs(log: ApiLogOptions): number {
  return log.maxDurationMs ?? API_MAX_RESPONSE_MS;
}

async function attachLog(
  log: ApiLogOptions,
  method: string,
  url: string,
  requestBody: unknown,
  status: number,
  body: unknown,
  durationMs: number,
  requestHeaders: Record<string, string> = {},
  responseHeaders: Record<string, string> = {},
): Promise<void> {
  const maxDurationMs = resolveMaxDurationMs(log);
  const durationFailed = maxDurationMs > 0 && durationMs > maxDurationMs;
  const durationAssertion =
    maxDurationMs > 0
      ? [`响应耗时应 ≤ ${maxDurationMs}ms（实际 ${durationMs}ms）${durationFailed ? ' ✗' : ' ✓'}`]
      : [`响应耗时 ${durationMs}ms（耗时断言已关闭）`];
  await attachApiCallLog({
    testInfo: log.testInfo,
    name: log.logName,
    request: { method, url, headers: requestHeaders, body: requestBody ?? null },
    response: { status, headers: responseHeaders, body },
    durationMs,
    assertions: [...(log.assertions ?? []), ...durationAssertion],
    assertionFailed: durationFailed,
  });
}

function callOptsInsideLoggedStep(
  options: { query?: CallOptions['query']; headers?: Record<string, string>; data?: unknown } = {},
): CallOptions {
  return {
    ...options,
    maxDurationMs: 0,
    step: false,
  };
}

function assertLoggedDuration(log: ApiLogOptions, method: string, path: string, durationMs: number): void {
  assertApiResponseDuration(`${method} ${path}`, durationMs, log.maxDurationMs);
}

export async function loggedGet<T = unknown>(
  api: ApiHelper,
  log: ApiLogOptions,
  path: string,
  options: { query?: CallOptions['query']; headers?: Record<string, string> } = {},
): Promise<{ status: number; ok: boolean; body: T; durationMs: number }> {
  const url = buildApiRequestUrl(log.apiBaseURL, path, options.query);
  return test.step(`GET ${path}`, async () => {
    const result = await api.get<T>(path, callOptsInsideLoggedStep(options));
    await attachLog(
      log,
      'GET',
      url,
      null,
      result.status,
      result.body,
      result.durationMs,
      result.requestHeaders,
      result.responseHeaders,
    );
    assertLoggedDuration(log, 'GET', path, result.durationMs);
    return result;
  });
}

export async function loggedPost<T = unknown>(
  api: ApiHelper,
  log: ApiLogOptions,
  path: string,
  data?: unknown,
  options: { query?: CallOptions['query']; headers?: Record<string, string> } = {},
): Promise<{ status: number; ok: boolean; body: T; durationMs: number }> {
  const url = buildApiRequestUrl(log.apiBaseURL, path, options.query);
  return test.step(`POST ${path}`, async () => {
    const result = await api.post<T>(path, data, callOptsInsideLoggedStep(options));
    await attachLog(
      log,
      'POST',
      url,
      data ?? null,
      result.status,
      result.body,
      result.durationMs,
      result.requestHeaders,
      result.responseHeaders,
    );
    assertLoggedDuration(log, 'POST', path, result.durationMs);
    return result;
  });
}

export async function loggedRaw(
  api: ApiHelper,
  log: ApiLogOptions,
  method: 'get' | 'post',
  path: string,
  options: { data?: unknown; query?: CallOptions['query']; headers?: Record<string, string> } = {},
): Promise<{ status: number; body: unknown; durationMs: number }> {
  const url = buildApiRequestUrl(log.apiBaseURL, path, options.query);
  return test.step(`${method.toUpperCase()} ${path}`, async () => {
    const res = await api.raw(method, path, callOptsInsideLoggedStep(options));
    const status = res.status();
    const durationMs = res.durationMs();
    let body: unknown;
    try {
      body = status === 200 ? await res.json() : await res.text();
    } catch {
      body = null;
    }
    await attachLog(
      log,
      method.toUpperCase(),
      url,
      options.data ?? null,
      status,
      body,
      durationMs,
      res.requestHeaders(),
      res.responseHeaders(),
    );
    assertLoggedDuration(log, method.toUpperCase(), path, durationMs);
    return { status, body, durationMs };
  });
}
