/**
 * MeterSphere 用户相关请求体。
 */
import { formatStandardTime, uniqueName } from '../utils/random.js';

/** POST /user/background */
export function buildUserBackgroundPayload(background: string): Record<string, unknown> {
  return { background };
}

/** POST /orgs/apply — 免费版组织申请（巡检用，可能因重复申请被拒） */
export function buildOrgApplyPayload(
  phone: string,
  nationCode = '86',
): Record<string, unknown> {
  return {
    name: `API巡检组织${uniqueName('')}`,
    orgType: 1,
    location: '北京',
    phoneNumber: phone,
    nationCode,
    email: `patrol-${Date.now()}@example.com`,
    license: 1,
    remark: 'teacherin-test-suite patrol',
  };
}

/** POST /system/feedback — 意见反馈（仅 env14 巡检） */
export function buildFeedbackPayload(content?: string): Record<string, unknown> {
  return {
    module: 0,
    type: 1,
    content: content ?? `API巡检意见反馈${formatStandardTime()}`,
    resource_urls: [],
  };
}

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
