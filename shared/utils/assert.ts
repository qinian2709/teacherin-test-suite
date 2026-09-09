import { expect } from '@playwright/test';
import { isEnvelope } from '../http/types.js';
import type { HttpResult } from '../http/types.js';

export function expectOk(res: HttpResult): void {
  expect(res.ok, `API HTTP ${res.status}`).toBeTruthy();
}

export function expectEnvelopeSuccess(body: unknown): void {
  expect(isEnvelope(body), '响应应为 {code,msg,data} 信封').toBeTruthy();
  if (isEnvelope(body)) {
    expect(body.code, `业务 code=${body.code} msg=${body.msg}`).toBe(0);
  }
}
