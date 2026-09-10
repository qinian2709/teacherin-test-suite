/**
 * LMS contents 解析与默认单元 id 获取。
 */
import type { TestInfo } from '@playwright/test';
import { Endpoints } from '../api/endpoints.js';
import { loggedGet } from '../api/logged-call.js';
import type { ApiHelper } from '../fixtures/api-helper.js';
import { pickStringField } from './ids.js';

function unwrapLmsUnits(body: unknown): Record<string, unknown>[] {
  if (!body || typeof body !== 'object') return [];
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  if (!data || typeof data !== 'object') return [];
  const nested = data as Record<string, unknown>;
  const lms = nested.lms ?? nested.LMS;
  if (!lms || typeof lms !== 'object') return [];
  const units = (lms as Record<string, unknown>).units;
  if (!Array.isArray(units)) return [];
  return units.filter((u): u is Record<string, unknown> => Boolean(u && typeof u === 'object'));
}

/** 与 go integrations 一致：2 个单元时取第二个（跳过无单元活动占位）。 */
export function pickDefaultLmsUnitId(body: unknown): string | undefined {
  const units = unwrapLmsUnits(body);
  if (units.length === 0) return undefined;
  const item = units.length >= 2 ? units[1]! : units[0]!;
  return pickStringField(item, 'unitId', 'unit_id');
}

/** POST /repos/{id}/lms 响应中的 unit_id */
export function pickLmsCreateUnitId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root;
  return pickStringField(nested, 'unit_id', 'unitId');
}

export async function fetchDefaultLmsUnitId(
  api: ApiHelper,
  testInfo: TestInfo,
  apiBaseURL: string,
  repoId: string,
): Promise<string> {
  const contents = await loggedGet(
    api,
    { testInfo, apiBaseURL, logName: 'LMS contents' },
    Endpoints.repo.contentsLms(repoId),
    { query: { ref: '', preview: '1', original: '1' } },
  );
  const unitId = pickDefaultLmsUnitId(contents.body);
  if (!unitId) throw new Error('contents_lms 响应无默认 unitId');
  return unitId;
}

/** invite/token 响应为 string data */
export function pickInviteToken(body: unknown): string | undefined {
  if (typeof body === 'string' && body.length > 0) return body;
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data;
  if (typeof data === 'string' && data.length > 0) return data;
  return pickStringField(root, 'token');
}

/** 从 GET /repos/{id}/cs 列表取 scoreId */
export function pickCustomScoreId(body: unknown, scoreName?: string): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  const list = Array.isArray(data) ? data : [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (scoreName) {
      const name = row.scoreName ?? row.score_name;
      if (name !== scoreName) continue;
    }
    const id = pickStringField(row, 'scoreId', 'score_id');
    if (id) return id;
  }
  return undefined;
}

/** 从 GET /repos/{id}/lit2/list 取 modelId */
export function pickLit2ModelId(body: unknown, modelName?: string): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  const list = Array.isArray(data) ? data : [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (modelName) {
      const name = row.modelName ?? row.model_name;
      if (name !== modelName) continue;
    }
    const id = pickStringField(row, 'modelId', 'model_id');
    if (id) return id;
  }
  return undefined;
}

/** GET /community 取第一条动态 id */
export function pickFirstCommunityId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  const list = Array.isArray(data) ? data : [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const id = pickStringField(item as Record<string, unknown>, 'id', 'community_id', 'communityId');
    if (id) return id;
  }
  return undefined;
}
