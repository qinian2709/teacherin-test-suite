import { Endpoints } from '../api/endpoints.js';
import type { ApiHelper } from '../fixtures/api-helper.js';
import type { DataRegistry } from './cleanup.js';
import { pickNumericId } from './ids.js';
import { INFRA_API_OPTS } from './infra.js';
import {
  buildCreateTeamPayload,
  buildInviteMemberPayload,
} from './ms-org-payloads.js';

export interface ResolvedUser {
  userId: string;
  username: string;
}

export interface ProvisionedTeam {
  teamId: string;
  name: string;
}

function fail(action: string, method: string, path: string, status: number, body: unknown): never {
  throw new Error(`${action}失败 ${method} ${path} HTTP ${status} body=${JSON.stringify(body)}`);
}

function businessCode(body: unknown): number | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const code = (body as { code?: unknown }).code;
  return typeof code === 'number' ? code : undefined;
}

function unwrapData(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const root = body as Record<string, unknown>;
  if (root.data !== undefined && root.data !== null) return root.data;
  return body;
}

export function pickUserId(body: unknown): string | undefined {
  return pickNumericId(body) ?? pickNumericId(unwrapData(body));
}

export function pickTeamId(body: unknown): string | undefined {
  const data = unwrapData(body);
  if (!data || typeof data !== 'object') return pickNumericId(body);
  const root = data as Record<string, unknown>;
  const team = root.team;
  if (team && typeof team === 'object') {
    const id = pickNumericId(team);
    if (id) return id;
  }
  return pickNumericId(data) ?? pickNumericId(body);
}

/** GET /user/search?phone_number=&nation_code= */
export async function resolveUserByPhone(
  api: ApiHelper,
  phone: string,
  nationCode: string,
): Promise<ResolvedUser> {
  const path = Endpoints.user.search;
  const result = await api.get(path, {
    ...INFRA_API_OPTS,
    query: { phone_number: phone, nation_code: nationCode },
  });
  const code = businessCode(result.body);
  if (!result.ok || (code !== undefined && code !== 0)) {
    fail('搜索用户', 'GET', path, result.status, result.body);
  }
  const userId = pickUserId(result.body);
  if (!userId) fail('搜索用户（无 id）', 'GET', path, result.status, result.body);
  const data = unwrapData(result.body) as Record<string, unknown>;
  const username =
    typeof data.username === 'string' && data.username.length > 0 ? data.username : 'Api邀请用户';
  return { userId, username };
}

export async function removeOrgMember(
  api: ApiHelper,
  orgId: string,
  userId: string,
): Promise<void> {
  const path = Endpoints.org.memberDelete(orgId, userId);
  const result = await api.post(path, {}, INFRA_API_OPTS);
  if (!result.ok && result.status >= 500) {
    fail('移除组织成员', 'POST', path, result.status, result.body);
  }
}

/** 邀请成员；注册 cleanup 移除。已存在则先删再邀。 */
export async function inviteOrgMember(
  api: ApiHelper,
  data: DataRegistry,
  orgId: string,
  phone: string,
  nationCode: string,
): Promise<ResolvedUser> {
  const user = await resolveUserByPhone(api, phone, nationCode);
  await removeOrgMember(api, orgId, user.userId);

  const path = Endpoints.org.members(orgId);
  const payload = buildInviteMemberPayload(phone, nationCode);
  const result = await api.post(path, payload, INFRA_API_OPTS);
  const code = businessCode(result.body);
  if (!result.ok || (code !== undefined && code !== 0)) {
    fail('邀请组织成员', 'POST', path, result.status, result.body);
  }

  data.register(`remove-org-member-${orgId}-${user.userId}`, async () => {
    await removeOrgMember(api, orgId, user.userId);
  });
  return user;
}

export async function deleteOrgTeam(api: ApiHelper, orgId: string, teamId: string): Promise<void> {
  const path = Endpoints.org.teamDelete(orgId, teamId);
  const result = await api.post(path, {}, INFRA_API_OPTS);
  if (!result.ok && result.status >= 500) {
    fail('解散团队', 'POST', path, result.status, result.body);
  }
}

export async function createOrgTeam(
  api: ApiHelper,
  data: DataRegistry,
  orgId: string,
  name?: string,
): Promise<ProvisionedTeam> {
  const payload = buildCreateTeamPayload(name);
  const path = Endpoints.org.teams(orgId);
  const result = await api.post(path, payload, INFRA_API_OPTS);
  const code = businessCode(result.body);
  if (!result.ok || (code !== undefined && code !== 0)) {
    fail('创建团队', 'POST', path, result.status, result.body);
  }
  const teamId = pickTeamId(result.body);
  if (!teamId) fail('创建团队（无 id）', 'POST', path, result.status, result.body);
  const teamName = String(payload.name);

  data.register(`delete-org-team-${orgId}-${teamId}`, async () => {
    await deleteOrgTeam(api, orgId, teamId);
  });
  return { teamId, name: teamName };
}

/** 从团队成员列表响应中取指定 user 的 member_id */
export function pickTeamMemberId(body: unknown, userId: string): string | undefined {
  const data = unwrapData(body);
  const lists: unknown[] = [];
  if (Array.isArray(data)) lists.push(...data);
  if (data && typeof data === 'object') {
    const root = data as Record<string, unknown>;
    for (const key of ['members', 'list', 'data']) {
      const value = root[key];
      if (Array.isArray(value)) lists.push(...value);
    }
  }
  for (const item of lists) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const uid = row.user_id ?? row.userId ?? row.uid;
    if (String(uid) !== userId) continue;
    const memberId = row.member_id ?? row.id ?? row.ID;
    if (typeof memberId === 'number' && memberId > 0) return String(memberId);
    if (typeof memberId === 'string' && /^\d+$/.test(memberId)) return memberId;
  }
  return undefined;
}
