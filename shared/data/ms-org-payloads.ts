/**
 * MeterSphere 组织成员/团队请求体（report c9b0f331…）。
 */
import { formatStandardTime } from '../utils/random.js';

/** MS「邀请成员加入组织」：POST /orgs/{orgid}/members（数组） */
export function buildInviteMemberPayload(
  phone: string,
  nationCode: string,
  username = 'Api邀请用户',
): unknown[] {
  return [
    {
      role: 1,
      team_ids: [] as number[],
      phone_number: phone,
      nation_code: nationCode,
      email: '',
      username,
    },
  ];
}

/** MS「更新组织成员昵称、角色」：POST /orgs/{orgid}/members/patch */
export function buildMemberPatchPayload(
  userId: string,
  role = 2,
  username?: string,
): Record<string, unknown> {
  return {
    user_id: Number(userId),
    role,
    username: username ?? `API编辑用户名称${formatStandardTime()}`,
  };
}

/** MS「创建团队」：POST /orgs/{orgid}/teams（名称 ≤24 字） */
export function buildCreateTeamPayload(name?: string): Record<string, unknown> {
  return {
    member_list: [] as number[],
    name: name ?? `Api团${formatStandardTime()}`,
    description: '',
  };
}

/** MS「修改团队名称/简介」：POST /orgs/{orgid}/teams/{teamid}/setting */
export function buildTeamSettingPayload(
  domain: 'name' | 'description' | 'can_invite_member',
  value: string,
): Record<string, unknown> {
  return { domain, value };
}

/** POST /orgs/{orgid}/teams/{teamid}/members/account/add */
export function buildTeamMemberAddByAccountPayload(
  phone: string,
  nationCode: string,
  username = 'Api邀请用户',
): Record<string, unknown> {
  return {
    phone_number: phone,
    nation_code: nationCode,
    userName: username,
    email: '',
  };
}

/** POST /orgs/{orgid}/teams/{teamid}/members/add */
export function buildTeamMemberAddBatchPayload(userIds: string[]): Record<string, unknown> {
  return { member_list: userIds.map((id) => Number(id)) };
}

/** POST /orgs/{orgid}/teams/{teamid}/members/delete */
export function buildTeamMemberRemovePayload(memberId: string): Record<string, unknown> {
  return { member_id: Number(memberId) };
}

/** POST /orgs/{orgid}/settings */
export function buildOrgSettingPayload(
  domain:
    | 'member_can_publish'
    | 'member_can_publish_fork'
    | 'can_create'
    | 'can_publish'
    | 'can_delete',
  enabled: boolean,
): Record<string, unknown> {
  return { domain, switch: enabled };
}

/** POST /orgs/{orgid}/patch — 仅改描述，避免动组织名 */
export function buildEditOrgPatchPayload(description: string): Record<string, unknown> {
  return {
    username: null,
    description,
    avatar: null,
    domain: null,
  };
}
