import { expect } from '@playwright/test';
import { API_MAX_RESPONSE_MS } from '../../config/api.js';

export function resolveMaxApiResponseMs(override?: number): number {
  return override ?? API_MAX_RESPONSE_MS;
}

/**
 * 断言单次接口响应耗时未超限。
 * 用 expect（非 throw），JUnit/企微记入「失败」failures，而非「错误」errors。
 */
export function assertApiResponseDuration(
  label: string,
  durationMs: number,
  maxDurationMs?: number,
): void {
  const max = resolveMaxApiResponseMs(maxDurationMs);
  if (max <= 0) return;
  expect(
    durationMs,
    `接口响应耗时 ${label}：${durationMs}ms（上限 ${max}ms）`,
  ).toBeLessThanOrEqual(max);
}
