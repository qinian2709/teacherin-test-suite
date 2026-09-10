import { expect } from '@playwright/test';
import { isEnvelope, SUCCESS_CODE } from '../http/types.js';
import type { HttpResult } from '../http/types.js';

export function expectOk(res: HttpResult): void {
  expect(res.ok, `API HTTP ${res.status}`).toBeTruthy();
}

export function expectEnvelopeSuccess(body: unknown): void {
  expect(isEnvelope(body), '响应应为 {code,msg,data} 信封').toBeTruthy();
  if (isEnvelope(body)) {
    expect(body.code, `业务 code=${body.code} msg=${body.msg}`).toBe(SUCCESS_CODE);
  }
}

/** GET 读接口：HTTP 200；若有信封则 code=0。 */
export function expectApiGetSuccess(status: number, body: unknown): void {
  expect(status, `HTTP ${status}`).toBe(200);
  if (isEnvelope(body)) {
    expect(body.code, `业务 code=${body.code} msg=${body.msg}`).toBe(SUCCESS_CODE);
  }
}

/** POST 写接口：HTTP 2xx；若有信封则 code=0。 */
export function expectApiWriteSuccess(status: number, body: unknown): void {
  expect(status, `HTTP ${status}`).toBeGreaterThanOrEqual(200);
  expect(status, `HTTP ${status}`).toBeLessThan(300);
  if (isEnvelope(body)) {
    expect(body.code, `业务 code=${body.code} msg=${body.msg}`).toBe(SUCCESS_CODE);
  }
}
