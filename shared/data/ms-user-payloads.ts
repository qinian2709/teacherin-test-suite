/**
 * MeterSphere 用户相关请求体。
 */
import { formatStandardTime } from '../utils/random.js';

/** MS「更新修改个人信息」：POST /user/settings/patch */
export function buildUserSettingsPatchPayload(
  username: string,
  topicIds: number[] = [],
): Record<string, unknown> {
  return {
    username,
    description: `patrol-${formatStandardTime()}`,
    location: '1',
    avatar: '',
    topics: topicIds,
  };
}
