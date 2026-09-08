import { expect } from '@playwright/test';
import type { ApiResponse } from '../http/client';

export function expectOk(res: ApiResponse): void {
  expect(res.ok, `API ${res.status}`).toBeTruthy();
}
