import type { CallOptions } from '../fixtures/api-helper.js';

export const INFRA_API_OPTS: CallOptions = { maxDurationMs: 0, step: false };

export function withInfraApiOpts(opts: CallOptions = {}): CallOptions {
  return { ...opts, maxDurationMs: 0, step: false };
}
