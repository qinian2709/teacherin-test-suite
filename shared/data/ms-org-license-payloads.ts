/**
 * MeterSphere 组织授权/买家列表请求体。
 * 对齐 go-git CreateUserLicenseOption / AddLicenseRepoOption。
 */

/** POST /orgs/{orgid}/license — 添加被授权个人（user_type: 0=用户） */
export function buildCreateUserLicensePayload(
  phone: string,
  username: string,
): Record<string, unknown> {
  return {
    contact: phone,
    user_name: username,
    account: '',
    org_name: '',
    user_type: 0,
  };
}

/** POST /orgs/{orgid}/license/repos — 给个人授权课程（user_type: 0=个人用户） */
export function buildAddLicenseRepoPayload(
  targetUserId: string,
  repoId: string,
  times = 1,
): Record<string, unknown> {
  return {
    target_id: Number(targetUserId),
    user_type: 0,
    ids: [Number(repoId)],
    expire_unix: 0,
    times,
    sellType: 0,
  };
}
