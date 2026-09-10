/**
 * MeterSphere 用户相关请求体。
 */

function msTimeSuffix(): string {
  return String(Date.now());
}

/** MS「更新修改个人信息」：POST /user/settings/patch */
export function buildUserSettingsPatchPayload(
  username: string,
  topicIds: number[] = [],
): Record<string, unknown> {
  return {
    username,
    description: `patrol-${msTimeSuffix()}`,
    location: '1',
    avatar: '',
    topics: topicIds,
  };
}
